import { differenceInDays, startOfDay, addDays, isBefore, isAfter, isSameDay } from 'date-fns';

export const sanitizeAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') return 0;
  if (typeof amount === 'number') return amount;
  
  // Strip ₱ symbol and commas
  let cleaned = String(amount).replace(/[₱,]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(sanitizeAmount(amount));
};

export const fetchPendingQuotationsMetrics = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        project_number,
        is_deleted,
        quotations (id, quotation_status, gross_amount, net_amount)
      `)
      .eq('is_deleted', false);

    if (error) throw error;

    const uniqueProjIds = new Set();
    const uniqueQuoteIds = new Set();
    let total = 0;
    const projectDetails = [];

    (data || []).forEach(p => {
      let hasPending = false;
      
      (p.quotations || []).forEach(q => {
        // Exclusively use quotation_status
        const st = (q.quotation_status || '').trim().toLowerCase();
        if (st === 'pending') {
          hasPending = true;
          // Aggregate by distinct quotation ID to prevent duplication
          if (!uniqueQuoteIds.has(q.id)) {
            uniqueQuoteIds.add(q.id);
            // Use gross_amount 
            total += sanitizeAmount(q.gross_amount);
          }
        }
      });
      
      if (hasPending) {
        uniqueProjIds.add(p.id);
        projectDetails.push(p.project_number);
      }
    });

    console.log('fetchPendingQuotationsMetrics output:', { count: uniqueProjIds.size, total, projectDetails });

    return { count: uniqueProjIds.size, total, projects: projectDetails };
  } catch (error) {
    console.error("Error fetching pending quotations metrics:", error);
    return { count: 0, total: 0, projects: [] };
  }
};

export const fetchOngoingProjectsMetrics = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        is_deleted,
        po_type,
        po_amount_inclusive,
        purchase_orders (id, status, amount),
        delivery_receipts (id, status, dr_status)
      `)
      .eq('is_deleted', false);

    if (error) throw error;

    const uniqueProjIds = new Set();
    const uniquePOIds = new Set();
    let total = 0;

    (data || []).forEach(p => {
      let hasPO = false;
      let hasCompleteDR = false;
      let projPOTotal = 0;

      (p.purchase_orders || []).forEach(po => {
        const st = (po.status || '').toLowerCase();
        if (['issued', 'active', 'pending', 'confirmed'].includes(st)) {
          hasPO = true;
        }
      });

      if (p.po_type) {
        hasPO = true;
        projPOTotal = sanitizeAmount(p.po_amount_inclusive);
      }

      (p.delivery_receipts || []).forEach(dr => {
        const st = (dr.status || dr.dr_status || '').toLowerCase();
        if (['complete', 'completed'].includes(st)) {
          hasCompleteDR = true;
        }
      });

      if (hasPO && !hasCompleteDR) {
        uniqueProjIds.add(p.id);
        let addedNested = false;

        (p.purchase_orders || []).forEach(po => {
          const st = (po.status || '').toLowerCase();
          if (['issued', 'active', 'pending', 'confirmed'].includes(st)) {
            if (!uniquePOIds.has(po.id)) {
              uniquePOIds.add(po.id);
              total += sanitizeAmount(po.amount || po.po_total);
              addedNested = true;
            }
          }
        });

        if (!addedNested && p.po_type) {
          total += projPOTotal;
        }
      }
    });

    return { count: uniqueProjIds.size, total };
  } catch (error) {
    console.error("Error fetching ongoing projects metrics:", error);
    return { count: 0, total: 0 };
  }
};

export const triggerDashboardRefresh = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dashboard-metrics-refresh'));
  }
};

export const calculateDaysOverdue = (dueDate) => {
  if (!dueDate) return 0;
  return differenceInDays(startOfDay(new Date()), startOfDay(new Date(dueDate)));
};

export const calculateDaysUntilDue = (dueDate) => {
  if (!dueDate) return 0;
  return differenceInDays(startOfDay(new Date(dueDate)), startOfDay(new Date()));
};

export const getUpcomingTerms = (invoices) => {
  if (!Array.isArray(invoices)) return [];
  const today = startOfDay(new Date());
  const nextWeek = addDays(today, 7);

  return invoices.filter(inv => {
    const isUnpaid = inv.status?.toLowerCase() !== 'paid' && inv.invoice_issue_status?.toLowerCase() !== 'paid';
    if (!isUnpaid || !inv.due_date) return false;
    
    const due = startOfDay(new Date(inv.due_date));
    return (isSameDay(due, today) || isAfter(due, today)) && (isSameDay(due, nextWeek) || isBefore(due, nextWeek));
  }).map(inv => ({
    id: inv.id,
    customerName: inv.projects?.companies?.company_name || 'Unknown',
    invoiceNumber: inv.invoice_number,
    amount: sanitizeAmount(inv.total_amount || inv.base_amount),
    dueDate: inv.due_date,
    daysUntilDue: calculateDaysUntilDue(inv.due_date),
    status: inv.status || 'Pending',
    projectId: inv.project_id
  })).sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

export const getOverdueTerms = (invoices) => {
  if (!Array.isArray(invoices)) return [];
  const today = startOfDay(new Date());

  return invoices.filter(inv => {
    const isUnpaid = inv.status?.toLowerCase() !== 'paid' && inv.invoice_issue_status?.toLowerCase() !== 'paid';
    if (!isUnpaid || !inv.due_date) return false;
    
    const due = startOfDay(new Date(inv.due_date));
    return isBefore(due, today);
  }).map(inv => ({
    id: inv.id,
    customerName: inv.projects?.companies?.company_name || 'Unknown',
    invoiceNumber: inv.invoice_number,
    amount: sanitizeAmount(inv.total_amount || inv.base_amount),
    dueDate: inv.due_date,
    daysOverdue: calculateDaysOverdue(inv.due_date),
    status: inv.status || 'Pending',
    projectId: inv.project_id
  })).sort((a, b) => b.daysOverdue - a.daysOverdue);
};

export const fetchInvoicesWithTerms = async (supabase) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, due_date, status, invoice_issue_status, total_amount, base_amount, project_id,
      projects (
        id, project_number,
        companies (company_name)
      )
    `)
    .eq('is_deleted', false)
    .in('status', ['COMPLETE', 'FINAL', 'ISSUED', 'Completed Invoice', 'Pending', 'Draft', 'Issued']);

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
  return data || [];
};