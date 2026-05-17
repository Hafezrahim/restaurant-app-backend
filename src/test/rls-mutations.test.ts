/**
 * RLS regression tests for UPDATE / DELETE and cross-user denial.
 *
 * Verifies that the anon role cannot:
 *  - update or delete reservations (own/guest/forged user_id)
 *  - update or delete orders
 *  - update or delete order_items
 *  - update or delete profiles / user_roles / rewards / notifications / coupons /
 *    coupon_usage / favorites / reviews / restaurant_settings / categories /
 *    menu_items / delivery_zones
 *
 * In Supabase, RLS denial for UPDATE/DELETE returns either an error OR a
 * successful response with 0 affected rows. Both are treated as "blocked".
 *
 * Run: bunx vitest run src/test/rls-mutations.test.ts
 */
import { describe, it, expect } from "vitest";
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

const FAKE_UUID_A = "00000000-0000-0000-0000-000000000001";
const FAKE_UUID_B = "00000000-0000-0000-0000-000000000002";

const isBlocked = (error: unknown, data: unknown[] | null | undefined) =>
  !!error || (data ?? []).length === 0;

describe("reservations: UPDATE/DELETE blocked for anon", () => {
  it("anon cannot update any reservation", async () => {
    const { data, error } = await anon
      .from("reservations")
      .update({ status: "confirmed", guests: 99 })
      .eq("user_id", FAKE_UUID_A)
      .select();
    expect(isBlocked(error, data)).toBe(true);
  });

  it("anon cannot update a forged cross-user reservation by id", async () => {
    const { data, error } = await anon
      .from("reservations")
      .update({ notes: "hacked" })
      .neq("id", FAKE_UUID_A) // attempt to touch everything
      .select();
    expect(isBlocked(error, data)).toBe(true);
  });

  it("anon cannot delete reservations", async () => {
    const { data, error } = await anon
      .from("reservations")
      .delete()
      .neq("id", FAKE_UUID_A)
      .select();
    expect(isBlocked(error, data)).toBe(true);
  });
});

describe("orders: UPDATE/DELETE blocked for anon", () => {
  it("anon cannot update any order", async () => {
    const { data, error } = await anon
      .from("orders")
      .update({ status: "delivered", total: 0 })
      .neq("id", FAKE_UUID_A)
      .select();
    expect(isBlocked(error, data)).toBe(true);
  });

  it("anon cannot update orders belonging to another user", async () => {
    const { data, error } = await anon
      .from("orders")
      .update({ status: "cancelled" })
      .eq("user_id", FAKE_UUID_B)
      .select();
    expect(isBlocked(error, data)).toBe(true);
  });

  it("anon cannot delete orders", async () => {
    const { data, error } = await anon
      .from("orders")
      .delete()
      .neq("id", FAKE_UUID_A)
      .select();
    expect(isBlocked(error, data)).toBe(true);
  });
});

describe("order_items: UPDATE/DELETE blocked for anon", () => {
  it("anon cannot update order_items", async () => {
    const { data, error } = await anon
      .from("order_items")
      .update({ price: 0, quantity: 0 })
      .neq("id", FAKE_UUID_A)
      .select();
    expect(isBlocked(error, data)).toBe(true);
  });

  it("anon cannot delete order_items", async () => {
    const { data, error } = await anon
      .from("order_items")
      .delete()
      .neq("id", FAKE_UUID_A)
      .select();
    expect(isBlocked(error, data)).toBe(true);
  });
});

describe("sensitive tables: UPDATE/DELETE blocked for anon (cross-user denial)", () => {
  const targets: { table: string; update: Record<string, unknown> }[] = [
    { table: "profiles", update: { name: "pwned" } },
    { table: "user_roles", update: { role: "admin" } },
    { table: "rewards", update: { points: 999999 } },
    { table: "notifications", update: { is_read: true } },
    { table: "coupons", update: { is_active: false } },
    { table: "coupon_usage", update: { user_id: FAKE_UUID_A } },
    { table: "favorites", update: { user_id: FAKE_UUID_A } },
    { table: "reviews", update: { is_approved: true } },
    { table: "restaurant_settings", update: { value: { hacked: true } } },
    { table: "categories", update: { name: "hacked" } },
    { table: "menu_items", update: { price: 0 } },
    { table: "delivery_zones", update: { price: 0 } },
  ];

  for (const { table, update } of targets) {
    it(`anon cannot UPDATE ${table}`, async () => {
      const { data, error } = await (anon.from(table as any) as any)
        .update(update)
        .neq("id", FAKE_UUID_A)
        .select();
      expect(isBlocked(error, data)).toBe(true);
    });

    it(`anon cannot DELETE from ${table}`, async () => {
      const { data, error } = await (anon.from(table as any) as any)
        .delete()
        .neq("id", FAKE_UUID_A)
        .select();
      expect(isBlocked(error, data)).toBe(true);
    });
  }
});

describe("cross-user INSERT denial (impersonation)", () => {
  it("anon cannot insert a favorite for another user", async () => {
    const { error } = await anon.from("favorites").insert({
      user_id: FAKE_UUID_A,
      menu_item_id: FAKE_UUID_B,
    });
    expect(error).not.toBeNull();
  });

  it("anon cannot insert a review on behalf of another user", async () => {
    const { error } = await anon.from("reviews").insert({
      user_id: FAKE_UUID_A,
      rating: 5,
      reviewer_name: "forged",
    });
    expect(error).not.toBeNull();
  });

  it("anon cannot insert coupon_usage on behalf of another user", async () => {
    const { error } = await anon.from("coupon_usage").insert({
      user_id: FAKE_UUID_A,
      coupon_id: FAKE_UUID_B,
    });
    expect(error).not.toBeNull();
  });

  it("anon cannot insert a notification", async () => {
    const { error } = await anon.from("notifications").insert({
      user_id: FAKE_UUID_A,
      title: "forged",
    });
    expect(error).not.toBeNull();
  });

  it("anon cannot insert a reward", async () => {
    const { error } = await anon.from("rewards").insert({
      user_id: FAKE_UUID_A,
      points: 99999,
      reason: "forged",
    });
    expect(error).not.toBeNull();
  });
});
