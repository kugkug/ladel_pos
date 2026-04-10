import { supabase } from '@/lib/customSupabaseClient';

export const sanitizeAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') return 0;
  if (typeof amount === 'number') return amount;
  
  let cleaned = String(amount).replace(/[₱,]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const fetchProjectsWithDetails = async () => {
  try {
    console.log('Fetching projects with full document relationships...');
    // CRITICAL: Ensure nested purchase_orders fetches 'status', NOT 'po_status'
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        project_number,
        project_title,
        is_deleted,
        quotations (id, status, quotation_status, gross_amount),
        purchase_orders (id, status),
        delivery_receipts (id, status, dr_status)
      `)
      .eq('is_deleted', false);
      
    if (error) {
      console.error('Database query error in fetchProjectsWithDetails:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} projects with relationships.`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchProjectsWithDetails:', error);
    return [];
  }
};

export const countPendingQuotations = (projects) => {
  if (!Array.isArray(projects)) return { count: 0, total: 0 };
  
  const uniqueIds = new Set();
  let total = 0;
  
  projects.forEach(p => {
    if (p.is_deleted) return;
    
    (p.quotations || []).forEach(q => {
      // Case-insensitive status match
      const st = (q.status || q.quotation_status || '').toLowerCase();
      if (st === 'pending') {
        if (!uniqueIds.has(q.id)) {
          uniqueIds.add(q.id);
          total += sanitizeAmount(q.gross_amount);
        }
      }
    });
  });
  
  console.log('countPendingQuotations metrics:', { count: uniqueIds.size, total });
  return { count: uniqueIds.size, total };
};

export const countOngoingProjects = (projects) => {
  if (!Array.isArray(projects)) return { count: 0 };
  
  const uniqueIds = new Set();
  
  projects.forEach(p => {
    if (p.is_deleted) return;
    
    // Check PO status specifically using 'status'
    const hasPO = (p.purchase_orders || []).some(po => {
      const st = (po.status || '').toLowerCase();
      return st === 'issued' || st === 'confirmed';
    });

    const hasCompleteDR = (p.delivery_receipts || []).some(dr => {
      const st = (dr.status || dr.dr_status || '').toLowerCase();
      return st === 'complete' || st === 'completed';
    });

    // Valid Ongoing Filter
    if (hasPO && !hasCompleteDR) {
      uniqueIds.add(p.id);
    }
  });
  
  console.log('countOngoingProjects metrics:', { count: uniqueIds.size });
  return { count: uniqueIds.size };
};