export const validateQuotation = (formData) => {
  const errors = {};
  
  const qNum = formData.quotation_number || formData.quotationNumber;
  if (!qNum || !String(qNum).trim()) {
    errors.quotation_number = "Quotation Number is required";
  }
  
  const stat = formData.status || formData.quotation_status || formData.quotationStatus;
  if (!stat || !String(stat).trim()) {
    errors.status = "Status is required";
  }
  
  // Note: gross_amount and vat_amount are NOT validated here as they are 
  // auto-generated database columns and are read-only in the UI.
  
  return errors;
};