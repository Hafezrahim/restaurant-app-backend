import React from 'react';
import { Navigate } from 'react-router-dom';
import { useClientAuth } from '@/context/ClientAuthContext';

export const ClientProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useClientAuth();
  if (!isAuthenticated) return <Navigate to="/client/login" replace />;
  return <>{children}</>;
};
