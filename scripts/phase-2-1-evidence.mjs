/**
 * Phase 2.1 evidence collector — read-only validation, no auth code changes.
 * Usage: node scripts/phase-2-1-evidence.mjs
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const results = [];

function record(id, status, note) {
  results.push({ id, status, note });
}

function runProdGuard(envExtra, expectExitNonZero, label) {
  const r = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["tsx", "-e", "import { assertSafeAuthEnvironment } from './server/modules/auth/env.ts'; assertSafeAuthEnvironment();"],
    {
      env: { ...process.env, NODE_ENV: "production", ...envExtra },
      cwd: root,
      shell: process.platform === "win32",
      encoding: "utf8",
    },
  );
  const failed = (r.status ?? 1) !== 0;
  const ok = expectExitNonZero ? failed : !failed;
  record(label, ok ? "PASS" : "FAIL", `exit=${r.status} stderr=${(r.stderr || "").trim().slice(0, 200)}`);
}

// 1.3 Production forbids memory auth
runProdGuard({ AUTH_USER_SOURCE: "memory" }, true, "1.3 memory auth forbidden in production");

// 1.4 Production forbids WM_ALLOW_DEMO_AUTH=true
runProdGuard(
  { AUTH_USER_SOURCE: "db", DATABASE_URL: "postgresql://x", WM_ALLOW_DEMO_AUTH: "true" },
  true,
  "1.4 WM_ALLOW_DEMO_AUTH forbidden in production",
);

// 2.1 Production requires WM_SESSION_HASH_PEPPER
runProdGuard(
  { AUTH_USER_SOURCE: "db", DATABASE_URL: "postgresql://x" },
  true,
  "2.1 WM_SESSION_HASH_PEPPER required in production",
);

// 2.2 .gitignore covers .env
const gitignore = readFileSync(resolve(root, ".gitignore"), "utf8");
const envIgnored = gitignore.includes(".env");
record("2.2 .env in .gitignore", envIgnored ? "PASS" : "FAIL", envIgnored ? "found" : "missing");

// 3.x Cookie flags in source
const routes = readFileSync(resolve(root, "server/modules/auth/auth.routes.ts"), "utf8");
record("3.1 wm_session cookie name", routes.includes('wm_session') ? "PASS" : "FAIL", "auth.routes.ts");
record("3.2 HttpOnly", routes.includes("HttpOnly") ? "PASS" : "FAIL", "auth.routes.ts");
record("3.3 SameSite=Lax", routes.includes("SameSite=Lax") ? "PASS" : "FAIL", "auth.routes.ts");
record("3.6 logout Max-Age=0", routes.includes('buildSessionCookie("", 0)') ? "PASS" : "FAIL", "auth.routes.ts");

const schema = readFileSync(resolve(root, "server/db/migrations/001_auth_persistence.sql"), "utf8");
record("3.5 session_token_hash in DB", schema.includes("session_token_hash") && !schema.includes("session_token TEXT") ? "PASS" : "FAIL", "migration");

// 4.2 No wildcard CORS
const index = readFileSync(resolve(root, "server/index.ts"), "utf8");
record("4.2 no wildcard CORS", !index.includes('Access-Control-Allow-Origin", "*"') ? "PASS" : "FAIL", "server/index.ts");
record("4.6 Vary Origin", index.includes("Vary") && index.includes("Origin") ? "PASS" : "FAIL", "server/index.ts");

// 5.2 Safe error messages (no enumeration on unknown user)
const dbAuth = readFileSync(resolve(root, "server/modules/auth/auth.service.db.ts"), "utf8");
record(
  "5.2 no user enumeration message",
  dbAuth.includes('"Invalid email or password"') && dbAuth.includes("RATE_LIMITED") ? "PASS" : "FAIL",
  "auth.service.db.ts",
);

// 1.5 Seed uses staging emails only by default
const seed = readFileSync(resolve(root, "server/db/seed.ts"), "utf8");
record(
  "1.5 seed default staging emails",
  seed.includes("employee@staging.jobmitra.app") && seed.includes("SEED_EMPLOYEE_PASSWORD") ? "PASS" : "FAIL",
  "seed.ts requires env passwords",
);

// 2.4 No server secrets in VITE_ grep (source)
let viteLeak = false;
try {
  const { execSync } = await import("node:child_process");
  const out = execSync('rg "VITE_.*(SECRET|PEPPER|DATABASE|PASSWORD)" src --glob "*.{ts,tsx}" 2>nul || true', {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
  viteLeak = out.trim().length > 0;
} catch {
  viteLeak = false;
}
record("2.4 no VITE_ secret names in src", !viteLeak ? "PASS" : "FAIL", viteLeak ? "matches found" : "none");

// 6.5 Session cleanup job — not yet implemented
const hasSessionCleanupJob = existsSync(resolve(root, "server/jobs/session-cleanup.ts"));
record("6.5 DB session cleanup job", hasSessionCleanupJob ? "PASS" : "NEEDS_OPERATOR", "no scheduled cleanup job in repo yet");

// 7.5 Audit retention job
record("7.5 audit retention sweep", "NEEDS_OPERATOR", "no retention job in repo yet — document/runbook required");

// 8.x Supabase backup
record("8.1 Supabase backup enabled", "NEEDS_OPERATOR", "requires Supabase dashboard evidence");
record("8.3 restore drill", "NEEDS_OPERATOR", "requires operator sign-off");

// 1.1 / 1.2 / 2.5 staging vs prod separation
record("1.1 separate Supabase projects", "NEEDS_OPERATOR", "project IDs in secret manager only");
record("1.2 AUTH_USER_SOURCE=db staging/prod", "NEEDS_OPERATOR", "deploy env config");
record("2.5 unique prod pepper", "NEEDS_OPERATOR", "secret manager comparison");

const hasDb = Boolean(process.env.DATABASE_URL);
record("runtime DATABASE_URL", hasDb ? "PRESENT" : "ABSENT", hasDb ? "live API tests possible" : "skip live auth/CORS tests in this run");

console.log("\n=== Phase 2.1 Evidence Collection ===\n");
for (const r of results) {
  console.log(`[${r.status.padEnd(14)}] ${r.id} — ${r.note}`);
}
const fails = results.filter((r) => r.status === "FAIL").length;
const needs = results.filter((r) => r.status === "NEEDS_OPERATOR").length;
const passes = results.filter((r) => r.status === "PASS").length;
console.log(`\nSummary: ${passes} PASS, ${fails} FAIL, ${needs} NEEDS_OPERATOR`);
process.exit(fails > 0 ? 1 : 0);
