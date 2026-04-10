import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SupplierContext } from '@/contexts/SupplierContext';
import { useToast } from '@/components/ui/use-toast';
import { Building2, ArrowLeft, Edit, Trash2, MapPin, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddEditSupplierModal from '@/components/AddEditSupplierModal';
import SupplierContactsSection from '@/components/SupplierContactsSection';

const SupplierDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getSupplierById, removeSupplier } = useContext(SupplierContext);

  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getSupplierById(id);
      if (!data) {
        toast({ title: "Error", description: "Supplier not found.", variant: "destructive" });
        navigate('/expenses/suppliers');
        return;
      }
      setSupplier(data);
    } catch (err) {
      toast({ title: "Error", description: "Could not load supplier details.", variant: "destructive" });
      navigate('/expenses/suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete ${supplier.company_name}?`)) {
      try {
        await removeSupplier(supplier.id);
        navigate('/expenses/suppliers');
      } catch (err) {
        // Error toast handled in context
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!supplier) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/expenses/suppliers')} 
        className="text-gray-500 hover:text-gray-900 -ml-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Suppliers
      </Button>

      {/* Supplier Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="bg-[#1B4D5C] p-3 rounded-xl shadow-md shrink-0"><Building2 className="w-8 h-8 text-white"/></div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{supplier.company_name}</h1>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${supplier.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {supplier.status}
                </span>
              </div>
              
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">TIN Number</p>
                    <p className="font-medium text-gray-900">{supplier.tin_number || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Address</p>
                    <p className="font-medium text-gray-900">{supplier.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              {supplier.notes && (
                <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-gray-800">{supplier.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0 self-end md:self-auto w-full md:w-auto justify-end mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
              <Edit className="w-4 h-4 mr-2" /> Edit Info
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Contacts Section Component */}
      <SupplierContactsSection supplierId={supplier.id} />

      <AddEditSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={supplier}
        onSuccess={loadData}
      />
    </div>
  );
};

export default SupplierDetailsPage;