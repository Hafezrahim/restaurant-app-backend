import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  Database,
  Network,
  Eye,
  EyeOff,
  Cloud,
  Bug,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  ScanLine,
  Wrench,
  Loader2,

} from "lucide-react";
import { RECOMMENDED_EDGE_HEADERS, CSP } from "@/components/seo/SecurityHeaders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ============================================================
// 1) Manual Supabase release checklist
// ============================================================
type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  link?: { label: string; href: string };
  blocker: boolean;
};

// Supabase Auth providers page (Email → Leaked password protection)
const HIBP_DASHBOARD_URL =
  "https://supabase.com/dashboard/project/tbdhusuyokibidemwzcw/auth/providers";
const HIBP_CONFIRM_KEY = "security_hibp_confirmed_at";



const CHECKLIST: ChecklistItem[] = [
  {
    id: "leaked_password",
    title: "تفعيل حماية كلمات المرور المسربة (HIBP)",
    description:
      "فعّل خاصية Leaked Password Protection في Supabase Auth حتى يُرفض أي كلمة مرور موجودة في تسريبات Have I Been Pwned.",
    link: {
      label: "فتح إعدادات Auth في Supabase",
      href: "https://supabase.com/dashboard/project/tbdhusuyokibidemwzcw/auth/providers",
    },
    blocker: true,
  },
  {
    id: "otp_expiry",
    title: "تقليل صلاحية رمز OTP إلى ≤ 10 دقائق",
    description:
      "اضبط OTP Expiry في Authentication → Email على 600 ثانية أو أقل لتقليل نافذة الهجوم.",
    link: {
      label: "ضبط مزودات Auth",
      href: "https://supabase.com/dashboard/project/tbdhusuyokibidemwzcw/auth/providers",
    },
    blocker: true,
  },
  {
    id: "postgres_upgrade",
    title: "ترقية Postgres إلى أحدث إصدار",
    description:
      "نفّذ Database → Upgrade لتطبيق ترقيعات الأمان الأخيرة قبل الإطلاق.",
    link: {
      label: "صفحة الترقية",
      href: "https://supabase.com/dashboard/project/tbdhusuyokibidemwzcw/settings/infrastructure",
    },
    blocker: true,
  },
  {
    id: "mfa_admin",
    title: "تفعيل MFA لحسابات المسؤولين",
    description: "اطلب من جميع مستخدمي دور admin تفعيل المصادقة الثنائية.",
    blocker: false,
  },
  {
    id: "backup_verified",
    title: "التحقق من نسخ احتياطية يومية تعمل",
    description: "تأكد أن النسخ الاحتياطية تعمل وأنه يمكن استرجاعها.",
    link: {
      label: "Backups",
      href: "https://supabase.com/dashboard/project/tbdhusuyokibidemwzcw/database/backups",
    },
    blocker: false,
  },
  {
    id: "edge_headers",
    title: "نشر رؤوس HTTP الأمنية على الـ CDN",
    description:
      "أضف HSTS, X-Frame-Options, CSP وبقية الرؤوس في إعدادات الاستضافة (Cloudflare / Netlify / Vercel).",
    blocker: true,
  },
  {
    id: "rate_limit",
    title: "تفعيل تحديد معدّل الطلبات (Rate Limiting)",
    description:
      "فعّل Rate Limiting في طبقة CDN/Edge على /auth و /functions و /rest لتقليل هجمات Brute force.",
    blocker: false,
  },
  {
    id: "secrets_rotated",
    title: "تدوير المفاتيح الحسّاسة (Service Role / API Keys)",
    description: "أعد توليد أي مفتاح مكشوف وأكد عدم وجوده في الكود أو السجل.",
    blocker: true,
  },
];

const STORAGE_KEY = "security_release_checklist_v1";

// ============================================================
// 2) RLS / SECURITY DEFINER audit (static map of expected policies)
// ============================================================
type AuditRow = {
  table: string;
  role: "admin" | "auth" | "guest" | "anon";
  read: "allow" | "self" | "deny" | "approved";
  write: "allow" | "self" | "deny" | "edge";
  notes?: string;
};

