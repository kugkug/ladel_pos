import React, { useContext, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { CustomerContext } from '@/contexts/CustomerContext';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Search, Plus, Eye, Edit, Trash2, Users, ArrowUpDown, Database, RefreshCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import EditCustomerModal from '@/components/EditCustomerModal';
import CustomerDetailsModal from '@/components/CustomerDetailsModal';
import CustomerTrashBin from '@/components/CustomerTrashBin';
import { migrateCustomerData } from '@/lib/customerMigration';

const CustomerListsPage = () => {
  const { 
    customers, 
    trashCustomers, 
    isLoading,
    error,
    deleteCustomer, 
    restoreCustomer, 
    permanentlyDeleteCustomer,
    fetchCustomers
  } = useContext(CustomerContext);
  
  const { projects = [], invoices = [], acknowledgementReceipts = [] } = useContext(ProjectContext);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [isMigrating, setIsMigrating] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'company_name', direction: 'asc' });

  // Calculate metrics for a customer
  const getCustomerMetrics = (customerId) => {
    const custProjects = projects.filter(p => p.customerId === customerId);
    const totalProjects = custProjects.length;
    
    let totalARBalance = 0;
    custProjects.forEach(p => {
      const projInvoices = invoices.filter(i => i.projectId === p.id);
      projInvoices.forEach(inv => {
        const ar = acknowledgementReceipts.find(a => a.projectId === p.id);
        if (!ar || (ar.arStatus !== 'Paid' && ar.arStatus !== 'Completed' && ar.arStatus !== 'Completed AR')) {
          totalARBalance += Number(inv.grossAmount || 0);
        }
      });
    });

    const dates = custProjects.map(p => new Date(p.createdAt || 0)).sort((a,b) => b - a);
    const lastDate = dates.length > 0 ? dates[0].toLocaleDateString() : 'N/A';

    return { totalProjects, totalARBalance, lastDate };
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedCustomers = useMemo(() => {
    if (!customers) return [];
    
    let filtered = customers.filter(c => 
      (c.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.contact_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.contact_email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';

      if (sortConfig.key === 'totalProjects' || sortConfig.key === 'totalARBalance') {
        const aMetrics = getCustomerMetrics(a.id);
        const bMetrics = getCustomerMetrics(b.id);
        aValue = aMetrics[sortConfig.key];
        bValue = bMetrics[sortConfig.key];
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, searchQuery, sortConfig, projects, invoices, acknowledgementReceipts]);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to move this customer to the trash?')) {
      try {
        await deleteCustomer(id);
        toast({ title: "Moved to Trash", description: "Customer has been moved to the trash bin." });
      } catch (err) {
        toast({ title: "Error", description: err.message || "Failed to delete customer.", variant: "destructive" });
      }
    }
  };

  const emptyTrash = async () => {
    if(window.confirm('Are you sure you want to permanently delete all customers in the trash?')) {
      for (const c of trashCustomers) {
        try {
          await permanentlyDeleteCustomer(c.id);
        } catch (err) {
          console.error("Failed to permanently delete:", c.id, err);
        }
      }
      toast({ title: "Trash Emptied", description: "All trashed customers have been permanently deleted." });
    }
  };

  const handleRunMigration = async () => {
    setIsMigrating(true);
    toast({ title: "Migration Started", description: "Syncing data to Supabase..." });
    const result = await migrateCustomerData();
    if (result.success) {
      toast({ title: "Migration Complete", description: `Successfully migrated ${result.migratedCount} customers.` });
      fetchCustomers();
    } else {
      toast({ title: "Migration Error", description: result.error, variant: "destructive" });
    }
    setIsMigrating(false);
  };

  const activeCount = customers?.filter(c => c.status === 'Active').length || 0;
  const inactiveCount = customers?.filter(c => c.status === 'Inactive').length || 0;

  const SortableHeader = ({ label, sortKey }) => (
    <th 
      className="px-4 py-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#2C3E50]/80 transition-colors select-none"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortConfig.key === sortKey ? 'text-white' : 'text-white/50'}`} />
      </div>
    </th>
  );

  return (
    <>
      <Helmet><title>Customer Lists - ProjectManager</title></Helmet>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1B4D5C] p-2.5 rounded-xl shadow-md"><Users className="w-6 h-6 text-white"/></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Lists</h1>
              <p className="text-gray-500 mt-1">Comprehensive directory of all clients and their metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRunMigration} disabled={isMigrating || isLoading} variant="outline" className="hidden md:flex border-gray-300">
              <Database className={`w-4 h-4 mr-2 ${isMigrating ? 'animate-pulse text-blue-500' : 'text-gray-500'}`} /> 
              {isMigrating ? 'Migrating...' : 'Run Data Migration'}
            </Button>
            <Button onClick={() => { setEditingCustomer(null); setIsEditModalOpen(true); }} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105 font-bold">
              <Plus className="w-5 h-5 mr-2" /> Add New Customer
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium text-sm">{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchCustomers} className="border-red-200 text-red-700 hover:bg-red-100">
              <RefreshCcw className="w-4 h-4 mr-2" /> Retry Connection
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button onClick={() => setActiveTab('active')} className={`pb-2 px-2 font-bold text-sm transition-all duration-300 ${activeTab === 'active' ? 'border-b-[3px] border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
            Active Directory ({customers?.length || 0})
          </button>
          <button onClick={() => setActiveTab('trash')} className={`pb-2 px-2 font-bold text-sm transition-all duration-300 flex items-center ${activeTab === 'trash' ? 'border-b-[3px] border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-900'}`}>
            Trash Bin ({trashCustomers?.length || 0})
          </button>
        </div>

        {/* Search & Filters */}
        {activeTab === 'active' && (
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
            <div className="relative w-full md:w-1/3 min-w-[300px]">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by company or contact name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 focus:bg-white outline-none transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex gap-3 text-sm">
              <span className="bg-green-50 border border-green-200 text-green-800 px-4 py-1.5 rounded-full font-bold shadow-sm">Active: {activeCount}</span>
              <span className="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-1.5 rounded-full font-bold shadow-sm">Inactive: {inactiveCount}</span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {activeTab === 'active' ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1B4D5C] text-white">
                    <SortableHeader label="Company" sortKey="company_name" />
                    <SortableHeader label="Contact Name" sortKey="contact_name" />
                    <SortableHeader label="Email / Phone" sortKey="contact_email" />
                    <SortableHeader label="Projects" sortKey="totalProjects" />
                    <SortableHeader label="AR Balance" sortKey="totalARBalance" />
                    <SortableHeader label="Status" sortKey="status" />
                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-16">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-500 font-medium text-sm">Loading customer directory...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAndSortedCustomers.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-16 text-gray-500 font-medium text-lg">No customers match your search criteria.</td></tr>
                  ) : (
                    filteredAndSortedCustomers.map(c => {
                      const metrics = getCustomerMetrics(c.id);
                      return (
                        <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-4 py-4 align-top">
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base">{c.company_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{c.company_tin || 'No TIN'}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="text-sm font-bold text-gray-900">{c.contact_name}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="text-sm text-gray-600">{c.contact_email || 'No email'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{c.contact_phone || 'No phone'}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-blue-50 text-blue-700 rounded-lg font-bold">
                              {metrics.totalProjects}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className={`text-base font-bold ${metrics.totalARBalance > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                              ₱{metrics.totalARBalance.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${c.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                              {c.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top text-right">
                            <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" onClick={() => { setViewingCustomer(c); setIsDetailsModalOpen(true); }} className="h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { setEditingCustomer(c); setIsEditModalOpen(true); }} className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Edit">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-8 w-8 text-red-600 hover:bg-red-50" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <CustomerTrashBin 
            trashCustomers={trashCustomers} 
            onRestore={restoreCustomer} 
            onPermanentlyDelete={permanentlyDeleteCustomer}
            onEmptyTrash={emptyTrash}
          />
        )}
      </div>

      <EditCustomerModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        initialData={editingCustomer} 
      />

      <CustomerDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        customer={viewingCustomer} 
        metrics={viewingCustomer ? getCustomerMetrics(viewingCustomer.id) : null}
      />
    </>
  );
};

export default CustomerListsPage;