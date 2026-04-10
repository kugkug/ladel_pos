import React, { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ModuleContext = createContext();

export const ModuleProvider = ({ children }) => {
  const [activeModule, setActiveModule] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/sales')) {
      setActiveModule('sales');
    } else if (path.startsWith('/expenses')) {
      setActiveModule('expenses');
    } else if (path.startsWith('/reports')) {
      setActiveModule('reports');
    } else {
      setActiveModule('home');
    }
  }, [location.pathname]);

  return (
    <ModuleContext.Provider value={{ activeModule, setActiveModule }}>
      {children}
    </ModuleContext.Provider>
  );
};