<!-- App name: WorkMitra / Job Mitra
File name: GAP-004-audit-evidence-query-subprocess.md
-->

# GAP-004 — Audit / Login Evidence Query Subprocess Failure

**Status:** CLEARED (2026-07-07) — operator rerun §5.3 PASS; evidence script fix verified  
**Phase:** 2.1 Production Readiness  
**Priority:** P0 evidence gate (checklist §5.3, §7.1) — **closed**  
**Opened:** 2026-07-07  
**Cleared:** 2026-07-07

## Problem

Operator staging run reported **5.3 audit/login rows** — FAIL (`audit query failed (details redacted)`), while **5.1 rate limit 429** — PASS (implying DB write path for login attempts / audit likely worked).

## Investigation (SELECT-only — 2026-07-07)

### Schema verification (`001_auth_persistence.sql`)

| Table                 | Columns used by evidence   | Match |
| --------------------- | -------------------------- | ----- |
| `auth_audit_events`   | `event_type`, `created_at` | Yes   |
| `auth_login_attempts` | `success`, `attempted_at`  | Yes   |

### Service event types (`auth.service.db.ts`)

- `login_rate_limited`, `login_failed` — match evidence filter.

### Subprocess failure root cause (Windows)

Original operator script used `spawnSync(npx tsx -e "...")` with top-level `await` and parameterized SQL `ANY($1::text[])`.

Reproduced failures:

1. **tsx -e + top-level await** — `Transform failed: Top-level await is currently not supported with the "cjs" output format`
2. **PowerShell + shell** — `$1` in SQL string mangled to empty → `ANY(::text[])` syntax error

**Conclusion:** Evidence collector subprocess defect — **not** schema mismatch and **not** proven DB write defect.

### SELECT verification tool

**Script:** `scripts/gap-004-audit-query.mjs`

Read-only queries:

```sql
SELECT event_type, created_at
FROM auth_audit_events
WHERE event_type = ANY($1::text[])
ORDER BY created_at DESC LIMIT 5;

SELECT COUNT(*)::int AS failed_count
FROM auth_login_attempts
WHERE success = false
  AND attempted_at > now() - interval '20 minutes';
```

Output: counts and latest event type only — no secrets, tokens, or connection strings.

Agent run: skipped (`DATABASE_URL` unset in validation shell). Operator runs after rate-limit smoke:

```powershell
# after operator-staging rate-limit loop
npx tsx scripts/gap-004-audit-query.mjs
```

## Fix applied (evidence only)

`scripts/phase-2-1-operator-staging.mjs` §5.3 now calls:

```
npx tsx scripts/gap-004-audit-query.mjs
```

instead of inline `tsx -e` subprocess.

**No changes** to auth service, migrations, or write paths.

## Acceptance criteria (to close)

1. ~~Operator rerun: **5.3 audit/login rows** → PASS with `auditRowCount > 0` or `failedAttemptCount > 0` after rate-limit loop.~~ **Met (2026-07-07)** — `auditRowCount=5`, `failedAttemptCount=5`, `latestEventType=login_rate_limited`
2. ~~Standalone `gap-004-audit-query.mjs` returns `{ ok: true, ... }` on staging DB.~~ **Met** (via operator script §5.3)
3. DB write path defect — **not observed**; 429 + audit rows confirm write path.

## Closure evidence (2026-07-07)

Operator staging rerun after rate-limit loop: audit and login_attempt SELECT verification passed. Root cause was evidence subprocess (`tsx -e` on Windows), not schema or auth write path.

## Related issues

- GAP-002 — retention sweep (operational; separate from evidence query)

## Phase 2 lock

Evidence / operator tooling only. Does not modify accepted Phase 2 auth persistence contract.
