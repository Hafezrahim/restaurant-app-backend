/**
 * Security regression check — fails CI if any of the security-scan findings
 * we already fixed come back. Keep this list aligned with findings the team
 * has explicitly remediated in migrations / project config.
 *
 * Required environment variables:
 *   SUPABASE_DB_URL         Postgres connection string (service-role / db owner)
 *   SUPABASE_ACCESS_TOKEN   Personal access token for the Management API
 *   SUPABASE_PROJECT_REF    e.g. tbdhusuyokibidemwzcw
 *
 * Exit code 0 = all checks pass, 1 = at least one regression.
 */
import { Client } from "pg";

type CheckResult = { id: string; ok: boolean; detail: string };

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DB_URL = process.env.SUPABASE_DB_URL;

if (!DB_URL) {
  console.error("SUPABASE_DB_URL is required");
  process.exit(2);
}

async function checkSecurityDefinerExecutable(client: Client): Promise<CheckResult[]> {
  // has_role is intentionally executable by authenticated (used inside RLS).
  const ALLOWED_AUTHENTICATED = new Set(["has_role"]);
  const { rows } = await client.query<{
    proname: string;
    grantee: string;
  }>(`
    SELECT p.proname, r.rolname AS grantee
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN LATERAL aclexplode(p.proacl) a ON true
    JOIN pg_roles r ON r.oid = a.grantee
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND a.privilege_type = 'EXECUTE'
      AND r.rolname IN ('anon', 'authenticated');
  `);

  const anonLeaks = rows.filter((r) => r.grantee === "anon");
  const authLeaks = rows.filter(
    (r) => r.grantee === "authenticated" && !ALLOWED_AUTHENTICATED.has(r.proname),
  );

  return [
    {
      id: "SUPA_anon_security_definer_function_executable",
      ok: anonLeaks.length === 0,
      detail: anonLeaks.length
        ? `anon can EXECUTE: ${anonLeaks.map((r) => r.proname).join(", ")}`
        : "no SECURITY DEFINER functions executable by anon",
    },
    {
      id: "SUPA_authenticated_security_definer_function_executable",
      ok: authLeaks.length === 0,
      detail: authLeaks.length
        ? `authenticated can EXECUTE (not allow-listed): ${authLeaks.map((r) => r.proname).join(", ")}`
        : "no unexpected SECURITY DEFINER functions executable by authenticated",
    },
  ];
}

async function checkPgGraphqlDisabled(client: Client): Promise<CheckResult[]> {
  const { rows } = await client.query(
    `SELECT 1 FROM pg_extension WHERE extname = 'pg_graphql';`,
  );
  const disabled = rows.length === 0;
  return [
    {
      id: "SUPA_pg_graphql_anon_table_exposed",
      ok: disabled,
      detail: disabled ? "pg_graphql extension is not installed" : "pg_graphql extension is installed",
    },
    {
      id: "SUPA_pg_graphql_authenticated_table_exposed",
      ok: disabled,
      detail: disabled ? "pg_graphql extension is not installed" : "pg_graphql extension is installed",
    },
  ];
}

async function checkLeakedPasswordProtection(): Promise<CheckResult> {
  const id = "SUPA_auth_leaked_password_protection";
  if (!PROJECT_REF || !ACCESS_TOKEN) {
    return {
      id,
      ok: false,
      detail: "SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN required to verify this check",
    };
  }
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } },
  );
  if (!res.ok) {
    return { id, ok: false, detail: `Management API error ${res.status}` };
  }
  const cfg = (await res.json()) as { password_hibp_enabled?: boolean };
  const enabled = cfg.password_hibp_enabled === true;
  return {
    id,
    ok: enabled,
    detail: enabled ? "leaked password protection is enabled" : "leaked password protection is disabled",
  };
}

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const results: CheckResult[] = [];
  try {
    results.push(...(await checkSecurityDefinerExecutable(client)));
    results.push(...(await checkPgGraphqlDisabled(client)));
    results.push(await checkLeakedPasswordProtection());
  } finally {
    await client.end();
  }

  let failed = 0;
  for (const r of results) {
    const icon = r.ok ? "✅" : "❌";
    console.log(`${icon} ${r.id} — ${r.detail}`);
    if (!r.ok) failed++;
  }

  if (failed > 0) {
    console.error(`\n${failed} security regression(s) detected. Failing build.`);
    process.exit(1);
  }
  console.log("\nAll monitored security findings remain remediated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
