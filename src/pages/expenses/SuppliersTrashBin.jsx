import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const SuppliersTrashBin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [deletedSuppliers, setDeletedSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTrash, setSearchTrash] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });
        
      if (error) throw error;
      setDeletedSuppliers(data || []);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error loading deleted suppliers:', error);
      toast({ title: 'Error', description: 'Failed to load deleted suppliers.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleRestore = async (supplierId) => {
    if (!window.confirm("Restore this supplier?")) return;
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', supplierId);
        
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Supplier restored successfully.' });
      loadSuppliers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to restore supplier.', variant: 'destructive' });
    }
  };

  const handlePermanentDelete = async (supplierId) => {
    if (!window.confirm("Permanently delete this supplier? This action cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);
        
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Supplier permanently deleted.' });
      loadSuppliers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to permanently delete supplier.', variant: 'destructive' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.size} supplier(s)? This action cannot be undone.`)) return;
    
    try {
      const idsArray = Array.from(selectedIds);
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .in('id', idsArray);
        
      if (error) throw error;
      
      toast({ title: 'Success', description: `${selectedIds.size} supplier(s) permanently deleted.` });
      loadSuppliers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete selected suppliers.', variant: 'destructive' });
    }
  };

  const handleSelectAll = (e, filteredData) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredData.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const filteredDeleted = deletedSuppliers.filter(s => 
    s.company_name?.toLowerCase().includes(searchTrash.toLowerCase()) ||
    s.tin_number?.toLowerCase().includes(searchTrash.toLowerCase()) ||
    s.address?.toLowerCase().includes(searchTrash.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading trash bin...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-red-100 pb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/expenses/suppliers')}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h1 className="text-3xl font-bold text-slate-800">Suppliers Trash Bin</h1>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Manage deleted suppliers</p>
          </div>
        </div>
      </div>

      {/* Tabs / Filters area */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            className="text-gray-500 hover:text-gray-900" 
            onClick={() => navigate('/expenses/suppliers')}
          >
            Active Suppliers
          </Button>
          <Button 
            variant="secondary" 
            className="bg-red-50 text-red-700 hover:bg-red-100 font-semibold"
          >
            Trash Bin
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <span className="text-sm font-medium text-red-800">{selectedIds.size} items selected</span>
              <Button onClick={handleBulkDelete} variant="destructive" size="sm" className="font-semibold shadow-sm">
                Delete Selected
              </Button>
            </div>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-red-400" />
            <input 
              type="text" 
              placeholder="Search trash..." 
              value={searchTrash}
              onChange={(e) => setSearchTrash(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-red-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 bg-white outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-red-50/50 text-red-900 border-b border-red-100">
                <th className="px-4 py-3 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-red-300 text-red-600 focus:ring-red-500 w-4 h-4"
                    checked={filteredDeleted.length > 0 && selectedIds.size === filteredDeleted.length}
                    onChange={(e) => handleSelectAll(e, filteredDeleted)}
                  />
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">TIN / Contact</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Address / Details</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Deleted Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-50">
              {filteredDeleted.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Trash2 className="w-12 h-12 text-red-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No deleted suppliers found.</p>
                  </td>
                </tr>
              ) : (
                filteredDeleted.map(s => (
                  <tr key={s.id} className="hover:bg-red-50/30 transition-colors group">
                    <td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-red-300 text-red-600 focus:ring-red-500 w-4 h-4"
                        checked={selectedIds.has(s.id)}
                        onChange={() => handleSelectOne(s.id)}
                      />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-gray-700 line-through decoration-red-300">
                        {s.company_name}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-gray-500">
                      {s.tin_number || '-'}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-gray-500 max-w-[200px] truncate">
                      {s.address || '-'}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-gray-500">
                      {s.deleted_at ? new Date(s.deleted_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRestore(s.id)} 
                          className="h-8 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Restore
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePermanentDelete(s.id)} 
                          className="h-8 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
};

export default SuppliersTrashBin;