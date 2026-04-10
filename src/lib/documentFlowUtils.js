import { addDays, format, parseISO } from 'date-fns';

export const calculateInvoiceDueDate = (invoiceDate, paymentTerms) => {
  if (!invoiceDate) return null;
  const date = parseISO(invoiceDate);
  
  switch (paymentTerms) {
    case '15 days': return format(addDays(date, 15), 'yyyy-MM-dd');
    case '30 days': return format(addDays(date, 30), 'yyyy-MM-dd');
    case '60 days': return format(addDays(date, 60), 'yyyy-MM-dd');
    case 'COD':
    case '50% DP & 50% upon completion':
    default:
      return format(date, 'yyyy-MM-dd');
  }
};

export const generateTemporaryPOCode = async (supabase, currentDate = new Date()) => {
  const monthPrefix = `TP${format(currentDate, 'yyyyMM')}`;
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('temporary_po_code')
      .like('temporary_po_code', `${monthPrefix}%`)
      .order('temporary_po_code', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0 || !data[0].temporary_po_code) {
      return `${monthPrefix}001`;
    }

    const lastCode = data[0].temporary_po_code;
    const sequence = parseInt(lastCode.slice(-3), 10);
    const nextSequence = (sequence + 1).toString().padStart(3, '0');
    
    return `${monthPrefix}${nextSequence}`;
  } catch (err) {
    console.error('Error generating PO code:', err);
    throw new Error('Failed to generate Temporary PO Code');
  }
};

export const calculatePaymentStatus = (totalInvoiced, totalPaid) => {
  if (totalInvoiced <= 0 && totalPaid <= 0) return 'Unpaid';
  if (totalPaid >= totalInvoiced) return 'Paid';
  if (totalPaid > 0) return 'Partial';
  return 'Unpaid';
};

export const calculateInvoiceStatus = (invoices) => {
  if (!invoices || invoices.length === 0) return 'Not Issued';
  if (invoices.some(inv => inv.invoice_issue_status === 'Completed Issued')) return 'Completed Issued';
  return 'Partial Issued';
};

export const calculateDeliveryStatus = (deliveryReceipts) => {
  if (!deliveryReceipts || deliveryReceipts.length === 0) return 'Not Started';
  if (deliveryReceipts.some(dr => dr.dr_status === 'Completed')) return 'Completed';
  return 'Partial';
};

export const validateMonetaryValue = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return 'Value must be a positive number';
  if (num > 999999999.99) return 'Value exceeds maximum allowed limit';
  return null;
};