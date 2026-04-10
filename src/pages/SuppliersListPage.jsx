import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupplierContext } from '@/contexts/SupplierContext';
import { Search, Plus, Eye, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddEditSupplierModal from '@/components/AddEditSupplierModal';

const SuppliersListPage = () => {
  const { suppliers, isLoading, removeSupplier } = useContext(SupplierContext);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'company_name', direction: 'asc' });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter(s => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = s.company_name.toLowerCase().includes(query) ||
                            (s.tin_number && s.tin_number.toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [suppliers, searchQuery, statusFilter, sortConfig]);

  const handleDelete = async (supplier) => {
    if(window.confirm(`Are you sure you want to delete ${supplier.company_name}?`)) {
      await removeSupplier(supplier.id);
    }
  };

  const openEdit = (supplier) => {
    setEditingSupplier(supplier);
    setIsFormModalOpen(true);
  };

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-1/3 min-w-[300px]">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by company name or TIN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <Button onClick={() => { setEditingSupplier(null); setIsFormModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-bold ml-auto md:ml-0">
            <Plus className="w-4 h-4 mr-2" /> Add New Supplier
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1B4D5C] text-white">
                <SortableHeader label="Company Name" sortKey="company_name" />
                <SortableHeader label="TIN Number" sortKey="tin_number" />
                <SortableHeader label="Address" sortKey="address" />
                <SortableHeader label="Status" sortKey="status" />
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filteredAndSortedSuppliers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-16 text-gray-500 font-medium">No suppliers found.</td></tr>
              ) : (
                filteredAndSortedSuppliers.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-4 align-top cursor-pointer" onClick={() => navigate(`/expenses/suppliers/${s.id}`)}>
                      <p className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">{s.company_name}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm text-gray-700">{s.tin_number || '-'}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{s.address || '-'}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm uppercase tracking-wider ${s.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/expenses/suppliers/${s.id}`)} className="h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(s)} className="h-8 w-8 text-red-600 hover:bg-red-50" title="Delete">
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
        onSuccess={() => {}}
      />
    </div>
  );
};

export default SuppliersListPage;