export const generateInternalCode = (expenses) => {
  if (!expenses || expenses.length === 0) return 'M00001';
  
  // Extract all codes that match MXXXXX
  const codes = expenses
    .map(e => e.internalCode)
    .filter(code => code && code.startsWith('M'))
    .map(code => parseInt(code.substring(1), 10))
    .filter(num => !isNaN(num));
    
  if (codes.length === 0) return 'M00001';
  
  const maxCode = Math.max(...codes);
  const nextCode = maxCode + 1;
  
  return `M${String(nextCode).padStart(5, '0')}`;
};