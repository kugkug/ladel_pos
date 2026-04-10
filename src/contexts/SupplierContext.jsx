import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import * as supplierService from '@/lib/supplierService';

export const SupplierContext = createContext();

export const SupplierProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supplierService.fetchSuppliers();
      setSuppliers(data || []);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      toast({ title: 'Error', description: 'Failed to load suppliers.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) {
      loadSuppliers();
    }
  }, [currentUser, loadSuppliers]);

  const addSupplier = async (supplierData) => {
    try {
      const newSupplier = await supplierService.createSupplier(supplierData, currentUser);
      setSuppliers(prev => [...prev, newSupplier].sort((a, b) => a.company_name.localeCompare(b.company_name)));
      toast({ title: 'Success', description: 'Supplier added successfully.' });
      return newSupplier;
    } catch (error) {
      console.error('Add supplier error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to add supplier.', variant: 'destructive' });
      throw error;
    }
  };

  const editSupplier = async (id, supplierData) => {
    try {
      const oldData = suppliers.find(s => s.id === id);
      const updatedSupplier = await supplierService.updateSupplier(id, supplierData, currentUser, oldData);
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s).sort((a, b) => a.company_name.localeCompare(b.company_name)));
      toast({ title: 'Success', description: 'Supplier updated successfully.' });
      return updatedSupplier;
    } catch (error) {
      console.error('Edit supplier error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to update supplier.', variant: 'destructive' });
      throw error;
    }
  };

  const removeSupplier = async (id) => {
    try {
      const supplier = suppliers.find(s => s.id === id);
      await supplierService.deleteSupplier(id, currentUser, supplier?.company_name);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Success', description: 'Supplier deleted successfully.' });
    } catch (error) {
      console.error('Delete supplier error:', error);
      toast({ title: 'Error', description: 'Failed to delete supplier.', variant: 'destructive' });
      throw error;
    }
  };

  const getSupplierContacts = async (supplierId) => {
    try {
      return await supplierService.fetchSupplierContacts(supplierId);
    } catch (error) {
      console.error('Load contacts error:', error);
      toast({ title: 'Error', description: 'Failed to load contacts.', variant: 'destructive' });
      return [];
    }
  };

  const addSupplierContact = async (supplierId, contactData) => {
    try {
      const newContact = await supplierService.createSupplierContact(supplierId, contactData, currentUser);
      toast({ title: 'Success', description: 'Contact added successfully.' });
      return newContact;
    } catch (error) {
      console.error('Add contact error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to add contact.', variant: 'destructive' });
      throw error;
    }
  };

  const editSupplierContact = async (id, contactData) => {
    try {
      // Pass null for oldData here for simplicity unless we fetch it first
      const updatedContact = await supplierService.updateSupplierContact(id, contactData, currentUser, null);
      toast({ title: 'Success', description: 'Contact updated successfully.' });
      return updatedContact;
    } catch (error) {
      console.error('Edit contact error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to update contact.', variant: 'destructive' });
      throw error;
    }
  };

  const removeSupplierContact = async (id, contactName) => {
    try {
      await supplierService.deleteSupplierContact(id, currentUser, contactName);
      toast({ title: 'Success', description: 'Contact deleted successfully.' });
    } catch (error) {
      console.error('Delete contact error:', error);
      toast({ title: 'Error', description: 'Failed to delete contact.', variant: 'destructive' });
      throw error;
    }
  };

  return (
    <SupplierContext.Provider value={{
      suppliers,
      isLoading,
      loadSuppliers,
      addSupplier,
      editSupplier,
      removeSupplier,
      getSupplierContacts,
      addSupplierContact,
      editSupplierContact,
      removeSupplierContact,
      getSupplierById: supplierService.fetchSupplierById
    }}>
      {children}
    </SupplierContext.Provider>
  );
};