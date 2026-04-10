import React, { useEffect, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { ModuleContext } from '@/contexts/ModuleContext';

const ExpensesLayout = () => {
  const { setActiveModule } = useContext(ModuleContext);

  useEffect(() => {
    setActiveModule('expenses');
  }, [setActiveModule]);

  return (
    <div className="w-full animate-in fade-in duration-300">
      <Outlet />
    </div>
  );
};

export default ExpensesLayout;