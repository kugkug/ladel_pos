import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based access
  if (requiredRole && userRole !== requiredRole) {
    // Delay toast slightly to avoid render phase conflicts
    setTimeout(() => {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive"
      });
    }, 100);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;