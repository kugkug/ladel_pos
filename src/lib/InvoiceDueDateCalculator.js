import { addDays, parseISO } from 'date-fns';

export const calculateDueDate = (issueDate, terms) => {
  const baseDate = issueDate ? parseISO(issueDate) : new Date();
  
  switch (terms) {
    case 'COD':
      return baseDate;
    case '15 Days Terms':
      return addDays(baseDate, 15);
    case '30 Days Terms':
      return addDays(baseDate, 30);
    case '60 Days Terms':
      return addDays(baseDate, 60);
    case '50% DP + 50% Completion':
    case 'Partial Payment':
    default:
      return addDays(baseDate, 30); // Default 30 days
  }
};