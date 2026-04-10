import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Helmet } from 'react-helmet';

const ProtectedPageRoute = ({ children, module, page, requiredRole }) => {
  const { isAuthenticated, isLoading, hasAccess, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <div className="p-8 flex justify-center text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Helmet><title>Access Denied - APEX Hub</title></Helmet>
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 max-w-md">
          You don't have the required role to access this area. 
          This section is restricted to {requiredRole}s only.
        </p>
      </div>
    );
  }

  if (module && page && !hasAccess(module, page)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Helmet><title>Access Denied - APEX Hub</title></Helmet>
        <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-gray-600 max-w-md">
          You don't have access to this page. Please contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedPageRoute;