import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
}

interface ClientAuthContextType {
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<ClientUser>) => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

const mapProfile = (profile: any, userId: string): ClientUser => ({
  id: userId,
  name: profile?.name ?? '',
  email: profile?.email ?? '',
  phone: profile?.phone ?? '',
  address: profile?.address ?? undefined,
  lat: profile?.lat ?? undefined,
  lng: profile?.lng ?? undefined,
  createdAt: profile?.created_at ?? new Date().toISOString(),
});

export const ClientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setIsLoading(false);
        if (newSession?.user) {
          // Defer Supabase call to avoid client deadlock
          setTimeout(async () => {
            const profile = await fetchProfile(newSession.user.id);
            setUser(mapProfile(profile ?? { email: newSession.user.email }, newSession.user.id));
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session: existing } }) => {
      setSession(existing);
      setIsLoading(false);
      if (existing?.user) {
        const profile = await fetchProfile(existing.user.id);
        setUser(mapProfile(profile ?? { email: existing.user.email }, existing.user.id));
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const register = useCallback(async (data: { name: string; email: string; phone: string; password: string }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
        },
      },
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<ClientUser>) => {
    if (!user) return;
    const updates: Record<string, any> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.email !== undefined) updates.email = data.email;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.address !== undefined) updates.address = data.address;
    if (data.lat !== undefined) updates.lat = data.lat;
    if (data.lng !== undefined) updates.lng = data.lng;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  }, [user]);

  return (
    <ClientAuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) throw new Error('useClientAuth must be used within ClientAuthProvider');
  return context;
};
