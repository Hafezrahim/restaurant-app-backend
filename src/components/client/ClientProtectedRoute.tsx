import React from 'react';
import { Navigate } from 'react-router-dom';
import { useClientAuth } from '@/context/ClientAuthContext';

export const ClientProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useClientAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/client/login" replace />;
  return <>{children}</>;
};
