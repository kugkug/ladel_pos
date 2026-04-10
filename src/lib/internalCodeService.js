import { supabase } from './customSupabaseClient';

/**
 * Calls the Supabase RPC function to generate the next unique internal code securely.
 * This prevents race conditions via database-level FOR UPDATE locking.
 * @returns {Promise<string>} The newly generated code (e.g., "M202668")
 */
export const generateNextInternalCode = async () => {
  const { data, error } = await supabase.rpc('generate_next_internal_code');
  if (error) {
    console.error('Error generating next internal code:', error);
    throw new Error('Failed to generate unique internal code. Please try again.');
  }
  return data;
};

// Keeping the old local generator just in case it's used elsewhere for fallback,
// but the new RPC approach is highly recommended.
export const generateInternalCode = async () => {
  try {
    return await generateNextInternalCode();
  } catch (error) {
    // Fallback simple timestamp-based code if DB function fails
    const timestamp = new Date().getTime().toString().slice(-6);
    return `M${timestamp}`;
  }
};