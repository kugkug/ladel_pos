import { supabase } from '@/lib/customSupabaseClient';
import { getCurrentUser } from '@/lib/authService';

const getAuthContext = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated.');
  return user;
};

export const saveExpense = async (type, formData) => {
  try {
    const user = await getAuthContext();
    const payload = {
      user_id: user.id,
      type,
      internal_code: formData.internal_code,
      data: formData,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from('expenses_records')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error saving expense:', error);
    throw new Error(error.message || 'Failed to save expense');
  }
};

export const getActiveExpenses = async () => {
  try {
    const user = await getAuthContext();
    const { data, error } = await supabase
      .from('expenses_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active expenses:', error);
    throw new Error(error.message || 'Failed to fetch expenses');
  }
};

export const getTrashedExpenses = async () => {
  try {
    const user = await getAuthContext();
    const { data, error } = await supabase
      .from('expenses_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trashed expenses:', error);
    throw new Error(error.message || 'Failed to fetch trashed expenses');
  }
};

export const getExpenseById = async (id) => {
  try {
    const user = await getAuthContext();
    const { data, error } = await supabase
      .from('expenses_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching expense by id:', error);
    throw new Error(error.message || 'Failed to fetch expense');
  }
};

export const updateExpense = async (id, formData) => {
  try {
    const user = await getAuthContext();
    const { data, error } = await supabase
      .from('expenses_records')
      .update({ 
        data: formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw new Error(error.message || 'Failed to update expense');
  }
};

export const deleteExpense = async (id) => {
  try {
    const user = await getAuthContext();
    const { data, error } = await supabase
      .from('expenses_records')
      .update({ 
        is_deleted: true, 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error moving expense to trash:', error);
    throw new Error(error.message || 'Failed to delete expense');
  }
};

export const restoreExpense = async (id) => {
  try {
    const user = await getAuthContext();
    const { data, error } = await supabase
      .from('expenses_records')
      .update({ 
        is_deleted: false, 
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error restoring expense:', error);
    throw new Error(error.message || 'Failed to restore expense');
  }
};

export const permanentlyDeleteExpense = async (id) => {
  try {
    const user = await getAuthContext();
    const { error } = await supabase
      .from('expenses_records')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error permanently deleting expense:', error);
    throw new Error(error.message || 'Failed to permanently delete expense');
  }
};