import React, { createContext, useState, useContext, useCallback } from 'react';

export const DashboardRefreshContext = createContext();

export const DashboardRefreshProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback((reason = 'manual') => {
    console.log(`Dashboard refresh triggered: ${reason}`);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <DashboardRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DashboardRefreshContext.Provider>
  );
};

export const useDashboardRefresh = () => useContext(DashboardRefreshContext);