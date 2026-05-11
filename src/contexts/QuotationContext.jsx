import React, { createContext } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const QuotationContext = createContext();

export const QuotationProvider = ({ children }) => {
  const createQuotation = async (data) => {
    if (!data.quotation_number?.trim()) {
      throw new Error("Quotation Number is required");
    }
    if (!data.status?.trim() && !data.quotation_status?.trim()) {
      throw new Error("Status is required");
    }

    const payload = {
      quotation_number: data.quotation_number,
      quotation_status: data.status || data.quotation_status || 'Pending'
    };

    if (data.quotation_date) payload.date_issued = data.quotation_date;
    if (data.order_description) payload.order_description = data.order_description;
    if (data.amount) payload.net_amount = parseFloat(data.amount);
    if (data.tax_type) payload.tax_type = data.tax_type;
    if (data.vat_percentage !== undefined) payload.vat_percentage = Number(data.vat_percentage);
    // Removed vat_amount and gross_amount as they are GENERATED ALWAYS AS columns in the database
    if (data.notes) payload.notes = data.notes;
    if (data.project_id) payload.project_id = data.project_id;

    const { data: result, error } = await supabase.from('quotations').insert([payload]).select().single();
    if (error) {
      throw new Error(error.message || "Failed to create quotation");
    }
    return result;
  };

  return (
    <QuotationContext.Provider value={{ createQuotation }}>
      {children}
    </QuotationContext.Provider>
  );
};