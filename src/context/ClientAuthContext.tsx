import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  login: (email: string, password: string) => boolean;
  register: (data: { name: string; email: string; phone: string; password: string }) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<ClientUser>) => void;
}

const CLIENT_AUTH_KEY = 'mazaj_client_auth';
const CLIENT_USERS_KEY = 'mazaj_client_users';

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export const ClientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ClientUser | null>(() => {
    const stored = localStorage.getItem(CLIENT_AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(CLIENT_AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CLIENT_AUTH_KEY);
    }
  }, [user]);

  const getUsers = (): Record<string, { user: ClientUser; password: string }> => {
    const stored = localStorage.getItem(CLIENT_USERS_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const saveUsers = (users: Record<string, { user: ClientUser; password: string }>) => {
    localStorage.setItem(CLIENT_USERS_KEY, JSON.stringify(users));
  };

  const login = useCallback((email: string, password: string): boolean => {
    const users = getUsers();
    const entry = users[email];
    if (entry && entry.password === password) {
      setUser(entry.user);
      return true;
    }
    return false;
  }, []);

  const register = useCallback((data: { name: string; email: string; phone: string; password: string }): boolean => {
    const users = getUsers();
    if (users[data.email]) return false;
    const newUser: ClientUser = {
      id: Date.now().toString(36),
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };
    users[data.email] = { user: newUser, password: data.password };
    saveUsers(users);
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<ClientUser>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      // Also update in users store
      const users = getUsers();
      if (users[prev.email]) {
        users[prev.email].user = updated;
        if (data.email && data.email !== prev.email) {
          users[data.email] = users[prev.email];
          delete users[prev.email];
        }
        saveUsers(users);
      }
      return updated;
    });
  }, []);

  return (
    <ClientAuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) throw new Error('useClientAuth must be used within ClientAuthProvider');
  return context;
};
