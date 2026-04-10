import React, { createContext, useState, useEffect } from 'react';
import { generateInternalCode } from '@/lib/InternalCodeGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { logCreate, logUpdate, logDelete } from '@/lib/ActivityLogger';

export const ExpensesContext = createContext();

const initialSuppliers = [
  { id: '1', name: 'Office Depot', tin: '123-456-789', address: '123 Business Rd', contactPerson: 'John Doe', phone: '555-0100', email: 'john@officedepot.com', isDeleted: false },
  { id: '2', name: 'Meralco', tin: '987-654-321', address: 'Power Center, Manila', contactPerson: 'Jane Smith', phone: '555-0200', email: 'billing@meralco.com', isDeleted: false },
];

const initialExpenses = [
  { id: 'E001', date: new Date().toISOString().split('T')[0], month: 'January', supplierId: '1', description: 'Printer ink and paper', amount: 2500, type: 'Office Supplies', internalCode: 'M00001', financialImpact: 'P&L', nature: 'Expense', validITR: true, validVAT: true, classification: 'Regular Expense', paymentSource: 'CBC - China Bank Corporation', receiptType: 'Hard Copy', status: 'Completed', timestamp: Date.now(), isDeleted: false },
  { id: 'E002', date: new Date().toISOString().split('T')[0], month: 'January', fundBy: 'Alex', amount: 15000, internalCode: 'M00002', classification: 'Funding', bankFunded: 'SB - Security Bank', receiptType: 'Digital', status: 'Completed', timestamp: Date.now(), isDeleted: false },
];

const initialReminders = [
  { id: 'R001', type: 'Utilities', date: new Date().toISOString().split('T')[0], time: '10:00', notes: 'Pay electricity bill', frequency: 'Monthly', status: 'Pending' }
];

export const ExpensesProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : initialReminders;
  });

  useEffect(() => localStorage.setItem('expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('suppliers', JSON.stringify(suppliers)), [suppliers]);
  useEffect(() => localStorage.setItem('reminders', JSON.stringify(reminders)), [reminders]);

  const getNextInternalCode = () => generateInternalCode(expenses);

  const addExpense = (expense) => {
    const newExpense = { ...expense, id: `E${String(expenses.length + 1).padStart(3, '0')}-${Date.now()}`, timestamp: Date.now(), isDeleted: false };
    setExpenses(prev => [...prev, newExpense]);
    if (currentUser) {
      try { logCreate(currentUser, 'EXPENSES', 'EXPENSE', newExpense.internalCode, newExpense).catch(e => console.error('Failed to log expense creation:', e)); } catch(e) { console.error(e); }
    }
  };
  const updateExpense = (id, updatedExpense) => {
    const existing = expenses.find(e => e.id === id);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedExpense } : e));
    if (currentUser && existing) {
      try { logUpdate(currentUser, 'EXPENSES', 'EXPENSE', existing.internalCode, existing, updatedExpense).catch(e => console.error('Failed to log expense update:', e)); } catch(e) { console.error(e); }
    }
  };
  const deleteExpense = (id) => {
    const existing = expenses.find(e => e.id === id);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true } : e));
    if (currentUser && existing) {
      try { logDelete(currentUser, 'EXPENSES', 'EXPENSE', existing.internalCode, existing, "Moved to trash").catch(e => console.error('Failed to log expense deletion:', e)); } catch(e) { console.error(e); }
    }
  };
  const restoreExpense = (id) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: false } : e));
  };
  const permanentlyDeleteExpense = (id) => {
    const existing = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (currentUser && existing) {
      try { logDelete(currentUser, 'EXPENSES', 'EXPENSE_PERMANENT', existing.internalCode, existing).catch(e => console.error('Failed to log permanent expense deletion:', e)); } catch(e) { console.error(e); }
    }
  };
  const emptyExpenseTrash = () => {
    setExpenses(prev => prev.filter(e => !e.isDeleted));
  };

  const addSupplier = (supplier) => {
    const newSupplier = { ...supplier, id: Date.now().toString(), isDeleted: false };
    setSuppliers(prev => [...prev, newSupplier]);
    if (currentUser) {
      try { logCreate(currentUser, 'EXPENSES', 'SUPPLIER', newSupplier.name, newSupplier).catch(e => console.error('Failed to log supplier creation:', e)); } catch(e) { console.error(e); }
    }
    return newSupplier;
  };
  const updateSupplier = (id, updatedSupplier) => {
    const existing = suppliers.find(s => s.id === id);
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updatedSupplier } : s));
    if (currentUser && existing) {
      try { logUpdate(currentUser, 'EXPENSES', 'SUPPLIER', existing.name, existing, updatedSupplier).catch(e => console.error('Failed to log supplier update:', e)); } catch(e) { console.error(e); }
    }
  };
  const deleteSupplier = (id) => {
    const existing = suppliers.find(s => s.id === id);
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isDeleted: true } : s));
    if (currentUser && existing) {
      try { logDelete(currentUser, 'EXPENSES', 'SUPPLIER', existing.name, existing, "Moved to trash").catch(e => console.error('Failed to log supplier deletion:', e)); } catch(e) { console.error(e); }
    }
  };
  const restoreSupplier = (id) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isDeleted: false } : s));
  };
  const permanentlyDeleteSupplier = (id) => {
    const existing = suppliers.find(s => s.id === id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
    if (currentUser && existing) {
      try { logDelete(currentUser, 'EXPENSES', 'SUPPLIER_PERMANENT', existing.name, existing).catch(e => console.error('Failed to log permanent supplier deletion:', e)); } catch(e) { console.error(e); }
    }
  };
  const emptySupplierTrash = () => {
    setSuppliers(prev => prev.filter(s => !s.isDeleted));
  };

  const addReminder = (reminder) => {
    setReminders(prev => [...prev, { ...reminder, id: `R${Date.now()}`, status: 'Pending' }]);
  };
  const updateReminder = (id, updatedReminder) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updatedReminder } : r));
  };
  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };
  const markReminderAsCompleted = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
  };

  const validateFile = (fileInfo) => {
    if (!fileInfo) return { valid: true };
    const sizeInMB = parseFloat(fileInfo.size);
    if (sizeInMB > 10240) return { valid: false, error: 'File size exceeds 10MB limit.' };
    return { valid: true };
  };

  const calculateVat = (amountStr, vatOption) => {
    if (!amountStr || isNaN(amountStr)) return { base: 0, vat: 0, total: 0 };
    const amount = parseFloat(amountStr);
    if (vatOption === 'VAT') {
      const vat = amount * 0.12;
      return { base: amount, vat: vat, total: amount + vat };
    }
    return { base: amount, vat: 0, total: amount };
  };

  return (
    <ExpensesContext.Provider value={{
      expenses, suppliers, reminders,
      addExpense, updateExpense, deleteExpense, restoreExpense, permanentlyDeleteExpense, emptyExpenseTrash,
      addSupplier, updateSupplier, deleteSupplier, restoreSupplier, permanentlyDeleteSupplier, emptySupplierTrash,
      addReminder, updateReminder, deleteReminder, markReminderAsCompleted,
      getNextInternalCode, validateFile, calculateVat
    }}>
      {children}
    </ExpensesContext.Provider>
  );
};