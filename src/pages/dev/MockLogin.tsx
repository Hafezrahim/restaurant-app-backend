import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, ChefHat, Wallet, Users, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppRole, ROLE_LABELS } from "@/hooks/useUserRole";

const ROLES: { role: Extract<AppRole, "admin" | "manager" | "cashier" | "kitchen" | "customer">; icon: React.ReactNode; redirect: string; desc: string }[] = [
  { role: "admin", icon: <Crown className="w-6 h-6" />, redirect: "/admin", desc: "وصول كامل للوحة التحكم" },
  { role: "manager", icon: <ShieldCheck className="w-6 h-6" />, redirect: "/admin", desc: "إدارة الطلبات والقوائم والحجوزات" },
  { role: "cashier", icon: <Wallet className="w-6 h-6" />, redirect: "/admin/orders", desc: "إدارة الطلبات والمدفوعات فقط" },
  { role: "kitchen", icon: <ChefHat className="w-6 h-6" />, redirect: "/admin/orders", desc: "متابعة الطلبات قيد التحضير" },
  { role: "customer", icon: <Users className="w-6 h-6" />, redirect: "/client/dashboard", desc: "حساب عميل عادي" },
];

/**
 * Dev-only mock login. Calls the dev-mock-login edge function which
 * creates/refreshes a demo Supabase user with the requested role,
 * then signs in here with the returned credentials.
 *
 * In production the edge function is disabled via the
 * DEV_MOCK_LOGIN_ENABLED secret.
 */
const MockLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const loginAs = async (role: string, redirect: string) => {
    setLoadingRole(role);
    try {
      const { data, error } = await supabase.functions.invoke("dev-mock-login", { body: { role } });
      if (error || !data?.email) {
        toast.error(data?.error || error?.message || "تعذّر تسجيل الدخول التجريبي");
        return;
      }
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInErr) {
        toast.error(signInErr.message);
        return;
      }
      toast.success(`تم تسجيل الدخول كـ ${ROLE_LABELS[role as AppRole]}`);
      navigate(redirect, { replace: true });
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>تسجيل دخول تجريبي - مزاج</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-background to-muted/40 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">تسجيل دخول تجريبي</h1>
            <p className="text-muted-foreground text-sm">
              اختر أحد الأدوار للدخول بحساب تجريبي محمي بـ RBAC على قاعدة البيانات.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => loginAs(r.role, r.redirect)}
                disabled={loadingRole !== null}
                className="text-right p-5 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-elegant transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {r.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{ROLE_LABELS[r.role]}</div>
                  <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
                  {loadingRole === r.role && (
                    <div className="text-xs text-primary mt-2">جارٍ تسجيل الدخول…</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>عودة للرئيسية</Button>
            <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); toast.success("تم تسجيل الخروج"); }}>
              تسجيل خروج
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MockLogin;
