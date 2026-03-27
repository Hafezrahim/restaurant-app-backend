import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { CompareFloatingButton } from '@/components/compare/CompareFloatingButton';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, showSearch }) => {
  return (
    <div className="min-h-screen bg-background pb-[calc(var(--nav-height)+1rem)] md:pb-4">
      <Header title={title} showSearch={showSearch} />
      <main className="px-4 py-4 max-w-screen-xl mx-auto">
        {children}
      </main>
      <CompareFloatingButton />
      <BottomNav />
    </div>
  );
};
