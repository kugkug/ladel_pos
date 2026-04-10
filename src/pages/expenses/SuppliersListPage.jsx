import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Eye, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import AddEditSupplierModal from '@/components/AddEditSupplierModal';
import { exportToCSV, generateFilename } from '@/lib/csvExport';

const SuppliersListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeSuppliers, setActiveSuppliers] = useState([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [searchActive, setSearchActive] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch active suppliers
      const { data: activeData, error: activeError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_deleted', false)
        .order('company_name');
        
      if (activeError) throw activeError;
      
      // Fetch deleted suppliers count
      const { count, error: countError } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', true);
        
      if (countError) throw countError;

      setActiveSuppliers(activeData || []);
      setDeletedCount(count || 0);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast({ title: 'Error', description: 'Failed to load suppliers.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // Actions
  const handleSoftDelete = async (supplierId) => {
    if (!window.confirm("Move this supplier to trash?")) return;
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', supplierId);
        
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Supplier moved to trash.' });
      loadSuppliers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete supplier.', variant: 'destructive' });
    }
  };

  const openEdit = (supplier) => {
    setEditingSupplier(supplier);
    setIsFormModalOpen(true);
  };

  // Filters
  const filteredActive = activeSuppliers.filter(s => 
    s.company_name?.toLowerCase().includes(searchActive.toLowerCase()) ||
    s.tin_number?.toLowerCase().includes(searchActive.toLowerCase())
  );

  const handleExportSuppliers = () => {
    if (filteredActive.length === 0) {
      toast({ title: "Notice", description: "No suppliers to export." });
      return;
    }

    const headers = [
      "Supplier Name", 
      "Contact Person", 
      "Email", 
      "Phone", 
      "TIN", 
      "Address", 
      "City", 
      "Status", 
      "Date Created", 
      "Notes"
    ];

    const data = filteredActive.map(s => [
      s.company_name || '',
      s.contact_name || '',
      s.contact_email || '',
      s.contact_phone || '',
      s.tin_number || '',
      s.address || '',
      s.city || '',
      s.status || 'Active',
      s.created_at ? new Date(s.created_at).toLocaleDateString() : '',
      s.notes || ''
    ]);

    exportToCSV(data, generateFilename('Suppliers'), headers);
    toast({ title: "Success", description: `Exported ${filteredActive.length} suppliers successfully.` });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading suppliers...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage your supplier directory</p>
        </div>
        <div className="flex items-center gap-3">
          {deletedCount > 0 && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/expenses/suppliers/trash-bin')} 
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Trash Bin ({deletedCount})
            </Button>
          )}
          <Button onClick={handleExportSuppliers} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-bold">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => { setEditingSupplier(null); setIsFormModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-bold">
            <Plus className="w-4 h-4 mr-2" /> Add Supplier
          </Button>
        </div>
      </div>

      {/* Active Suppliers Section */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Active Suppliers</h2>
          <div className="relative w-full md:w-1/3 min-w-[300px]">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search active suppliers..." 
              value={searchActive}
              onChange={(e) => setSearchActive(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">TIN</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Address</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredActive.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500 text-sm">No active suppliers found.</td></tr>
              ) : (
                filteredActive.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3 align-top font-medium text-gray-900">{s.company_name}</td>
                    <td className="px-4 py-3 align-top text-sm text-gray-600">{s.tin_number || '-'}</td>
                    <td className="px-4 py-3 align-top text-sm text-gray-600 truncate max-w-[200px]">{s.address || '-'}</td>
                    <td className="px-4 py-3 align-top">
                      <span className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                        {s.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/expenses/suppliers/${s.id}`)} className="h-8 w-8 hover:bg-gray-100 text-gray-600" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="h-8 w-8 hover:bg-blue-50 text-blue-600" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleSoftDelete(s.id)} className="h-8 w-8 hover:bg-red-50 text-red-600" title="Move to Trash">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditSupplierModal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        initialData={editingSupplier} 
        onSuccess={loadSuppliers}
      />
    </div>
  );
};

export default SuppliersListPage;