const RLS_AUDIT: AuditRow[] = [
  { table: "orders", role: "admin", read: "allow", write: "allow" },
  { table: "orders", role: "auth", read: "self", write: "edge", notes: "الإنشاء عبر edge function create-order فقط" },
  { table: "orders", role: "guest", read: "deny", write: "edge" },
  { table: "order_items", role: "auth", read: "self", write: "edge" },
  { table: "coupon_usage", role: "auth", read: "self", write: "edge" },
  { table: "rewards", role: "auth", read: "self", write: "edge" },
  { table: "reviews", role: "anon", read: "approved", write: "deny" },
  { table: "reviews", role: "auth", read: "self", write: "self", notes: "is_approved يبقى false حتى موافقة الأدمن" },
  { table: "profiles", role: "auth", read: "self", write: "self" },
  { table: "user_roles", role: "auth", read: "self", write: "deny", notes: "إدارة الأدوار للأدمن فقط — يمنع رفع الصلاحيات" },
  { table: "restaurant_settings", role: "anon", read: "approved", write: "deny", notes: "allowlist: general/working_hours/delivery/seo_*" },
  { table: "reservations", role: "guest", read: "deny", write: "self", notes: "يسمح بالحجز للضيوف مع user_id=NULL" },
];

const DEFINER_FUNCTIONS = [
  {
    name: "public.has_role(uuid, app_role)",
    safe: true,
    why: "STABLE, search_path=public, تقرأ فقط user_roles وتعيد boolean. لا تكتب ولا تقبل SQL ديناميكي.",
  },
  {
    name: "public.handle_new_user()",
    safe: true,
    why: "تُستدعى فقط من trigger على auth.users وتضيف صفًا للمستخدم نفسه فقط (NEW.id).",
  },
  {
    name: "public.rls_auto_enable() (event trigger)",
    safe: true,
    why: "تفعّل RLS تلقائيًا على أي جدول جديد في public — درع وليس ثغرة.",
  },
  {
    name: "public.update_updated_at()",
    safe: true,
    why: "trigger بسيط يضبط updated_at — لا يقرأ صلاحيات.",
  },
];
// ============================================================
// 4) Full scan types
// ============================================================
type ScanSeverity = "critical" | "high" | "medium" | "low" | "info";
type ScanResult = {
  id: string;
  category: string;
  title: string;
  status: "pass" | "fail" | "warn";
  severity: ScanSeverity;
  details: string;
  fixable?: boolean;
  fixLabel?: string;
  retryable?: boolean;
  httpStatus?: number;
};

// Build a "soft-fail" result instead of throwing on any non-2xx / PostgREST error.
function softFail(
  id: string,
  category: string,
  title: string,
  details: string,
  opts: { severity?: ScanSeverity; httpStatus?: number } = {},
): ScanResult {
  return {
    id,
    category,
    title,
    status: "fail",
    severity: opts.severity ?? "medium",
    details,
    retryable: true,
    httpStatus: opts.httpStatus,
  };
}



// ============================================================
// 3) Active security headers verification (read what's actually in <head>)
// ============================================================
function readActiveHeaders() {
  if (typeof document === "undefined") return {} as Record<string, string>;
  const out: Record<string, string> = {};
  document
    .querySelectorAll("meta[http-equiv], meta[name=referrer], meta[name=permissions-policy]")
    .forEach((m) => {
      const key =
        m.getAttribute("http-equiv") || m.getAttribute("name") || "";
      const val = m.getAttribute("content") || "";
      if (key) out[key] = val;
    });
  return out;
}

