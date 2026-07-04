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

type CheckResult = {
  id: string;
  ok: boolean;
  detail: string;
  /** Human-readable title of the finding this check guards against. */
  title?: string;
  /** Concrete offenders (function names, extensions, etc.) when a check fails. */
  offenders?: string[];
  /** Ordered remediation steps to print when a check fails. */
  remediation?: string[];
  /** Link to authoritative docs for this finding. */
  docs?: string;
};


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
      title: "Anonymous users can execute SECURITY DEFINER function(s)",
      ok: anonLeaks.length === 0,
      offenders: anonLeaks.map((r) => `public.${r.proname}(...)`),
      detail: anonLeaks.length
        ? `anon can EXECUTE: ${anonLeaks.map((r) => r.proname).join(", ")}`
        : "no SECURITY DEFINER functions executable by anon",
      remediation: [
        "Add a Supabase migration that revokes execute for anon on each offender:",
        ...anonLeaks.map(
          (r) => `  REVOKE EXECUTE ON FUNCTION public.${r.proname}(...) FROM anon, PUBLIC;`,
        ),
        "Confirm the function is only invoked from trusted callers (triggers, edge functions with service_role, or authenticated RLS via has_role).",
      ],
      docs: "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    },
    {
      id: "SUPA_authenticated_security_definer_function_executable",
      title: "Signed-in users can execute SECURITY DEFINER function(s)",
      ok: authLeaks.length === 0,
      offenders: authLeaks.map((r) => `public.${r.proname}(...)`),
      detail: authLeaks.length
        ? `authenticated can EXECUTE (not allow-listed): ${authLeaks.map((r) => r.proname).join(", ")}`
        : "no unexpected SECURITY DEFINER functions executable by authenticated",
      remediation: [
        "Add a Supabase migration that revokes execute for authenticated on each offender:",
        ...authLeaks.map(
          (r) => `  REVOKE EXECUTE ON FUNCTION public.${r.proname}(...) FROM authenticated;`,
        ),
        `If a helper must remain callable by signed-in users (like has_role for RLS), add it to ALLOWED_AUTHENTICATED in ${__filename.split("/").slice(-2).join("/")} with a comment explaining why.`,
        "Otherwise switch it to SECURITY INVOKER or move it out of the public schema.",
      ],
      docs: "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    },
  ];
}

async function checkPgGraphqlDisabled(client: Client): Promise<CheckResult[]> {
  const { rows } = await client.query(
    `SELECT 1 FROM pg_extension WHERE extname = 'pg_graphql';`,
  );
  const disabled = rows.length === 0;
  const remediation = disabled
    ? undefined
    : [
        "Add a Supabase migration that removes the extension:",
        "  DROP EXTENSION IF EXISTS pg_graphql CASCADE;",
        "Confirm nothing in the app talks to /graphql/v1 before landing the migration.",
      ];
  return [
    {
      id: "SUPA_pg_graphql_anon_table_exposed",
      title: "pg_graphql exposes tables to anonymous users",
      ok: disabled,
      offenders: disabled ? [] : ["extension pg_graphql"],
      detail: disabled ? "pg_graphql extension is not installed" : "pg_graphql extension is installed",
      remediation,
      docs: "https://supabase.com/docs/guides/graphql",
    },
    {
      id: "SUPA_pg_graphql_authenticated_table_exposed",
      title: "pg_graphql exposes tables to signed-in users",
      ok: disabled,
      offenders: disabled ? [] : ["extension pg_graphql"],
      detail: disabled ? "pg_graphql extension is not installed" : "pg_graphql extension is installed",
      remediation,
      docs: "https://supabase.com/docs/guides/graphql",
    },
  ];
}

async function checkLeakedPasswordProtection(): Promise<CheckResult> {
  const id = "SUPA_auth_leaked_password_protection";
  const title = "Leaked-password protection (HaveIBeenPwned) disabled";
  const docs = "https://docs.lovable.dev/features/security#leaked-password-protection";
  const remediation = [
    "Open Supabase Dashboard → Authentication → Providers → Email.",
    "Toggle 'Leaked password protection' ON (HaveIBeenPwned).",
    "Or via Management API: PATCH /v1/projects/{ref}/config/auth with { \"password_hibp_enabled\": true }.",
  ];
  if (!PROJECT_REF || !ACCESS_TOKEN) {
    return {
      id,
      title,
      ok: false,
      detail: "SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN required to verify this check",
      remediation: [
        "Export SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN in the CI environment so this check can run.",
        ...remediation,
      ],
      docs,
    };
  }
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } },
  );
  if (!res.ok) {
    return {
      id,
      title,
      ok: false,
      detail: `Management API error ${res.status}`,
      remediation: [
        "Verify SUPABASE_ACCESS_TOKEN is valid and has access to the project.",
        ...remediation,
      ],
      docs,
    };
  }
  const cfg = (await res.json()) as { password_hibp_enabled?: boolean };
  const enabled = cfg.password_hibp_enabled === true;
  return {
    id,
    title,
    ok: enabled,
    detail: enabled ? "leaked password protection is enabled" : "leaked password protection is disabled",
    remediation: enabled ? undefined : remediation,
    docs,
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

  const passed = results.filter((r) => r.ok);
  const failedResults = results.filter((r) => !r.ok);

  console.log("Security regression check — summary");
  console.log("===================================");
  for (const r of results) {
    const icon = r.ok ? "PASS" : "FAIL";
    console.log(`[${icon}] ${r.id}${r.title ? ` — ${r.title}` : ""}`);
    console.log(`       ${r.detail}`);
  }
  console.log(`\n${passed.length} passed, ${failedResults.length} failed of ${results.length} checks.`);

  if (failedResults.length > 0) {
    console.error("\nRegressions detected");
    console.error("--------------------");
    for (const r of failedResults) {
      console.error(`\n❌ ${r.id}`);
      if (r.title) console.error(`   Finding : ${r.title}`);
      console.error(`   Status  : ${r.detail}`);
      if (r.offenders && r.offenders.length) {
        console.error(`   Offenders:`);
        for (const o of r.offenders) console.error(`     - ${o}`);
      }
      if (r.remediation && r.remediation.length) {
        console.error(`   Remediation:`);
        for (const step of r.remediation) console.error(`     • ${step}`);
      }
      if (r.docs) console.error(`   Docs    : ${r.docs}`);
    }
    console.error(
      `\n${failedResults.length} security regression(s) detected. Failing build.`,
    );
    console.error(
      "After fixing, re-run: bun run scripts/security-regression-check.ts",
    );
    process.exit(1);
  }
  console.log("\nAll monitored security findings remain remediated.");
}


main().catch((err) => {
  console.error(err);
  process.exit(2);
});
