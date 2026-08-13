// Server-side authoritative order creation.
// All financial values (prices, subtotal, tax, discount, totals, coupon validity,
// reward points redemption) are computed from the database and NEVER trusted
// from the client. The client only supplies cart item ids + quantities,
// a coupon code (optional), redeemPoints flag (optional), customer details,
// delivery zone id, payment method, and notes.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface CartItem { id: string; quantity: number; }

interface Body {
  items: CartItem[];
  customer: { name: string; phone: string; address: string; lat?: number; lng?: number };
  delivery_zone_id?: string;
  payment_method: "cash" | "card" | "bank_transfer";
  notes?: string;
  coupon_code?: string;
  redeem_points?: boolean;
}

const TAX_RATE = 0.15;
const SAR_PER_POINT = 0.1;
const MIN_REDEEM = 50;

function generateTrackingNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MZJ-${ts}-${rnd}`;
}

function bad(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return bad(405, "Method not allowed");

  // Optional auth — guests allowed
  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    const anon = createClient(supabaseUrl, anonKey);
    const { data, error } = await anon.auth.getUser(token);
    if (!error && data?.user?.id) userId = data.user.id;
  }

  let body: Body;
  try { body = await req.json(); } catch { return bad(400, "Invalid JSON"); }

  // Basic validation
  if (!Array.isArray(body.items) || body.items.length === 0) return bad(400, "Cart is empty");
  if (body.items.length > 100) return bad(400, "Too many items");
  for (const it of body.items) {
    if (!it.id || typeof it.id !== "string") return bad(400, "Invalid item id");
    if (!Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > 99) return bad(400, "Invalid quantity");
  }
  if (!body.customer?.name || !body.customer?.phone || !body.customer?.address) return bad(400, "Missing customer info");
  if (body.customer.name.length > 120 || body.customer.phone.length > 40 || body.customer.address.length > 500) return bad(400, "Field too long");
  if (!["cash", "card", "bank_transfer"].includes(body.payment_method)) return bad(400, "Invalid payment method");

  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // 1) Authoritative menu item prices
  const ids = [...new Set(body.items.map((i) => i.id))];
  const { data: menuRows, error: menuErr } = await admin
    .from("menu_items").select("id, name, name_ar, price, is_available").in("id", ids);
  if (menuErr) return bad(500, "Failed to read menu");
  const menuMap = new Map(menuRows!.map((r) => [r.id, r]));
  for (const it of body.items) {
    const m = menuMap.get(it.id);
    if (!m) return bad(400, `Item not found: ${it.id}`);
    if (!m.is_available) return bad(400, `Item not available: ${m.name}`);
  }

  // 2) Authoritative delivery fee
  let deliveryFee = 0;
  if (body.delivery_zone_id) {
    const { data: zone } = await admin
      .from("delivery_zones").select("price, is_active").eq("id", body.delivery_zone_id).maybeSingle();
    if (zone && zone.is_active) deliveryFee = Number(zone.price);
  }

  // 3) Subtotal & tax from DB prices
  const orderItemsRows = body.items.map((it) => {
    const m = menuMap.get(it.id)!;
    return {
      menu_item_id: it.id,
      name: m.name_ar || m.name,
      price: Number(m.price),
      quantity: it.quantity,
    };
  });
  const subtotal = orderItemsRows.reduce((s, r) => s + r.price * r.quantity, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);

  // 4) Coupon (server-validated against DB)
  let couponDiscount = 0;
  let couponRow: { id: string; code: string; used_count: number; usage_limit: number; per_user_limit?: number } | null = null;
  if (body.coupon_code) {
    const code = body.coupon_code.trim().toUpperCase();
    const { data: c } = await admin
      .from("coupons").select("*").eq("code", code).eq("is_active", true).maybeSingle();
    if (!c) return bad(400, "كود الخصم غير صالح");
    if (c.expires_at && new Date(c.expires_at) < new Date()) return bad(400, "كود الخصم منتهي الصلاحية");
    if (subtotal < Number(c.min_order)) return bad(400, `الحد الأدنى للطلب ${c.min_order} ر.س`);
    if ((c.used_count ?? 0) >= c.usage_limit) return bad(400, "تم استخدام هذا الكود بالحد الأقصى");

    // Per-user limit (defaults to 1) — applies to authenticated users only.
    // Guests cannot be tracked, so per-user enforcement is skipped for them.
    if (userId) {
      const perUserLimit = Number((c as any).per_user_limit ?? 1);
      const { count } = await admin
        .from("coupon_usage").select("id", { count: "exact", head: true })
        .eq("coupon_id", c.id).eq("user_id", userId);
      if ((count ?? 0) >= perUserLimit) return bad(400, "تم استخدامك لهذا الكود بالحد الأقصى");
    }

    if (c.type === "percentage") {
      couponDiscount = (subtotal * Number(c.value)) / 100;
      if (c.max_discount) couponDiscount = Math.min(couponDiscount, Number(c.max_discount));
    } else {
      couponDiscount = Number(c.value);
    }
    couponDiscount = Math.min(couponDiscount, subtotal);
    couponRow = c as any;
  }

  // 5) Points redemption (server computes balance).
  // Only the authenticated user's balance is honored; guest requests are ignored.
  let pointsRedeemed = 0;
  let pointsDiscount = 0;
  if (body.redeem_points && userId) {
    const { data: rewardRows } = await admin
      .from("rewards").select("points").eq("user_id", userId);
    const balance = (rewardRows || []).reduce((s, r) => s + (r.points ?? 0), 0);
    if (balance >= MIN_REDEEM) {
      pointsRedeemed = balance;
      pointsDiscount = +(balance * SAR_PER_POINT).toFixed(2);
    }
  }

  const totalBeforeDiscount = subtotal + deliveryFee + tax;
  const total = Math.max(0, +(totalBeforeDiscount - pointsDiscount - couponDiscount).toFixed(2));
  const tracking = generateTrackingNumber();

  // 6) Insert order
  const { data: order, error: orderErr } = await admin.from("orders").insert({
    order_number: tracking,
    user_id: userId,
    customer_name: body.customer.name,
    customer_phone: body.customer.phone,
    delivery_address: body.customer.address,
    delivery_lat: body.customer.lat ?? null,
    delivery_lng: body.customer.lng ?? null,
    notes: (body.notes ?? "").slice(0, 1000) || null,
    payment_method: body.payment_method,
    subtotal,
    delivery_fee: deliveryFee,
    discount: pointsDiscount + couponDiscount,
    total,
    coupon_code: couponRow?.code ?? null,
    status: "pending",
  }).select("id").single();
  if (orderErr || !order) return bad(500, "Failed to create order");

  // 7) Order items
  const { error: itemsErr } = await admin.from("order_items")
    .insert(orderItemsRows.map((r) => ({ ...r, order_id: order.id })));
  if (itemsErr) {
    await admin.from("orders").delete().eq("id", order.id);
    return bad(500, "Failed to save items");
  }

  // 8) Coupon usage — atomic increment via RPC to avoid lost updates under concurrency.
  if (couponRow) {
    await admin.from("coupon_usage").insert({
      coupon_id: couponRow.id, user_id: userId, order_id: order.id,
    });
    await admin.rpc("increment_coupon_usage", { _coupon_id: couponRow.id });
  }

  // 9) Rewards: deduct redeemed, then award new based on (total / 1 SAR = 1 point)
  if (userId) {
    if (pointsRedeemed > 0) {
      await admin.from("rewards").insert({
        user_id: userId, points: -pointsRedeemed, reason: `استبدال على الطلب ${tracking}`, order_id: order.id,
      });
    }
    const earned = Math.floor(total);
    if (earned > 0) {
      await admin.from("rewards").insert({
        user_id: userId, points: earned, reason: `نقاط من الطلب ${tracking}`, order_id: order.id,
      });
    }
  }

  return new Response(JSON.stringify({
    order_id: order.id,
    tracking_number: tracking,
    subtotal, delivery_fee: deliveryFee, tax,
    coupon_discount: couponDiscount, points_discount: pointsDiscount,
    points_redeemed: pointsRedeemed,
    total,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
