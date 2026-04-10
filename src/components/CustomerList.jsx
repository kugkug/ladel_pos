import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const CustomerList = ({ customers, onEdit, onDelete, searchQuery }) => {
  const filtered = customers.filter(c => 
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-4 text-sm font-semibold text-gray-700">Company Name</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700">Address</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700">TIN</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700">Primary Contact</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="5" className="text-center py-8 text-gray-500">No customers found.</td></tr>
          ) : (
            filtered.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">{c.companyName}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{c.address || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{c.tin || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{c.contacts?.[0]?.name || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(c)}><Edit className="w-4 h-4 text-blue-600"/></Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)}><Trash2 className="w-4 h-4 text-red-600"/></Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;