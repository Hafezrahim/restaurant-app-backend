import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useClientAuth } from './ClientAuthContext';

export interface ClientNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'reward' | 'info';
  read: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: ClientNotification[];
  unreadCount: number;
  addNotification: (n: Omit<ClientNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NOTIF_KEY = 'mazaj_client_notifications';

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useClientAuth();

  const getStored = (): Record<string, ClientNotification[]> => {
    const s = localStorage.getItem(NOTIF_KEY);
    return s ? JSON.parse(s) : {};
  };

  const [notifications, setNotifications] = useState<ClientNotification[]>(() => {
    if (!user) return [];
    return getStored()[user.id] || [];
  });

  useEffect(() => {
    if (user) {
      setNotifications(getStored()[user.id] || []);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const save = (userId: string, notifs: ClientNotification[]) => {
    const all = getStored();
    all[userId] = notifs;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
  };

  const addNotification = useCallback((n: Omit<ClientNotification, 'id' | 'read' | 'createdAt'>) => {
    if (!user) return;
    const notif: ClientNotification = {
      ...n,
      id: Date.now().toString(36),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => {
      const updated = [notif, ...prev].slice(0, 50);
      save(user.id, updated);
      return updated;
    });
  }, [user]);

  const markAsRead = useCallback((id: string) => {
    if (!user) return;
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      save(user.id, updated);
      return updated;
    });
  }, [user]);

  const markAllAsRead = useCallback(() => {
    if (!user) return;
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      save(user.id, updated);
      return updated;
    });
  }, [user]);

  const clearAll = useCallback(() => {
    if (!user) return;
    setNotifications([]);
    save(user.id, []);
  }, [user]);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
  return context;
};
