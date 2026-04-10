import { supabase } from '@/lib/customSupabaseClient';

export const migrateCustomersToCompanies = async () => {
  try {
    console.log('Starting migration from customers to companies...');
    
    // 1. Fetch all existing customers
    const { data: customers, error: fetchError } = await supabase.from('customers').select('*');
    if (fetchError) throw fetchError;
    if (!customers || customers.length === 0) return { success: true, message: 'No customers to migrate.' };

    // 2. Group by company name (case-insensitive)
    const companyGroups = {};
    customers.forEach(c => {
      const name = (c.company_name || c.company || c.customer_name || 'Unknown Company').trim();
      const key = name.toLowerCase();
      if (!companyGroups[key]) {
        companyGroups[key] = {
          name,
          address: c.company_address || c.address || '',
          tin: c.company_tin || '',
          status: c.status || 'Active',
          notes: c.notes || '',
          contacts: []
        };
      }
      
      const contactName = (c.contact_name || c.customer_name || 'Unknown Contact').trim();
      if (contactName) {
        companyGroups[key].contacts.push({
          name: contactName,
          email: c.contact_email || c.email || '',
          phone: c.contact_phone || c.phone || '',
          created_at: c.created_at
        });
      }
    });

    let companiesCreated = 0;
    let contactsCreated = 0;
    let duplicatesMerged = 0;

    // 3. Insert companies and contacts
    for (const key in companyGroups) {
      const group = companyGroups[key];
      
      // Check if company already exists to avoid unique constraint errors if run multiple times
      const { data: existingComp } = await supabase.from('companies').select('id').ilike('company_name', group.name).single();
      
      let companyId;
      if (existingComp) {
        companyId = existingComp.id;
      } else {
        const { data: newComp, error: compErr } = await supabase.from('companies').insert([{
          company_name: group.name,
          company_address: group.address,
          company_tin: group.tin,
          status: group.status,
          notes: group.notes
        }]).select('id').single();
        
        if (compErr) {
          console.error(`Failed to insert company ${group.name}:`, compErr);
          continue;
        }
        companyId = newComp.id;
        companiesCreated++;
      }

      // Deduplicate contacts
      const uniqueContacts = [];
      const seen = new Set();
      
      group.contacts.forEach(c => {
        const emailKey = c.email ? c.email.toLowerCase() : null;
        const namePhoneKey = `${c.name.toLowerCase()}|${c.phone}`;
        const dedupeKey = emailKey || namePhoneKey;
        
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          uniqueContacts.push(c);
        } else {
          duplicatesMerged++;
        }
      });

      // Insert contacts
      for (let i = 0; i < uniqueContacts.length; i++) {
        const c = uniqueContacts[i];
        
        // Check if contact exists
        const { data: existingContact } = await supabase.from('company_contacts')
          .select('id')
          .eq('company_id', companyId)
          .ilike('contact_name', c.name)
          .single();
          
        if (!existingContact) {
          const { error: contactErr } = await supabase.from('company_contacts').insert([{
            company_id: companyId,
            contact_name: c.name,
            contact_email: c.email,
            contact_phone: c.phone,
            is_primary: i === 0, // First contact is primary
            role_title: i === 0 ? 'Primary Contact' : 'Staff'
          }]);
          
          if (contactErr) {
            console.error(`Failed to insert contact ${c.name}:`, contactErr);
          } else {
            contactsCreated++;
          }
        }
      }
    }

    const resultMsg = `Migration complete. Companies created: ${companiesCreated}, Contacts created: ${contactsCreated}, Duplicates merged: ${duplicatesMerged}`;
    console.log(resultMsg);
    return { success: true, message: resultMsg, metrics: { companiesCreated, contactsCreated, duplicatesMerged } };
    
  } catch (err) {
    console.error('Migration failed:', err);
    return { success: false, error: err.message };
  }
};