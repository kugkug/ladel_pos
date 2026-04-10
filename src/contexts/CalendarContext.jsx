import React, { createContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('calendarReminders');
    if (data) {
      try { setReminders(JSON.parse(data)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarReminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = (reminder) => {
    if (!reminder.date || !reminder.description) {
      toast({ title: "Error", description: "Date and description are required.", variant: "destructive" });
      return;
    }
    const newReminder = { id: Date.now().toString(), ...reminder };
    setReminders(prev => [...prev, newReminder]);
    toast({ title: "Success", description: "Reminder added." });
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    toast({ title: "Success", description: "Reminder deleted." });
  };

  return (
    <CalendarContext.Provider value={{ reminders, addReminder, deleteReminder }}>
      {children}
    </CalendarContext.Provider>
  );
};