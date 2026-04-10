import React, { createContext, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export const AuthorizationContext = createContext();

export const AuthorizationProvider = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  const login = (username, password) => {
    if (username === 'Alex' && password === 'Aless@ndr0') {
      setIsAuthorized(true);
      toast({ title: 'Success', description: 'Authorized successfully.' });
      return true;
    }
    toast({ title: 'Error', description: 'Invalid credentials.', variant: 'destructive' });
    return false;
  };

  const logout = () => {
    setIsAuthorized(false);
    toast({ title: 'Info', description: 'Logged out.' });
  };

  return (
    <AuthorizationContext.Provider value={{ isAuthorized, login, logout }}>
      {children}
    </AuthorizationContext.Provider>
  );
};