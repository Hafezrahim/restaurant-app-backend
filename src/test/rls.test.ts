/**
 * RLS / access control regression tests.
 *
 * Verifies that the security fixes applied to the Supabase backend stay in place:
 *  - restaurant_settings: 'general' row is hidden from anon, other keys readable
 *  - reservations: guest (anon, user_id=null) can insert; anon cannot insert with a fake user_id
 *  - orders: guest can insert with user_id=null; anon cannot read others' orders
 *  - sensitive tables (profiles, user_roles, rewards, notifications, coupon_usage) are not readable by anon
 *  - public tables (categories, menu_items, delivery_zones) remain readable
 *
 * Run with: bunx vitest run src/test/rls.test.ts
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

declare const process: { env: Record<string, string | undefined> };
const SUPABASE_URL =
  (typeof process !== "undefined" && process.env.VITE_SUPABASE_URL) ||
  "https://tbdhusuyokibidemwzcw.supabase.co";
const SUPABASE_ANON_KEY =
  (typeof process !== "undefined" && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZGh1c3V5b2tpYmlkZW13emN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MjIwMDMsImV4cCI6MjA5MDE5ODAwM30.do0CrRu3ay5VsQxdJdvdkByRlz9WhcD7vu8XoRTvCPE";

const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

describe("restaurant_settings RLS", () => {
  it("anon cannot read the 'general' row (sensitive admin contact)", async () => {
    const { data, error } = await anon
      .from("restaurant_settings")
      .select("*")
      .eq("key", "general");
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("anon can read non-sensitive keys (working_hours, delivery, etc.)", async () => {
    const { data, error } = await anon
      .from("restaurant_settings")
      .select("key")
      .neq("key", "general");
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
    expect((data ?? []).every((r: any) => r.key !== "general")).toBe(true);
  });
});

describe("reservations RLS (guest insert)", () => {
  it("anon can create a reservation with user_id = null", async () => {
    const { data, error } = await anon
      .from("reservations")
      .insert({
        name: "RLS Test Guest",
        phone: "0000000000",
        date: new Date().toISOString().split("T")[0],
        time: "20:00",
        guests: 2,
        notes: "automated rls test - safe to delete",
      })
      .select()
      .single();
    expect(error).toBeNull();
    expect(data?.user_id).toBeNull();
  });

  it("anon cannot insert a reservation with a forged user_id", async () => {
    const { error } = await anon.from("reservations").insert({
      user_id: "00000000-0000-0000-0000-000000000001",
      name: "RLS Test Forged",
      phone: "0000000000",
      date: new Date().toISOString().split("T")[0],
      time: "20:00",
      guests: 2,
    });
    expect(error).not.toBeNull();
  });

  it("anon cannot read reservations table", async () => {
    const { data, error } = await anon.from("reservations").select("id").limit(1);
    // either RLS hides rows (empty) or returns error — both are acceptable
    expect(error ? true : (data ?? []).length === 0).toBe(true);
  });
});

describe("orders RLS (guest checkout)", () => {
  it("anon can create an order with user_id = null", async () => {
    const orderNumber = `RLS-${Date.now()}`;
    const { data, error } = await anon
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: "RLS Guest",
        customer_phone: "0000000000",
        subtotal: 0,
        total: 0,
      })
      .select()
      .single();
    expect(error).toBeNull();
    expect(data?.user_id).toBeNull();
  });

  it("anon cannot list orders", async () => {
    const { data } = await anon.from("orders").select("id").limit(5);
    expect((data ?? []).length).toBe(0);
  });
});

describe("sensitive tables are not anon-readable", () => {
  const tables = [
    "profiles",
    "user_roles",
    "rewards",
    "notifications",
    "coupon_usage",
  ] as const;

  for (const t of tables) {
    it(`anon cannot read ${t}`, async () => {
      const { data, error } = await anon.from(t).select("*").limit(1);
      expect(error ? true : (data ?? []).length === 0).toBe(true);
    });
  }

  it("anon cannot insert into user_roles (privilege escalation)", async () => {
    const { error } = await anon.from("user_roles").insert({
      user_id: "00000000-0000-0000-0000-000000000001",
      role: "admin",
    });
    expect(error).not.toBeNull();
  });

  it("anon cannot update restaurant_settings", async () => {
    const { error } = await anon
      .from("restaurant_settings")
      .update({ value: { hacked: true } })
      .eq("key", "delivery");
    expect(error).not.toBeNull();
  });
});

describe("public catalog tables remain readable", () => {
  it("anon can read categories", async () => {
    const { data, error } = await anon.from("categories").select("id").limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("anon can read menu_items", async () => {
    const { data, error } = await anon.from("menu_items").select("id").limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("anon can read delivery_zones", async () => {
    const { data, error } = await anon
      .from("delivery_zones")
      .select("id")
      .limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("anon can read approved reviews only", async () => {
    const { data, error } = await anon
      .from("reviews")
      .select("is_approved")
      .limit(50);
    expect(error).toBeNull();
    expect((data ?? []).every((r: any) => r.is_approved === true)).toBe(true);
  });
});
