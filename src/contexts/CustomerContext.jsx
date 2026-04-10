import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { logCreate, logUpdate } from '@/lib/ActivityLogger';
import { useAuth } from '@/contexts/AuthContext';

export const CustomerContext = createContext();

export const mapCustomerFields = (c) => ({
  ...c,
  // Backward compatibility fields
  customerName: c.contact_name || c.customerName,
  companyName: c.company_name || c.companyName,
  contactPerson: c.contact_name || c.contactPerson,
  address: c.company_address || c.address,
  phone: c.contact_phone || c.phone,
  email: c.contact_email || c.email,
});

export const CustomerProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [trashCustomers, setTrashCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate Supabase client existence
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      const { data, error: fetchError } = await supabase.from('customers').select('*');
      
      if (fetchError) {
        console.error('Supabase fetch error details:', fetchError);
        throw fetchError;
      }
      
      if (data) {
        const mapped = data.map(mapCustomerFields).sort((a,b) => (a.company_name || '').localeCompare(b.company_name || ''));
        setCustomers(mapped.filter(c => !c.deleted_at));
        setTrashCustomers(mapped.filter(c => c.deleted_at));
      } else {
        setCustomers([]);
        setTrashCustomers([]);
      }
    } catch (e) {
      console.error('Error fetching customers from Supabase:', {
        message: e.message,
        details: e.details,
        hint: e.hint,
        code: e.code,
        stack: e.stack
      });
      setError(e.message || 'Failed to load customers. Please check your connection.');
      
      // Fallback to localStorage gracefully
      try {
        const local = JSON.parse(localStorage.getItem('customers') || '[]');
        const trash = JSON.parse(localStorage.getItem('trashCustomers') || '[]');
        setCustomers(local.map(mapCustomerFields));
        setTrashCustomers(trash.map(mapCustomerFields));
      } catch (localErr) {
        console.error('Error loading fallback data from localStorage:', localErr);
        setCustomers([]);
        setTrashCustomers([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addCustomer = async (customerData) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    
    if (!customerData.company_name || !customerData.contact_name) {
      throw new Error("Company Name and Contact Name are required.");
    }
    
    if (customerData.contact_email && !emailRegex.test(customerData.contact_email)) {
      throw new Error("Invalid email format.");
    }

    const dup = customers.find(c => 
      c.company_name.toLowerCase() === customerData.company_name.toLowerCase() && 
      (c.contact_email || '').toLowerCase() === (customerData.contact_email || '').toLowerCase()
    );
    
    if (dup) {
      throw new Error("Customer already exists with this company and email.");
    }

    const newCustomer = {
      id: crypto.randomUUID(),
      ...customerData,
      created_at: new Date().toISOString()
    };

    try {
      const { error: insertError } = await supabase.from('customers').insert([newCustomer]);
      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw insertError;
      }
    } catch (e) {
      console.error("Customer insertion failed:", e);
      throw new Error(e.message || "Failed to create customer in the database.");
    }

    const mapped = mapCustomerFields(newCustomer);
    setCustomers(prev => [...prev, mapped].sort((a,b) => (a.company_name || '').localeCompare(b.company_name || '')));
    
    if (currentUser) {
       await logCreate(currentUser, 'SALES', 'CUSTOMER', mapped.company_name, mapped, `Created customer ${mapped.company_name}`);
    }
    
    try {
      localStorage.setItem('customers', JSON.stringify([...customers, mapped]));
    } catch (err) {
      console.warn("Failed to update localStorage:", err);
    }

    return { ...mapped, isNew: true };
  };

  const editCustomer = async (id, data) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    
    if (!data.company_name || !data.contact_name) {
      throw new Error("Company Name and Contact Name are required.");
    }
    
    if (data.contact_email && !emailRegex.test(data.contact_email)) {
      throw new Error("Invalid email format.");
    }

    const dup = customers.find(c => 
      c.id !== id && 
      c.company_name.toLowerCase() === data.company_name.toLowerCase() && 
      (c.contact_email || '').toLowerCase() === (data.contact_email || '').toLowerCase()
    );
    
    if (dup) {
      throw new Error("Customer already exists with this company and email.");
    }

    try {
      const { error: updateError } = await supabase.from('customers').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }
    } catch (e) { 
      console.error("Customer update failed:", e); 
      throw new Error(e.message || "Failed to update customer in the database.");
    }

    const oldCustomer = customers.find(c => c.id === id);
    const updated = mapCustomerFields({ ...oldCustomer, ...data, updated_at: new Date().toISOString() });

    setCustomers(prev => prev.map(c => c.id === id ? updated : c).sort((a,b) => (a.company_name || '').localeCompare(b.company_name || '')));
    
    if (currentUser && oldCustomer) {
       await logUpdate(currentUser, 'SALES', 'CUSTOMER', updated.company_name, oldCustomer, updated, `Updated customer ${updated.company_name}`);
    }

    try {
      localStorage.setItem('customers', JSON.stringify(customers.map(c => c.id === id ? updated : c)));
    } catch (err) {
      console.warn("Failed to update localStorage:", err);
    }
    return updated;
  };
  
  // Alias for backward compatibility
  const updateCustomer = editCustomer;

  const deleteCustomer = async (id) => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return;
    
    try {
      const { error: deleteError } = await supabase.from('customers').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (deleteError) {
        console.error("Supabase soft-delete error:", deleteError);
        throw deleteError;
      }
    } catch (e) {
      console.error("Customer deletion failed:", e);
      throw new Error(e.message || "Failed to delete customer.");
    }
    
    const trashed = { ...cust, deleted_at: new Date().toISOString() };
    setCustomers(prev => prev.filter(c => c.id !== id));
    setTrashCustomers(prev => [...prev, trashed]);
    
    try {
      localStorage.setItem('customers', JSON.stringify(customers.filter(c => c.id !== id)));
      localStorage.setItem('trashCustomers', JSON.stringify([...trashCustomers, trashed]));
    } catch (err) {
      console.warn("Failed to update localStorage:", err);
    }
  };

  const restoreCustomer = async (id) => {
    const cust = trashCustomers.find(c => c.id === id);
    if (!cust) return;
    
    try {
      const { error: restoreError } = await supabase.from('customers').update({ deleted_at: null }).eq('id', id);
      if (restoreError) {
        console.error("Supabase restore error:", restoreError);
        throw restoreError;
      }
    } catch (e) {
      console.error("Customer restoration failed:", e);
      throw new Error(e.message || "Failed to restore customer.");
    }
    
    const restored = { ...cust, deleted_at: null };
    setTrashCustomers(prev => prev.filter(c => c.id !== id));
    setCustomers(prev => [...prev, restored].sort((a,b) => (a.company_name || '').localeCompare(b.company_name || '')));
    
    try {
      localStorage.setItem('trashCustomers', JSON.stringify(trashCustomers.filter(c => c.id !== id)));
      localStorage.setItem('customers', JSON.stringify([...customers, restored]));
    } catch (err) {
      console.warn("Failed to update localStorage:", err);
    }
  };

  const permanentlyDeleteCustomer = async (id) => {
    try {
      const { error: permDeleteError } = await supabase.from('customers').delete().eq('id', id);
      if (permDeleteError) {
        console.error("Supabase permanent delete error:", permDeleteError);
        throw permDeleteError;
      }
    } catch (e) {
      console.error("Customer permanent deletion failed:", e);
      throw new Error(e.message || "Failed to permanently delete customer.");
    }
    setTrashCustomers(prev => prev.filter(c => c.id !== id));
    try {
      localStorage.setItem('trashCustomers', JSON.stringify(trashCustomers.filter(c => c.id !== id)));
    } catch (err) {
      console.warn("Failed to update localStorage:", err);
    }
  };

  return (
    <CustomerContext.Provider value={{
      customers: customers || [],
      trashCustomers: trashCustomers || [],
      isLoading,
      error,
      addCustomer,
      updateCustomer,
      editCustomer,
      deleteCustomer,
      restoreCustomer,
      permanentlyDeleteCustomer,
      fetchCustomers
    }}>
      {children}
    </CustomerContext.Provider>
  );
};