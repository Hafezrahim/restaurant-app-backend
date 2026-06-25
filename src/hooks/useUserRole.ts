import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "manager" | "cashier" | "kitchen" | "customer" | "moderator" | "user";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "مدير عام",
  manager: "مدير فرع",
  cashier: "كاشير",
  kitchen: "مطبخ",
  customer: "عميل",
  moderator: "مشرف",
  user: "مستخدم",
};

interface UseUserRoleResult {
  roles: AppRole[];
  isLoading: boolean;
  hasRole: (role: AppRole | AppRole[]) => boolean;
  userId: string | null;
}

/**
 * Reads the signed-in user's roles from the public.user_roles table.
 * Roles are the single source of truth for RBAC — never trusted from client storage.
 */
export const useUserRole = (): UseUserRoleResult => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (uid: string | null) => {
      if (!uid) {
        if (!cancelled) {
          setRoles([]);
          setUserId(null);
          setIsLoading(false);
        }
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if (cancelled) return;
      setUserId(uid);
      setRoles(((data ?? []).map((r) => r.role)) as AppRole[]);
      setIsLoading(false);
    };

    supabase.auth.getUser().then(({ data }) => load(data.user?.id ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoading(true);
      load(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: AppRole | AppRole[]) => {
    const list = Array.isArray(role) ? role : [role];
    return list.some((r) => roles.includes(r));
  };

  return { roles, isLoading, hasRole, userId };
};
