import React, { useState, useEffect, useContext } from 'react';
import { SupplierContext } from '@/contexts/SupplierContext';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus, Mail, Phone } from 'lucide-react';
import AddEditSupplierContactModal from './AddEditSupplierContactModal';

const SupplierContactsSection = ({ supplierId }) => {
  const { getSupplierContacts, removeSupplierContact } = useContext(SupplierContext);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const loadContacts = async () => {
    setIsLoading(true);
    const data = await getSupplierContacts(supplierId);
    setContacts(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (supplierId) {
      loadContacts();
    }
  }, [supplierId]);

  const handleDelete = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      await removeSupplierContact(contact.id, contact.name);
      loadContacts();
    }
  };

  const openAdd = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const openEdit = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#FF6B35] rounded-full inline-block"></span> Contact Persons
        </h2>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
          <UserPlus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full mb-4 shadow-sm text-blue-500 border border-blue-100">
            <UserPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No contacts found</h3>
          <p className="text-gray-500 text-sm">Add a contact person for this supplier.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Position</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Details</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map(contact => (
                <tr key={contact.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{contact.name}</td>
                  <td className="p-4 text-gray-600">{contact.position || '-'}</td>
                  <td className="p-4 text-gray-600 space-y-1">
                    {contact.email && <div className="flex items-center gap-1.5 text-sm"><Mail className="w-3.5 h-3.5 text-gray-400"/> {contact.email}</div>}
                    {contact.phone && <div className="flex items-center gap-1.5 text-sm"><Phone className="w-3.5 h-3.5 text-gray-400"/> {contact.phone}</div>}
                    {!contact.email && !contact.phone && <span className="text-gray-400 italic text-sm">None</span>}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${contact.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEdit(contact)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(contact)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddEditSupplierContactModal
        supplierId={supplierId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedContact}
        onSuccess={loadContacts}
      />
    </div>
  );
};

export default SupplierContactsSection;