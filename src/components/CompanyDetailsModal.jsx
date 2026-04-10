import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Hash, Plus, Edit, Trash2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { CompanyContext } from '@/contexts/CompanyContext';
import ContactFormModal from './ContactFormModal';

const CompanyDetailsModal = ({ isOpen, onClose, company, onEditCompany }) => {
  const { getCompanyContacts, deleteContact, setPrimaryContact } = useContext(CompanyContext);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    if (isOpen && company?.id) {
      loadContacts();
    }
  }, [isOpen, company]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const data = await getCompanyContacts(company.id);
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.contact_name}?${contact.is_primary ? '\nIf this is the primary contact, another one will be set automatically.' : ''}`)) {
      await deleteContact(contact.id);
      loadContacts();
    }
  };

  const handleSetPrimary = async (contactId) => {
    await setPrimaryContact(contactId, company.id);
    loadContacts();
  };

  if (!company) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl bg-white p-0 overflow-hidden shadow-2xl h-[80vh] flex flex-col">
          <DialogHeader className="p-6 bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg"><Building2 className="w-6 h-6 text-blue-600" /></div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">{company.company_name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${company.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {company.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEditCompany(company)} className="border-gray-200">
              <Edit className="w-4 h-4 mr-2" /> Edit Company Info
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
            {/* Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <div className="space-y-4">
                <div className="flex gap-3 text-sm">
                  <Hash className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Tax ID Number</p>
                    <p className="text-gray-900 font-medium">{company.company_tin || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Company Address</p>
                    <p className="text-gray-900 font-medium">{company.company_address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">Internal Notes</p>
                <p className="text-gray-700 text-sm bg-white p-3 rounded-lg border border-gray-200 min-h-[4rem]">
                  {company.notes || 'No notes added.'}
                </p>
              </div>
            </div>

            {/* Contacts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-lg font-bold text-gray-900">Contact Persons</h3>
                <Button size="sm" onClick={() => { setEditingContact(null); setIsContactModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-1" /> Add Contact
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">No contacts found for this company.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Contact Info</th>
                        <th className="px-4 py-3 text-center">Primary</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {contacts.map(contact => (
                        <tr key={contact.id} className={`hover:bg-blue-50/30 transition-colors ${contact.is_primary ? 'bg-blue-50/10' : ''}`}>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {contact.contact_name}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {contact.role_title || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 space-y-1">
                            {contact.contact_email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {contact.contact_email}</div>}
                            {contact.contact_phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> {contact.contact_phone}</div>}
                            {!contact.contact_email && !contact.contact_phone && <span className="text-gray-400 italic">None provided</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {contact.is_primary ? (
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs font-bold">
                                <ShieldCheck className="w-3 h-3"/> Primary
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleSetPrimary(contact.id)}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Set Primary
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingContact(contact); setIsContactModalOpen(true); }} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact)} className="h-8 w-8 text-red-600 hover:bg-red-50">
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
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ContactFormModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        companyId={company?.id}
        initialData={editingContact}
        onSuccess={loadContacts}
      />
    </>
  );
};

export default CompanyDetailsModal;