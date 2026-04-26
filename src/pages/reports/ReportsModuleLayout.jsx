import React from 'react';
import { Outlet } from 'react-router-dom';

const ReportsModuleLayout = () => {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <Outlet />
    </div>
  );
};

export default ReportsModuleLayout;
