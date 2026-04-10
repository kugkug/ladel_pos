import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { CustomerContext } from '@/contexts/CustomerContext';
import { ProjectContext } from '@/contexts/ProjectContext';
import CustomerForm from '@/components/CustomerForm';
import { Search, Plus, Eye, Edit, Trash2, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const CustomerInfoPage = () => {
  const { customers, trashCustomers, addCustomer, updateCustomer, deleteCustomer, restoreCustomer, permanentlyDeleteCustomer } = useContext(CustomerContext);
  const { projects, invoices, acknowledgementReceipts } = useContext(ProjectContext);
  
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showForm, setShowForm] = useState(false);

  const getCustomerMetrics = (customerId) => {
    const custProjects = projects.filter(p => p.customerId === customerId);
    const totalProjects = custProjects.length;
    
    let totalARBalance = 0;
    custProjects.forEach(p => {
      const projInvoices = invoices.filter(i => i.projectId === p.id);
      projInvoices.forEach(inv => {
        const ar = acknowledgementReceipts.find(a => a.projectId === p.id);
        if (!ar || ar.arStatus !== 'Paid') {
          totalARBalance += Number(inv.grossAmount || 0);
        }
      });
    });

    const dates = custProjects.map(p => new Date(p.createdAt || 0)).sort((a,b) => b - a);
    const lastDate = dates.length > 0 ? dates[0].toLocaleDateString() : 'N/A';

    return { totalProjects, totalARBalance, lastDate };
  };

  const handleFormSubmit = (data) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
      setEditingCustomer(null);
    }
    setShowForm(false);
  };

  const targetList = activeTab === 'active' ? customers : trashCustomers;
  
  const filtered = targetList.filter(c => 
    (c.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const activeCount = customers.filter(c => c.status === 'Active').length;
  const inactiveCount = customers.filter(c => c.status === 'Inactive').length;

  return (
    <>
      <Helmet>
        <title>Customer Info - ProjectManager</title>
      </Helmet>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-accent">Customer Directory</h1>
            <p className="text-muted-foreground mt-1">Manage client records, metrics, and contact details</p>
          </div>
          <Button onClick={() => { setEditingCustomer(null); setShowForm(true); }} className="bg-primary hover:bg-primary/90 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Add New Customer
          </Button>
        </div>

        <div className="flex gap-4 border-b border-muted">
          <button onClick={() => setActiveTab('active')} className={`pb-2 px-1 font-semibold text-sm transition-all duration-300 ${activeTab === 'active' ? 'border-b-[3px] border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Active Directory ({customers.length})
          </button>
          <button onClick={() => setActiveTab('trash')} className={`pb-2 px-1 font-semibold text-sm transition-all duration-300 flex items-center ${activeTab === 'trash' ? 'border-b-[3px] border-destructive text-destructive' : 'text-muted-foreground hover:text-foreground'}`}>
            Trash Bin ({trashCustomers.length})
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-muted shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by customer or company name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-muted rounded-lg text-foreground focus:ring-2 focus:ring-primary bg-muted/20 outline-none transition-all"
            />
          </div>
          {activeTab === 'active' && (
            <div className="flex gap-4 text-sm">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">Active: {activeCount}</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-semibold">Inactive: {inactiveCount}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-muted shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent text-white">
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">Customer / Company</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">Contact Details</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">Projects</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">AR Balance</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">Last Tx</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-12 text-muted-foreground font-medium">No customers found.</td></tr>
                ) : (
                  filtered.map(c => {
                    const metrics = getCustomerMetrics(c.id);
                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-accent group-hover:text-primary transition-colors">{c.customerName || c.companyName}</p>
                          <p className="text-sm text-muted-foreground">{c.companyName}</p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="text-sm font-medium text-foreground">{c.contactPerson || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{c.phone || c.email || 'No contact info'}</p>
                        </td>
                        <td className="px-4 py-4 align-top text-sm font-bold text-foreground">{metrics.totalProjects}</td>
                        <td className="px-4 py-4 align-top text-sm font-bold text-primary">₱{metrics.totalARBalance.toLocaleString()}</td>
                        <td className="px-4 py-4 align-top text-sm text-muted-foreground">{metrics.lastDate}</td>
                        <td className="px-4 py-4 align-top">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-4 align-top text-right">
                          {activeTab === 'active' ? (
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setViewCustomer(c)} className="text-secondary hover:text-accent p-1.5 rounded-md hover:bg-secondary/20 transition-colors"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => { setEditingCustomer(c); setShowForm(true); }} className="text-accent hover:text-primary p-1.5 rounded-md hover:bg-primary/10 transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => { if(window.confirm('Delete customer?')) deleteCustomer(c.id); }} className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1">
                              <button onClick={() => restoreCustomer(c.id)} className="text-green-600 hover:text-green-700 p-1.5 rounded-md hover:bg-green-50 transition-colors" title="Restore"><RefreshCw className="w-4 h-4" /></button>
                              <button onClick={() => { if(window.confirm('Permanently delete?')) permanentlyDeleteCustomer(c.id); }} className="text-destructive hover:text-red-700 p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Permanent Delete"><AlertTriangle className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl">
          <CustomerForm initialData={editingCustomer} onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && setViewCustomer(null)}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl">
          {viewCustomer && (
            <>
              <DialogHeader className="border-b border-muted pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-2xl font-bold text-accent">Customer Details</DialogTitle>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${viewCustomer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{viewCustomer.status}</span>
                </div>
              </DialogHeader>
              <div className="space-y-6 pb-6">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-muted/20 p-5 rounded-xl border border-muted/50">
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Customer Name</p><p className="font-bold text-foreground text-lg">{viewCustomer.customerName || 'N/A'}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Company</p><p className="font-semibold text-foreground">{viewCustomer.companyName || 'N/A'}</p></div>
                  
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Contact Person</p><p className="font-semibold text-foreground">{viewCustomer.contactPerson || 'N/A'}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Phone</p><p className="font-semibold text-foreground">{viewCustomer.phone || 'N/A'}</p></div>
                  
                  <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Email</p><p className="font-semibold text-foreground">{viewCustomer.email || 'N/A'}</p></div>
                  <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Address</p><p className="font-semibold text-foreground">{viewCustomer.address || 'N/A'}</p></div>
                  
                  {viewCustomer.notes && (
                    <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Notes</p><p className="text-sm bg-white p-3 rounded-lg border border-muted">{viewCustomer.notes}</p></div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerInfoPage;