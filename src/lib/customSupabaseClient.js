import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://suwqdoreilnlzdsibrho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1d3Fkb3JlaWxubHpkc2licmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDI0MTgsImV4cCI6MjA4ODg3ODQxOH0.VTyXTC620y55gZWhlnyhMNg6sxoOlTsnwE94KpJzLVg';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
