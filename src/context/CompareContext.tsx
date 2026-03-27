import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MenuItem } from '@/types';

interface CompareContextType {
  compareItems: MenuItem[];
  addToCompare: (item: MenuItem) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<MenuItem[]>([]);

  const addToCompare = (item: MenuItem) => {
    if (compareItems.length >= 4) {
      return; // Max 4 items
    }
    if (!compareItems.find(i => i.id === item.id)) {
      setCompareItems([...compareItems, item]);
    }
  };

  const removeFromCompare = (id: string) => {
    setCompareItems(compareItems.filter(item => item.id !== id));
  };

  const isInCompare = (id: string) => {
    return compareItems.some(item => item.id === id);
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
