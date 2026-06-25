// Dev-only mock authentication. Creates/refreshes a demo user for the
// requested role and returns sign-in credentials. The frontend then calls
// supabase.auth.signInWithPassword() with the returned email/password.
//
// Security: this function is gated by the DEV_MOCK_LOGIN_ENABLED secret
// (must equal "true") so it can be disabled in production with one flip.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ALLOWED_ROLES = ["admin", "manager", "cashier", "kitchen", "customer"] as const;
type Role = typeof ALLOWED_ROLES[number];

const DEMO_PASSWORD = "Demo12345!";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (Deno.env.get("DEV_MOCK_LOGIN_ENABLED") !== "true") {
      return new Response(JSON.stringify({ error: "Mock login is disabled" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { role } = await req.json().catch(() => ({}));
    if (!ALLOWED_ROLES.includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const email = `${role}@demo.mazaj.test`;
    const name = `Demo ${role}`;

    // Find or create the auth user.
    let userId: string | null = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);
    if (existing) {
      userId = existing.id;
      // Reset password so the same credentials always work.
      await admin.auth.admin.updateUserById(existing.id, { password: DEMO_PASSWORD, email_confirm: true });
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { name, phone: "" },
      });
      if (createErr || !created.user) {
        return new Response(JSON.stringify({ error: createErr?.message || "Failed to create user" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = created.user.id;
    }

    // Ensure exactly the requested role (and remove other RBAC roles so demo accounts stay scoped).
    await admin.from("user_roles").delete().eq("user_id", userId);
    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role: role as Role });
    if (roleErr && !roleErr.message.includes("duplicate")) {
      return new Response(JSON.stringify({ error: roleErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ email, password: DEMO_PASSWORD, role }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
