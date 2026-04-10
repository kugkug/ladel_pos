import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { logCreate, logUpdate, logDelete } from '@/lib/ActivityLogger';
import { useToast } from '@/components/ui/use-toast';

export const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          contacts:company_contacts(*)
        `)
        .order('company_name', { ascending: true });

      if (error) throw error;

      const processed = data.map(c => {
        const primary = c.contacts.find(ct => ct.is_primary) || c.contacts[0] || null;
        return { ...c, primary_contact: primary };
      });

      setCompanies(processed);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({ title: "Error", description: "Failed to load companies.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const getCompanyById = async (id) => {
    try {
      const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const addCompany = async (companyData) => {
    try {
      // Changed from .single() to .maybeSingle() to correctly handle the case when no duplicate exists
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .ilike('company_name', companyData.company_name.trim())
        .maybeSingle();
        
      if (existing) throw new Error("Company name already exists");

      const { data, error } = await supabase
        .from('companies')
        .insert([{
          company_name: companyData.company_name.trim(),
          company_tin: companyData.company_tin,
          company_address: companyData.company_address,
          status: companyData.status || 'Active',
          notes: companyData.notes
        }])
        .select()
        .single();

      if (error) throw error;
      
      const newCompany = { ...data, contacts: [], primary_contact: null };
      setCompanies(prev => [...prev, newCompany].sort((a,b) => a.company_name.localeCompare(b.company_name)));
      
      if (currentUser) logCreate(currentUser, 'SALES', 'COMPANY', data.company_name, data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const editCompany = async (id, companyData) => {
    try {
      // Changed from .single() to .maybeSingle()
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .ilike('company_name', companyData.company_name.trim())
        .neq('id', id)
        .maybeSingle();
        
      if (existing) throw new Error("Company name already exists");

      const oldData = companies.find(c => c.id === id);

      const { data, error } = await supabase
        .from('companies')
        .update({
          company_name: companyData.company_name.trim(),
          company_tin: companyData.company_tin,
          company_address: companyData.company_address,
          status: companyData.status,
          notes: companyData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...data } : c).sort((a,b) => a.company_name.localeCompare(b.company_name)));
      
      if (currentUser && oldData) logUpdate(currentUser, 'SALES', 'COMPANY', data.company_name, oldData, data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteCompany = async (id) => {
    try {
      const comp = companies.find(c => c.id === id);
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
      
      setCompanies(prev => prev.filter(c => c.id !== id));
      if (currentUser && comp) logDelete(currentUser, 'SALES', 'COMPANY', comp.company_name, comp);
    } catch (error) {
      throw error;
    }
  };

  const getCompanyContacts = async (companyId) => {
    const { data, error } = await supabase
      .from('company_contacts')
      .select('*')
      .eq('company_id', companyId)
      .order('is_primary', { ascending: false })
      .order('contact_name', { ascending: true });
      
    if (error) throw error;
    return data;
  };

  const addContact = async (companyId, contactData) => {
    try {
      // Changed from .single() to .maybeSingle()
      if (contactData.contact_email) {
        const { data: dupEmail } = await supabase
          .from('company_contacts')
          .select('id')
          .eq('company_id', companyId)
          .ilike('contact_email', contactData.contact_email)
          .maybeSingle();
        if (dupEmail) throw new Error("Contact email already exists for this company");
      } else {
        const { data: dupName } = await supabase
          .from('company_contacts')
          .select('id')
          .eq('company_id', companyId)
          .ilike('contact_name', contactData.contact_name)
          .eq('contact_phone', contactData.contact_phone || '')
          .maybeSingle();
        if (dupName) throw new Error("A contact with this name and phone already exists.");
      }

      if (contactData.is_primary) {
        await supabase.from('company_contacts').update({ is_primary: false }).eq('company_id', companyId);
      }

      const currentContacts = await getCompanyContacts(companyId);
      const isFirst = currentContacts.length === 0;

      const { data, error } = await supabase.from('company_contacts').insert([{
        ...contactData,
        company_id: companyId,
        is_primary: contactData.is_primary || isFirst
      }]).select().single();

      if (error) throw error;
      
      await fetchCompanies();
      
      if (currentUser) logCreate(currentUser, 'SALES', 'CONTACT', data.contact_name, data, 'CREATE_CONTACT');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const editContact = async (contactId, contactData) => {
    try {
      const { data: existingContact } = await supabase
        .from('company_contacts')
        .select('company_id')
        .eq('id', contactId)
        .maybeSingle();
        
      if (!existingContact) throw new Error("Contact not found.");

      // Added missing duplicate checks for edit operations using .maybeSingle()
      if (contactData.contact_email) {
        const { data: dupEmail } = await supabase
          .from('company_contacts')
          .select('id')
          .eq('company_id', existingContact.company_id)
          .ilike('contact_email', contactData.contact_email)
          .neq('id', contactId)
          .maybeSingle();
        if (dupEmail) throw new Error("Contact email already exists for this company");
      } else {
        const { data: dupName } = await supabase
          .from('company_contacts')
          .select('id')
          .eq('company_id', existingContact.company_id)
          .ilike('contact_name', contactData.contact_name)
          .eq('contact_phone', contactData.contact_phone || '')
          .neq('id', contactId)
          .maybeSingle();
        if (dupName) throw new Error("A contact with this name and phone already exists.");
      }
      
      if (contactData.is_primary) {
        await supabase.from('company_contacts').update({ is_primary: false }).eq('company_id', existingContact.company_id);
      }

      const { data, error } = await supabase.from('company_contacts').update({
        ...contactData,
        updated_at: new Date().toISOString()
      }).eq('id', contactId).select().single();

      if (error) throw error;
      
      await fetchCompanies();
      if (currentUser) logUpdate(currentUser, 'SALES', 'CONTACT', data.contact_name, {}, data, 'UPDATE_CONTACT');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteContact = async (contactId) => {
    try {
      const { data: contact } = await supabase.from('company_contacts').select('*').eq('id', contactId).single();
      const { error } = await supabase.from('company_contacts').delete().eq('id', contactId);
      if (error) throw error;

      if (contact && contact.is_primary) {
        const remaining = await getCompanyContacts(contact.company_id);
        if (remaining.length > 0) {
          await setPrimaryContact(remaining[0].id, contact.company_id);
        }
      }
      
      await fetchCompanies();
      if (currentUser && contact) logDelete(currentUser, 'SALES', 'CONTACT', contact.contact_name, contact, 'DELETE_CONTACT');
    } catch (error) {
      throw error;
    }
  };

  const setPrimaryContact = async (contactId, companyId) => {
    try {
      await supabase.from('company_contacts').update({ is_primary: false }).eq('company_id', companyId);
      const { error } = await supabase.from('company_contacts').update({ is_primary: true }).eq('id', contactId);
      if (error) throw error;
      await fetchCompanies();
    } catch (error) {
      throw error;
    }
  };

  return (
    <CompanyContext.Provider value={{
      companies, isLoading, fetchCompanies, getCompanyById, addCompany, editCompany, deleteCompany,
      getCompanyContacts, addContact, editContact, deleteContact, setPrimaryContact
    }}>
      {children}
    </CompanyContext.Provider>
  );
};