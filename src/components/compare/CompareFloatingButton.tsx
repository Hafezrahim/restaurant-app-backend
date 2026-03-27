import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { cn } from '@/lib/utils';

export const CompareFloatingButton: React.FC = () => {
  const { compareItems } = useCompare();
  const navigate = useNavigate();

  if (compareItems.length === 0) return null;

  return (
    <button
      onClick={() => navigate('/compare')}
      className={cn(
        'fixed bottom-24 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full',
        'bg-primary text-primary-foreground shadow-elevated',
        'hover:bg-primary/90 transition-all duration-300',
        'animate-scale-in'
      )}
    >
      <GitCompare className="w-5 h-5" />
      <span className="font-bold">{compareItems.length}</span>
      <span className="text-sm">مقارنة</span>
    </button>
  );
};
