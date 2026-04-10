import { supabase } from '@/lib/customSupabaseClient';
import { logCreate, logUpdate, logDelete } from '@/lib/ActivityLogger';
import { getCurrentUser } from '@/lib/authService';

export const fetchSuppliers = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('company_name', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in fetchSuppliers:', error);
    throw error;
  }
};

export const fetchSupplierById = async (id) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error in fetchSupplierById for id ${id}:`, error);
    throw error;
  }
};

export const createSupplier = async (supplierData, currentUserContext) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    const { data, error } = await supabase
      .from('suppliers')
      .insert([{
        ...supplierData,
        created_by: user.id,
        owner_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    
    const logUser = currentUserContext || { id: user.id, email: user.email || 'system' };
    logCreate(logUser, 'EXPENSES', 'SUPPLIER', data.company_name, data);
    
    return data;
  } catch (error) {
    console.error('Error in createSupplier:', error);
    throw error;
  }
};

export const updateSupplier = async (id, supplierData, currentUserContext, oldData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    // Exclude tenancy/ownership columns to avoid accidental modification
    const { owner_id, created_by, user_id, tenant_id, org_id, ...updatePayload } = supplierData;

    const { data, error } = await supabase
      .from('suppliers')
      .update({
        ...updatePayload,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    if (currentUserContext) {
      logUpdate(currentUserContext, 'EXPENSES', 'SUPPLIER', data.company_name, oldData, data);
    }
    return data;
  } catch (error) {
    console.error(`Error in updateSupplier for id ${id}:`, error);
    throw error;
  }
};

export const deleteSupplier = async (id, currentUserContext, supplierName) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    if (currentUserContext) {
      logDelete(currentUserContext, 'EXPENSES', 'SUPPLIER', supplierName, { id });
    }
  } catch (error) {
    console.error(`Error in deleteSupplier for id ${id}:`, error);
    throw error;
  }
};

export const fetchSupplierContacts = async (supplierId) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    const { data, error } = await supabase
      .from('supplier_contacts')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error in fetchSupplierContacts for supplier ${supplierId}:`, error);
    throw error;
  }
};

export const createSupplierContact = async (supplierId, contactData, currentUserContext) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    const { data, error } = await supabase
      .from('supplier_contacts')
      .insert([{
        ...contactData,
        supplier_id: supplierId,
        created_by: user.id,
        owner_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    
    const logUser = currentUserContext || { id: user.id, email: user.email || 'system' };
    logCreate(logUser, 'EXPENSES', 'SUPPLIER_CONTACT', data.name, data);
    
    return data;
  } catch (error) {
    console.error('Error in createSupplierContact:', error);
    throw error;
  }
};

export const updateSupplierContact = async (id, contactData, currentUserContext, oldData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    // Exclude tenancy/ownership columns
    const { owner_id, created_by, user_id, tenant_id, org_id, ...updatePayload } = contactData;

    const { data, error } = await supabase
      .from('supplier_contacts')
      .update({
        ...updatePayload,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    if (currentUserContext) {
      logUpdate(currentUserContext, 'EXPENSES', 'SUPPLIER_CONTACT', data.name, oldData, data);
    }
    return data;
  } catch (error) {
    console.error(`Error in updateSupplierContact for id ${id}:`, error);
    throw error;
  }
};

export const deleteSupplierContact = async (id, currentUserContext, contactName) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated.');

    const { error } = await supabase
      .from('supplier_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    if (currentUserContext) {
      logDelete(currentUserContext, 'EXPENSES', 'SUPPLIER_CONTACT', contactName, { id });
    }
  } catch (error) {
    console.error(`Error in deleteSupplierContact for id ${id}:`, error);
    throw error;
  }
};