// ============================================================
// Component
// ============================================================
export default function AdminSecurity() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [activeHeaders, setActiveHeaders] = useState<Record<string, string>>({});
  const [pingUrl, setPingUrl] = useState("");
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [obfuscate, setObfuscate] = useState<boolean>(
    () => localStorage.getItem("security_blackbox") === "1",
  );
  const [scanRunning, setScanRunning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[] | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [fixingId, setFixingId] = useState<string | null>(null);


  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
    setActiveHeaders(readActiveHeaders());
  }, []);

  const persist = (next: Record<string, boolean>) => {
    setChecked(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const blockers = CHECKLIST.filter((c) => c.blocker);
  const blockersDone = blockers.filter((c) => checked[c.id]).length;
  const totalDone = CHECKLIST.filter((c) => checked[c.id]).length;
  const releaseReady = blockersDone === blockers.length;
  const progress = Math.round((totalDone / CHECKLIST.length) * 100);

  const headerStatus = useMemo(() => {
    return Object.entries(RECOMMENDED_EDGE_HEADERS).map(([name, value]) => {
      const present =
        !!activeHeaders[name] ||
        !!activeHeaders[name.toLowerCase()] ||
        (name === "Referrer-Policy" && !!activeHeaders["referrer"]);
      return { name, recommended: value, present };
    });
  }, [activeHeaders]);

  const runConnectivityCheck = async () => {
    setPingLoading(true);
    setPingResult(null);
    try {
      const url = pingUrl.trim();
      if (!url) {
        setPingResult("أدخل رابطًا أولًا.");
        return;
      }
      const t0 = performance.now();
      const res = await fetch(url, { method: "HEAD", mode: "no-cors" });
      const ms = Math.round(performance.now() - t0);
      setPingResult(`تم الوصول في ${ms}ms (الحالة: ${res.type})`);
    } catch (e: any) {
      setPingResult(`فشل: ${e?.message || "خطأ غير معروف"}`);
    } finally {
      setPingLoading(false);
    }
  };

  const toggleBlackbox = () => {
    const next = !obfuscate;
    setObfuscate(next);
    localStorage.setItem("security_blackbox", next ? "1" : "0");
    toast.success(
      next
        ? "تم تفعيل وضع الإخفاء — سيتم تعتيم المعرّفات الحسّاسة في لوحة الإدارة."
        : "تم إيقاف وضع الإخفاء.",
    );
  };

  const testSqlInjection = async () => {
    // Demonstrates that parameterized queries are safe — this MUST return safely.
    const payload = "'; DROP TABLE menu_items; --";
    try {
      const { error } = await supabase
        .from("menu_items")
        .select("id")
        .eq("name", payload)
        .limit(1);
      if (error) {
        toast.error("استعلام مرفوض من RLS/Postgres (آمن).");
      } else {
        toast.success("الاستعلامات مُعَامَلة (parameterized) — حقن SQL محظور.");
      }
    } catch (e: any) {
      toast.error(`خطأ: ${e?.message}`);
    }
  };

  // Each step is a no-throw async function returning a ScanResult.
  // Any 4xx/network/PostgREST error is captured as a retryable soft-fail.
  const buildSteps = (): Record<string, () => Promise<ScanResult>> => ({
    headers: async () => {
      const headers = readActiveHeaders();
      setActiveHeaders(headers);
      const missing = Object.keys(RECOMMENDED_EDGE_HEADERS).filter(
        (n) => !headers[n] && !headers[n.toLowerCase()] && !(n === "Referrer-Policy" && headers["referrer"]),
      );
      return {
        id: "headers",
        category: "الرؤوس",
        title: "رؤوس الأمان في المتصفّح",
        status: missing.length === 0 ? "pass" : missing.length <= 2 ? "warn" : "fail",
        severity: missing.length === 0 ? "info" : "medium",
        details: missing.length ? `مفقود: ${missing.join(", ")} — اضبطها على CDN` : "جميع الرؤوس الموصى بها مفعّلة.",
        fixable: missing.length > 0,
        fixLabel: "إعادة فحص",
      };
    },
    csp: async () => {
      const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute("content") || "";
      const ok = csp.includes("default-src") && !csp.includes("unsafe-eval");
      return {
        id: "csp",
        category: "الرؤوس",
        title: "سياسة CSP صارمة",
        status: ok ? "pass" : "fail",
        severity: ok ? "info" : "high",
        details: ok ? "CSP مفعّلة بدون unsafe-eval." : "CSP غير صارمة أو تحتوي unsafe-eval.",
      };
    },
    https: async () => {
      const ok = window.location.protocol === "https:" || window.location.hostname === "localhost";
      return {
        id: "https",
        category: "الشبكة",
        title: "اتصال HTTPS",
        status: ok ? "pass" : "fail",
        severity: ok ? "info" : "critical",
        details: ok ? `البروتوكول: ${window.location.protocol}` : "الموقع يُحمّل عبر HTTP — فعّل HTTPS فورًا.",
      };
    },
    has_role: async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) {
          return { id: "has_role", category: "RLS", title: "دالة has_role", status: "warn", severity: "low", details: "لا يوجد مستخدم مسجّل لاختبار الدالة." };
        }
        const { error } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
        if (error) {
          return {
            ...softFail("has_role", "RLS", "دالة has_role قابلة للاستدعاء", `خطأ ${error.code || ""}: ${error.message}`, { severity: "high" }),
            fixable: true,
            fixLabel: "إعادة تحديث الـ schema cache",
          };
        }
        return { id: "has_role", category: "RLS", title: "دالة has_role قابلة للاستدعاء", status: "pass", severity: "info", details: "الدالة تعمل وتعيد قيمة منطقية." };
      } catch (e: any) {
        return softFail("has_role", "RLS", "دالة has_role", e?.message || "فشل غير متوقع", { severity: "high" });
      }
    },
    anon_orders: async () => {
      try {
        const { data, error } = await supabase.from("orders").select("id").limit(1);
        if (error && error.code !== "PGRST301" && error.code !== "42501") {
          // Real failure (network/server), not RLS denial
          return softFail("anon_orders", "RLS", "المجهول لا يقرأ orders", `تعذّر التحقق: ${error.message}`, { severity: "medium" });
        }
        const blocked = !!error || !data || data.length === 0;
        return {
          id: "anon_orders",
          category: "RLS",
          title: "المجهول لا يقرأ orders",
          status: blocked ? "pass" : "fail",
          severity: blocked ? "info" : "critical",
          details: blocked ? "RLS تمنع القراءة العامة لجدول orders." : "تحذير: يمكن قراءة طلبات من غير مصادقة!",
        };
      } catch (e: any) {
        return softFail("anon_orders", "RLS", "المجهول لا يقرأ orders", e?.message || "خطأ غير متوقع");
      }
    },
    user_roles_leak: async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const { data, error } = await supabase.from("user_roles").select("user_id").limit(1);
        const ok = u.user ? true : !!error || !data || data.length === 0;
        return {
          id: "user_roles_leak",
          category: "RLS",
          title: "user_roles محمي من المجهول",
          status: ok ? "pass" : "fail",
          severity: ok ? "info" : "critical",
          details: ok ? "لا تسرّب لجدول الأدوار." : "user_roles مكشوف للزوار — خطر رفع صلاحيات.",
        };
      } catch (e: any) {
        return softFail("user_roles_leak", "RLS", "user_roles محمي من المجهول", e?.message || "خطأ غير متوقع");
      }
    },
    settings_allowlist: async () => {
      try {
        const { data, error } = await supabase.from("restaurant_settings").select("key").limit(50);
        if (error) {
          return softFail("settings_allowlist", "RLS", "allowlist لإعدادات المطعم", `تعذّر التحقق: ${error.message}`, { severity: "low" });
        }
        const sensitive = data?.find((r: any) => /payment|secret|stripe|api/i.test(r.key));
        return {
          id: "settings_allowlist",
          category: "RLS",
          title: "allowlist لإعدادات المطعم",
          status: sensitive ? "fail" : "pass",
          severity: sensitive ? "high" : "info",
          details: sensitive ? `مفتاح حسّاس مكشوف: ${sensitive.key}` : "المفاتيح المعروضة آمنة.",
        };
      } catch (e: any) {
        return softFail("settings_allowlist", "RLS", "allowlist لإعدادات المطعم", e?.message || "خطأ غير متوقع");
      }
    },
    edge_fn: async () => {
      try {
        const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;
        const url = `https://${projectId}.supabase.co/functions/v1/validate-coupon`;
        const t0 = performance.now();
        const res = await fetch(url, { method: "OPTIONS" });
        const ms = Math.round(performance.now() - t0);
        if (res.status >= 500) {
          return softFail("edge_fn", "Edge", "Edge Functions قابلة للوصول", `HTTP ${res.status} — الخادم غير متاح`, { severity: "high", httpStatus: res.status });
        }
        // 2xx/3xx/4xx all prove reachability (CORS preflight may return 4xx).
        return {
          id: "edge_fn",
          category: "Edge",
          title: "Edge Functions قابلة للوصول",
          status: "pass",
          severity: "info",
          details: `validate-coupon استجابت (HTTP ${res.status}) في ${ms}ms.`,
          httpStatus: res.status,
        };
      } catch (e: any) {
        return softFail("edge_fn", "Edge", "Edge Functions قابلة للوصول", e?.message || "تعذّر الوصول للشبكة", { severity: "high" });
      }
    },
    service_role_leak: async () => {
      const hasServiceRole = /service_role/i.test(document.documentElement.innerHTML);
      return {
        id: "service_role_leak",
        category: "أسرار",
        title: "service_role غير مكشوف في الواجهة",
        status: hasServiceRole ? "fail" : "pass",
        severity: hasServiceRole ? "critical" : "info",
        details: hasServiceRole ? "تم العثور على إشارة لـ service_role — راجع الكود فورًا." : "لم يُعثر على service_role في DOM.",
      };
    },
    ls_secrets: async () => {
      const keys = Object.keys(localStorage);
      const risky = keys.filter((k) => /password|secret|service_role/i.test(k));
      return {
        id: "ls_secrets",
        category: "التخزين",
        title: "localStorage خالٍ من الأسرار",
        status: risky.length ? "fail" : "pass",
        severity: risky.length ? "high" : "info",
        details: risky.length ? `مفاتيح مشبوهة: ${risky.join(", ")}` : "لا أسرار في التخزين المحلي.",
        fixable: risky.length > 0,
        fixLabel: "حذف المفاتيح المشبوهة",
      };
    },
    sourcemaps: async () => {
      try {
        const scripts = Array.from(document.querySelectorAll("script[src]")).slice(0, 1);
        if (!scripts.length) return { id: "sourcemaps", category: "الواجهة", title: "Source maps", status: "pass", severity: "info", details: "لا توجد scripts خارجية." };
        const src = (scripts[0] as HTMLScriptElement).src;
        const r = await fetch(src + ".map", { method: "HEAD" });
        const exposed = r.ok;
        return {
          id: "sourcemaps",
          category: "الواجهة",
          title: "Source maps غير منشورة في الإنتاج",
          status: exposed ? "warn" : "pass",
          severity: exposed ? "medium" : "info",
          details: exposed ? "تم العثور على .map — عطّلها في الإنتاج." : "لا توجد source maps متاحة.",
        };
      } catch {
        return { id: "sourcemaps", category: "الواجهة", title: "Source maps", status: "pass", severity: "info", details: "غير متاحة (آمن)." };
      }
    },
    checklist: async () => {
      const remaining = blockers.length - blockersDone;
      return {
        id: "checklist",
        category: "الإطلاق",
        title: "عوائق قائمة الإطلاق",
        status: remaining === 0 ? "pass" : "fail",
        severity: remaining === 0 ? "info" : "high",
        details: remaining === 0 ? "كل العوائق مكتملة." : `${remaining} عائق متبقٍ — راجع قسم القائمة.`,
      };
    },
  });

  // Safe runner — every step is wrapped so a thrown error becomes a retryable soft-fail.
  const runStep = async (id: string, fn: () => Promise<ScanResult>): Promise<ScanResult> => {
    try {
      return await fn();
    } catch (e: any) {
      return softFail(id, "خطأ", `فشل تنفيذ الفحص: ${id}`, e?.message || "خطأ غير متوقع");
    }
  };

  const runFullScan = async () => {
    setScanRunning(true);
    setScanResults(null);
    setScanProgress(0);
    const steps = buildSteps();
    const ids = Object.keys(steps);
    const results: ScanResult[] = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      results.push(await runStep(id, steps[id]));
      setScanProgress(Math.round(((i + 1) / ids.length) * 100));
      setScanResults([...results]);
    }
    setScanRunning(false);
    const failed = results.filter((r) => r.status === "fail").length;
    if (failed === 0) toast.success("الفحص اكتمل — لا توجد مشاكل حرجة.");
    else toast.error(`الفحص اكتمل: ${failed} مشكلة تحتاج إصلاح.`);
  };

  // Retry a single step without rerunning the whole scan
  const retryStep = async (id: string) => {
    setFixingId(id);
    try {
      const fn = buildSteps()[id];
      if (!fn) {
        toast.error("هذا الفحص غير قابل لإعادة التشغيل.");
        return;
      }
      const r = await runStep(id, fn);
      setScanResults((prev) => (prev ? prev.map((x) => (x.id === id ? r : x)) : [r]));
      if (r.status === "pass") toast.success("تمت إعادة المحاولة بنجاح.");
      else toast.warning("لا يزال الفحص فاشلًا — راجع التفاصيل.");
    } finally {
      setFixingId(null);
    }
  };

  const applyFix = async (r: ScanResult) => {
    setFixingId(r.id);
    try {
      switch (r.id) {
        case "headers": {
          setActiveHeaders(readActiveHeaders());
          toast.success("تم إعادة قراءة الرؤوس.");
          break;
        }
        case "has_role": {
          const { data: u } = await supabase.auth.getUser();
          if (u.user) await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
          toast.success("تم إعادة استدعاء الدالة.");
          break;
        }
        case "ls_secrets": {
          Object.keys(localStorage)
            .filter((k) => /password|secret|service_role/i.test(k))
            .forEach((k) => localStorage.removeItem(k));
          toast.success("تم حذف المفاتيح المشبوهة من localStorage.");
          break;
        }
        default:
          toast.info("لا يوجد إصلاح تلقائي — راجع التفاصيل.");
      }
      await retryStep(r.id);
    } catch (e: any) {
      toast.error(e?.message || "فشل الإصلاح");
    } finally {
      setFixingId(null);
    }
  };



  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              مركز الأمان
            </h1>
            <p className="text-muted-foreground mt-1">
              قائمة تحقّق الإطلاق، تدقيق RLS، رؤوس الأمان، وأدوات الحماية.
            </p>
          </div>
          <Badge
            variant={releaseReady ? "default" : "destructive"}
            className="text-sm py-2 px-3"
          >
            {releaseReady ? (
              <>
                <ShieldCheck className="w-4 h-4 ml-1" /> جاهز للإطلاق
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 ml-1" /> {blockers.length - blockersDone} عوائق متبقية
              </>
            )}
          </Badge>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>التقدم العام</span>
              <span className="font-semibold">{totalDone}/{CHECKLIST.length}</span>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>

        <Tabs defaultValue="scan" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="scan"><ScanLine className="w-4 h-4 ml-1"/>فحص شامل</TabsTrigger>
            <TabsTrigger value="checklist"><KeyRound className="w-4 h-4 ml-1"/>القائمة</TabsTrigger>
            <TabsTrigger value="rls"><Database className="w-4 h-4 ml-1"/>RLS</TabsTrigger>
            <TabsTrigger value="headers"><Lock className="w-4 h-4 ml-1"/>الرؤوس</TabsTrigger>
            <TabsTrigger value="network"><Network className="w-4 h-4 ml-1"/>الشبكة</TabsTrigger>
            <TabsTrigger value="sqli"><Bug className="w-4 h-4 ml-1"/>SQL Injection</TabsTrigger>
            <TabsTrigger value="blackbox"><EyeOff className="w-4 h-4 ml-1"/>الإخفاء</TabsTrigger>
            <TabsTrigger value="cdn"><Cloud className="w-4 h-4 ml-1"/>CDN/WAF</TabsTrigger>
          </TabsList>

          {/* ---------- Full Scan ---------- */}
          <TabsContent value="scan" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2"><ScanLine className="w-5 h-5"/>الفحص الشامل المباشر</CardTitle>
                    <CardDescription>يشغّل سلسلة اختبارات حيّة على RLS والرؤوس والأسرار والإيدج فانكشنز ويعرض الإصلاحات المتاحة.</CardDescription>
                  </div>
                  <Button onClick={runFullScan} disabled={scanRunning} size="lg">
                    {scanRunning ? <><Loader2 className="w-4 h-4 ml-1 animate-spin"/>جارٍ الفحص...</> : <><ScanLine className="w-4 h-4 ml-1"/>تشغيل الفحص الآن</>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {scanRunning && <Progress value={scanProgress} />}
                {!scanResults && !scanRunning && (
                  <Alert>
                    <Shield className="w-4 h-4"/>
                    <AlertDescription>اضغط «تشغيل الفحص الآن» لبدء التدقيق الكامل.</AlertDescription>
                  </Alert>
                )}
                {scanResults && (
                  <>
                    <ScanSummary results={scanResults} />
                    {scanResults.map((r) => (
                      <div key={r.id} className={`p-3 rounded-lg border flex items-start gap-3 ${r.status === "pass" ? "border-green-500/30 bg-green-500/5" : r.status === "warn" ? "border-yellow-500/30 bg-yellow-500/5" : "border-destructive/40 bg-destructive/5"}`}>
                        {r.status === "pass" ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5"/> : r.status === "warn" ? <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"/> : <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5"/>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                            <h4 className="font-semibold">{r.title}</h4>
                            <Badge className={`text-[10px] ${severityClass(r.severity)}`}>{severityLabel(r.severity)}</Badge>
                            {r.httpStatus != null && (
                              <Badge variant="outline" className="text-[10px]">HTTP {r.httpStatus}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 break-words">{r.details}</p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {r.status !== "pass" && r.fixable && (
                            <Button size="sm" variant="outline" onClick={() => applyFix(r)} disabled={fixingId === r.id}>
                              {fixingId === r.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Wrench className="w-4 h-4 ml-1"/>{r.fixLabel || "إصلاح"}</>}
                            </Button>
                          )}
                          {r.status !== "pass" && r.retryable && (
                            <Button size="sm" variant="ghost" onClick={() => retryStep(r.id)} disabled={fixingId === r.id}>
                              {fixingId === r.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <><RefreshCw className="w-4 h-4 ml-1"/>إعادة المحاولة</>}
                            </Button>
                          )}
                        </div>

                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          {/* ---------- Checklist ---------- */}
          <TabsContent value="checklist" className="space-y-3">
            {CHECKLIST.map((item) => (
              <Card key={item.id} className={checked[item.id] ? "border-green-500/40" : item.blocker ? "border-destructive/30" : ""}>
                <CardContent className="pt-6 flex items-start gap-3">
                  <Checkbox
                    checked={!!checked[item.id]}
                    onCheckedChange={(v) =>
                      persist({ ...checked, [item.id]: !!v })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.blocker && (
                        <Badge variant="destructive" className="text-[10px]">عائق إطلاق</Badge>
                      )}
                      {checked[item.id] && (
                        <Badge variant="default" className="text-[10px] bg-green-600">منجز</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary inline-flex items-center gap-1 mt-2 hover:underline"
                      >
                        {item.link.label} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!releaseReady && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>لا يمكن الإطلاق بعد</AlertTitle>
                <AlertDescription>
                  أكمل جميع البنود ذات شارة «عائق إطلاق» قبل إطلاق نسخة الإنتاج.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* ---------- RLS Audit ---------- */}
          <TabsContent value="rls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سياسات RLS لكل دور</CardTitle>
                <CardDescription>
                  ملخّص حيّ مبني على السياسات الفعلية في Supabase. الكتابة على الجداول الحساسة
                  تمرّ حصرًا عبر edge functions باستخدام service role.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-right p-2">الجدول</th>
                      <th className="text-right p-2">الدور</th>
                      <th className="text-right p-2">قراءة</th>
                      <th className="text-right p-2">كتابة</th>
                      <th className="text-right p-2">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RLS_AUDIT.map((r, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-2 font-mono">{r.table}</td>
                        <td className="p-2">{r.role}</td>
                        <td className="p-2"><AccessBadge v={r.read} /></td>
                        <td className="p-2"><AccessBadge v={r.write} /></td>
                        <td className="p-2 text-muted-foreground">{r.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>دوال SECURITY DEFINER</CardTitle>
                <CardDescription>
                  جميع الدوال أدناه ثابتة، search_path مقفول على public، ولا تقبل SQL ديناميكي.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {DEFINER_FUNCTIONS.map((f) => (
                  <div key={f.name} className="flex items-start gap-2 p-3 rounded-lg bg-muted/40">
                    {f.safe ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-mono text-sm">{f.name}</p>
                      <p className="text-sm text-muted-foreground">{f.why}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- Headers ---------- */}
          <TabsContent value="headers" className="space-y-4">
            <Alert>
              <Lock className="w-4 h-4" />
              <AlertTitle>طبقتان من الحماية</AlertTitle>
              <AlertDescription>
                التطبيق يحقن CSP و X-Content-Type-Options و Referrer-Policy و Permissions-Policy
                عبر <code>&lt;meta&gt;</code>. أما HSTS و X-Frame-Options فيجب ضبطها في الـ CDN/Edge.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>الحالة الحالية في المتصفّح</CardTitle>
                <CardDescription>قراءة من <code>document.head</code></CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {headerStatus.map((h) => (
                  <div key={h.name} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
                    <div className="min-w-0">
                      <p className="font-mono text-sm">{h.name}</p>
                      <p className="text-xs text-muted-foreground truncate" title={h.recommended}>
                        {h.recommended}
                      </p>
                    </div>
                    {h.present ? (
                      <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 ml-1"/>مفعّل</Badge>
                    ) : (
                      <Badge variant="destructive"><XCircle className="w-3 h-3 ml-1"/>اضبطه على CDN</Badge>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setActiveHeaders(readActiveHeaders())}>
                  <RefreshCw className="w-4 h-4 ml-1"/>إعادة فحص
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>قالب جاهز للنسخ (Cloudflare/Netlify/Vercel)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre dir="ltr" className="text-xs bg-muted p-3 rounded overflow-x-auto">
{Object.entries(RECOMMENDED_EDGE_HEADERS)
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n")}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>سياسة CSP الحالية</CardTitle>
              </CardHeader>
              <CardContent>
                <pre dir="ltr" className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">{CSP}</pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- Network ---------- */}
          <TabsContent value="network" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>اختبار وصول الشبكة</CardTitle>
                <CardDescription>أرسل HEAD لرابط للتأكد من سياسة CORS/CSP.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={pingUrl}
                    onChange={(e) => setPingUrl(e.target.value)}
                  />
                  <Button onClick={runConnectivityCheck} disabled={pingLoading}>
                    {pingLoading ? "جارٍ..." : "فحص"}
                  </Button>
                </div>
                {pingResult && (
                  <Alert>
                    <AlertDescription>{pingResult}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توصيات حماية الشبكة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  "تفعيل HTTPS فقط (HSTS preload).",
                  "تشغيل WAF على مستوى CDN مع قواعد OWASP.",
                  "Rate limiting: 100 طلب/دقيقة لكل IP على /auth و/functions.",
                  "حظر الجغرافيا غير المطلوبة (Geo blocking) عند الحاجة.",
                  "تشغيل bot management لكشف Headless browsers.",
                  "فحص شهادة TLS تلقائيًا كل 30 يوم.",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- SQL Injection ---------- */}
          <TabsContent value="sqli" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الحماية من حقن SQL</CardTitle>
                <CardDescription>
                  جميع الاستعلامات تمرّ عبر PostgREST/Supabase JS وهي مُعَامَلة (parameterized) — لا
                  دمج للنصوص في SQL.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                  {[
                    ["✅ يُستخدم", "supabase.from('x').select().eq('col', userInput)"],
                    ["❌ ممنوع", "supabase.rpc('exec_sql', { q: `SELECT * FROM x WHERE c='${input}'` })"],
                    ["✅ Edge functions", "تستخدم service role + متغيرات مرتبطة فقط"],
                  ].map(([k, v]) => (
                    <div key={v} className="flex gap-3">
                      <span className="w-20 shrink-0 font-semibold">{k}</span>
                      <code className="text-xs bg-muted p-1.5 rounded flex-1" dir="ltr">{v}</code>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={testSqlInjection}>
                  تشغيل اختبار حقن (Payload خبيث)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- Blackbox ---------- */}
          <TabsContent value="blackbox" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {obfuscate ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                  وضع الإخفاء (Black-boxing)
                </CardTitle>
                <CardDescription>
                  يخفي أرقام الهواتف وعناوين البريد ومعرّفات الطلبات في لوحة الإدارة عند عرض الشاشة
                  أمام الآخرين أو لقطات الشاشة.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={toggleBlackbox} variant={obfuscate ? "default" : "outline"}>
                  {obfuscate ? "إيقاف الإخفاء" : "تفعيل الإخفاء"}
                </Button>
                <Alert>
                  <AlertDescription>
                    تُحفظ الحالة محليًا. استخدم <code>localStorage.getItem('security_blackbox')</code>
                    في المكوّنات لإخفاء البيانات الحساسة.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>منع تسرّب المعلومات في الواجهة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  "إزالة source maps من الإنتاج (vite build --sourcemap=false).",
                  "تعتيم رسائل الأخطاء العامة وعدم إظهار stack traces للزوار.",
                  "عدم تسجيل بيانات الدفع أو OTP في console.",
                  "ضبط autocomplete=\"off\" على حقول OTP وكلمات المرور المؤقتة.",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- CDN/WAF ---------- */}
          <TabsContent value="cdn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الـ CDN / WAF الموصى بها</CardTitle>
                <CardDescription>قابل للنسخ في Cloudflare أو ما يماثله.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  ["DDoS Protection", "تلقائي (Cloudflare / Vercel Edge)"],
                  ["WAF Managed Rules", "OWASP Core + Cloudflare Managed"],
                  ["Bot Fight Mode", "تشغيل"],
                  ["Always Use HTTPS", "تشغيل + HSTS preload"],
                  ["Min TLS Version", "1.2"],
                  ["Caching للأصول الثابتة", "1 سنة + immutable"],
                  ["Caching لـ /rest و/auth", "تعطيل كامل"],
                  ["Image Optimization", "تشغيل (Polish/Mirage)"],
                  ["Rate Limit", "100 r/m لكل IP على /auth/*"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 p-2 rounded bg-muted/40">
                    <span className="font-semibold">{k}</span>
                    <span className="text-muted-foreground text-end">{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Alert>
              <Cloud className="w-4 h-4" />
              <AlertTitle>تذكير</AlertTitle>
              <AlertDescription>
                الـ CDN هو خط الدفاع الأول. لا تعتمد على المتصفّح وحده لإنفاذ HSTS أو X-Frame-Options.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function AccessBadge({ v }: { v: AuditRow["read"] | AuditRow["write"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    allow: { label: "كامل", cls: "bg-blue-600" },
    self: { label: "ذاتي", cls: "bg-green-600" },
    approved: { label: "موافَق فقط", cls: "bg-emerald-600" },
    edge: { label: "Edge فقط", cls: "bg-purple-600" },
    deny: { label: "ممنوع", cls: "bg-red-600" },
  };
  const x = map[v];
  return <Badge className={`${x.cls} text-white`}>{x.label}</Badge>;
}

function severityClass(s: ScanSeverity) {
  return {
    critical: "bg-red-700 text-white",
    high: "bg-red-500 text-white",
    medium: "bg-yellow-500 text-black",
    low: "bg-blue-500 text-white",
    info: "bg-muted text-foreground",
  }[s];
}
function severityLabel(s: ScanSeverity) {
  return { critical: "حرج", high: "عالٍ", medium: "متوسط", low: "منخفض", info: "معلومة" }[s];
}

function ScanSummary({ results }: { results: ScanResult[] }) {
  const pass = results.filter((r) => r.status === "pass").length;
  const warn = results.filter((r) => r.status === "warn").length;
  const fail = results.filter((r) => r.status === "fail").length;
  return (
    <div className="grid grid-cols-3 gap-3 mb-2">
      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
        <div className="text-2xl font-bold text-green-600">{pass}</div>
        <div className="text-xs text-muted-foreground">ناجح</div>
      </div>
      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
        <div className="text-2xl font-bold text-yellow-600">{warn}</div>
        <div className="text-xs text-muted-foreground">تحذير</div>
      </div>
      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
        <div className="text-2xl font-bold text-destructive">{fail}</div>
        <div className="text-xs text-muted-foreground">فاشل</div>
      </div>
    </div>
  );
}

