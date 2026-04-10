import { supabase } from '@/lib/customSupabaseClient';

export const migrateCustomerData = async () => {
  try {
    const localCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    let migratedCount = 0;
    let errors = [];

    for (const c of localCustomers) {
      const company_name = c.companyName || c.company || c.customerName || 'Unknown Company';
      const contact_email = c.email || '';
      
      const mapped = {
        company_name,
        company_tin: c.company_tin || '',
        company_address: c.address || '',
        contact_name: c.contactPerson || c.customerName || 'Unknown Contact',
        contact_email,
        contact_phone: c.phone || '',
        status: c.status || 'Active',
        notes: c.notes || '',
        customer_name: c.customerName || null,
        company: c.companyName || c.company || null,
        address: c.address || null,
        phone: c.phone || null,
        email: c.email || null
      };

      // Check if duplicate exists
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('company_name', company_name)
        .eq('contact_email', contact_email)
        .single();

      if (!existing) {
        const { error } = await supabase.from('customers').insert([mapped]);
        if (!error) {
          migratedCount++;
        } else {
          errors.push(`Error for ${company_name}: ${error.message}`);
        }
      }
    }
    
    console.log(`Migration Complete: Migrated ${migratedCount} customers. Errors: ${errors.length}`);
    return { success: true, migratedCount, errors };
  } catch (err) {
    console.error('Migration failed:', err);
    return { success: false, error: err.message };
  }
};