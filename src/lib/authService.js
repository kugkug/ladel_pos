import { supabase } from '@/lib/customSupabaseClient';

export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in loginUser:', error);
    return { data: null, error };
  }
};

export const signupUser = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in signupUser:', error);
    return { data: null, error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

export const getCurrentUserWithValidation = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) throw new Error('No valid session');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User validation failed');
    
    return user;
  } catch (error) {
    console.error('Error in getCurrentUserWithValidation:', error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in logoutUser:', error);
    return { success: false, error };
  }
};

export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in refreshSession:', error);
    return { data: null, error };
  }
};