import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      }, { signal: controller.signal } as any);
      clearTimeout(timeout);
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return data === true;
    } catch (e) {
      console.error('Admin role check failed/timed out:', e);
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let initialCheckDone = false;

    // Restore session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      initialCheckDone = true;
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id);
        if (!mounted) return;
        setUser(isAdmin ? session.user : null);
        setIsAuthenticated(isAdmin);
      }
      setIsLoading(false);
    });

    // Only handle subsequent auth changes (not the initial one)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      // Skip INITIAL_SESSION - handled by getSession above
      if (event === 'INITIAL_SESSION') return;
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      // For SIGNED_IN after login, the login() function already sets state
      // Only handle TOKEN_REFRESHED here
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        const isAdmin = await checkAdminRole(session.user.id);
        if (!mounted) return;
        setUser(isAdmin ? session.user : null);
        setIsAuthenticated(isAdmin);
      }
    });

    // Safety timeout - never stay loading forever
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setIsLoading(false);
      }
    }, 6000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const isAdmin = await checkAdminRole(data.user.id);
      if (!isAdmin) {
        await supabase.auth.signOut();
        return { success: false, error: 'ليس لديك صلاحيات الوصول للوحة التحكم' };
      }
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, error: 'حدث خطأ غير متوقع' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
