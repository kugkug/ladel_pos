import { format, parseISO } from 'date-fns';

export const formatPHP = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const generateMonths = (startYear = 2025, startMonth = 0, endYear = Math.max(2026, new Date().getFullYear()), endMonth = 11) => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let currentYear = startYear;
  let currentMonth = startMonth; // 0-indexed (0 = Jan, 11 = Dec)

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    months.push({
      key: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
      label: `${monthNames[currentMonth]} ${currentYear}`
    });
    
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }
  return months;
};

export const getMonthKey = (dateString) => {
  if (!dateString) return null;
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const parseAmount = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const parsed = parseFloat(String(val).replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};