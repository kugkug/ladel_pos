import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, User, MapPin, Phone, Mail, Hash } from 'lucide-react';

const CustomerDetailsModal = ({ isOpen, onClose, customer, metrics }) => {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="border-b border-gray-100 p-6 bg-gray-50">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Customer Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{customer.company_name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {customer.status || 'Active'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs font-medium">TIN</p>
                <p className="text-gray-900 font-medium">{customer.company_tin || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs font-medium">Company Address</p>
                <p className="text-gray-900 font-medium">{customer.company_address || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-3 mt-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Person</p>
              <div className="flex items-start gap-3 text-sm mb-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">{customer.contact_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm mb-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">{customer.contact_email || 'No email'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">{customer.contact_phone || 'No phone'}</p>
                </div>
              </div>
            </div>
            
            {metrics && (
              <div className="border-t border-gray-100 pt-3 mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs font-medium">Total Projects</p>
                  <p className="text-gray-900 font-bold text-lg">{metrics.totalProjects}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">AR Balance</p>
                  <p className="text-blue-600 font-bold text-lg">₱{metrics.totalARBalance?.toLocaleString()}</p>
                </div>
              </div>
            )}

            {customer.notes && (
              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="text-gray-500 text-xs font-medium mb-1">Notes</p>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;