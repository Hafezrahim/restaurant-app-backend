import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRole, AppRole } from "@/hooks/useUserRole";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allow: AppRole[];
  /** Where to send the user when they are signed in but lack the role. */
  fallback?: string;
  /** Where to send the user when they are not signed in. */
  loginPath?: string;
}

/**
 * Route guard backed by the database user_roles table. Anyone without
 * one of the allowed roles is redirected — there is no client-side
 * role bypass because checks go through Supabase auth + user_roles.
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allow,
  fallback = "/",
  loginPath = "/dev/login",
}) => {
  const { isLoading, hasRole, userId } = useUserRole();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (!hasRole(allow)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
