// Server-side coupon validation (dry-run).
// Returns the discount preview without consuming any usage. The authoritative
// discount is recomputed inside create-order when the order is placed.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

function bad(status: number, error: string) {
  return new Response(JSON.stringify({ valid: false, error }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return bad(405, "Method not allowed");

  let body: { code?: string; subtotal?: number };
  try { body = await req.json(); } catch { return bad(400, "Invalid JSON"); }

  const code = (body.code ?? "").trim().toUpperCase();
  const subtotal = Number(body.subtotal ?? 0);
  if (!code) return bad(400, "يرجى إدخال كود الخصم");
  if (!Number.isFinite(subtotal) || subtotal <= 0) return bad(400, "السلة فارغة");

  // Optional user — used only to check per-user limit
  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  if (authHeader?.startsWith("Bearer ")) {
    const anon = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data } = await anon.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (data?.claims?.sub) userId = data.claims.sub as string;
  }

  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: c } = await admin.from("coupons").select("*").eq("code", code).eq("is_active", true).maybeSingle();
  if (!c) return bad(400, "كود الخصم غير صالح");
  if (c.expires_at && new Date(c.expires_at) < new Date()) return bad(400, "كود الخصم منتهي الصلاحية");
  if (subtotal < Number(c.min_order)) return bad(400, `الحد الأدنى للطلب ${c.min_order} ر.س`);
  if ((c.used_count ?? 0) >= c.usage_limit) return bad(400, "تم استخدام هذا الكود بالحد الأقصى");
  if (userId) {
    const { count } = await admin.from("coupon_usage").select("id", { count: "exact", head: true })
      .eq("coupon_id", c.id).eq("user_id", userId);
    if ((count ?? 0) >= c.usage_limit) return bad(400, "تم استخدامك لهذا الكود سابقاً");
  }

  let discount = 0;
  if (c.type === "percentage") {
    discount = (subtotal * Number(c.value)) / 100;
    if (c.max_discount) discount = Math.min(discount, Number(c.max_discount));
  } else {
    discount = Number(c.value);
  }
  discount = Math.min(discount, subtotal);

  return new Response(JSON.stringify({
    valid: true, discount, code: c.code, description: c.description,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
