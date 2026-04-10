import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { loginUser as apiLoginUser, logoutUser as apiLogoutUser } from '@/lib/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const loadUserPermissions = async (userId, role) => {
    if (role === 'STAFF') {
      try {
        const { data: accessData, error: accessError } = await supabase
          .from('staff_access_control')
          .select('*')
          .eq('staff_user_id', userId)
          .maybeSingle();
          
        if (!accessError && accessData) {
          setPermissions(accessData);
        } else {
          setPermissions({});
        }
      } catch (err) {
        console.error('Error fetching staff permissions:', err);
        setPermissions({});
      }
    } else {
      setPermissions(null);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const profile = await fetchUserProfile(session.user.id);
          const role = profile?.role || 'STAFF';
          
          setCurrentUser(session.user);
          setUserRole(role);
          setIsAuthenticated(true);
          await loadUserPermissions(session.user.id, role);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setIsLoading(true);
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        const role = profile?.role || 'STAFF';
        
        setCurrentUser(session.user);
        setUserRole(role);
        setIsAuthenticated(true);
        await loadUserPermissions(session.user.id, role);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserRole(null);
        setPermissions(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithCredentials = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await apiLoginUser(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }

      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      return { success: true, user: data.user };
    } catch (err) {
      console.error('[AuthContext] Login Error:', err);
      return { success: false, error: 'An unexpected error occurred.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await apiLogoutUser();
      toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAccess = (module, page) => {
    if (userRole === 'OWNER') return true;
    if (userRole === 'STAFF') {
      if (!permissions) return false;
      if (module === 'sales' && !permissions.sales_module) return false;
      if (module === 'expenses' && !permissions.expenses_module) return false;
      
      const key = `${module}_${page}`.replace(/-/g, '_').toLowerCase();
      if (page === 'dashboard') return !!permissions[`${module}_module`];
      return !!permissions[key];
    }
    return false;
  };

  const isOwner = () => userRole === 'OWNER';
  const isStaff = () => userRole === 'STAFF';

  return (
    <AuthContext.Provider value={{
      currentUser,
      userRole,
      permissions,
      isAuthenticated,
      isLoading,
      error,
      login: loginWithCredentials,
      loginWithCredentials,
      logout: logoutUser,
      logoutUser,
      hasAccess,
      isOwner,
      isStaff
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);