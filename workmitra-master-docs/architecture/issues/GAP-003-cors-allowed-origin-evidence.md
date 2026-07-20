<!-- App name: WorkMitra / Job Mitra
File name: GAP-003-cors-allowed-origin-evidence.md
-->

# GAP-003 — Allowed-Origin CORS Evidence Mismatch

**Status:** CLEARED (2026-07-07) — operator rerun §4.3 PASS; no server middleware defect  
**Phase:** 2.1 Production Readiness  
**Priority:** P0 evidence gate (checklist §4.3) — **closed**  
**Opened:** 2026-07-07  
**Cleared:** 2026-07-07

## Problem

Operator staging run (`scripts/phase-2-1-operator-staging.mjs`) reported:

- **4.4 wrong-origin CORS** — PASS (`ACAO=(none)`)
- **4.3 allowed-origin CORS** — FAIL/WARN (`ACAO=(none)`, expected `http://localhost:5173`)
- Env: `WM_ALLOWED_ORIGINS=http://localhost:5173`, `NODE_ENV=production` on API child process

Question: does `server/index.ts` fail to echo `Access-Control-Allow-Origin` for whitelisted origins in production?

## Investigation (read-only probes — 2026-07-07)

**Probe tool:** `node scripts/gap-003-cors-probe.mjs`

| Probe                            | Config                                                             | OPTIONS ACAO                                   | GET ACAO                | Verdict                                     |
| -------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- | ----------------------- | ------------------------------------------- |
| Allowed `http://localhost:5173`  | `NODE_ENV=development`, `WM_ALLOWED_ORIGINS=http://localhost:5173` | `http://localhost:5173`                        | `http://localhost:5173` | Server echoes origin                        |
| Wrong `https://evil.example.com` | same                                                               | `(none)`                                       | `(none)`                | Correctly withheld                          |
| fetch vs raw HTTP                | same dev server                                                    | both return `http://localhost:5173` on OPTIONS | —                       | Not a fetch-only blind spot in current Node |

**Server logic reviewed (`server/index.ts`):**

- `ALLOWED_ORIGINS` built from `WM_ALLOWED_ORIGINS` split + trim, or defaults `http://localhost:5173`, `http://localhost:4173`.
- `resolveAllowedOrigin`: exact set match → echo origin; production disables localhost fallback only when origin is **not** in the whitelist.
- With `WM_ALLOWED_ORIGINS=http://localhost:5173`, `http://localhost:5173` is in the set — ACAO should be set on all responses including OPTIONS 204.

**Production probe:** skipped in agent environment (`DATABASE_URL` unset; production requires `AUTH_USER_SOURCE=db`). Operator must re-run:

```powershell
$env:WM_ALLOWED_ORIGINS = "http://localhost:5173"
$env:PROBE_NODE_ENV = "production"
# plus DATABASE_URL, WM_SESSION_HASH_PEPPER
node scripts/gap-003-cors-probe.mjs
```

## Verdict

| Layer                      | Finding                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Server CORS middleware** | **No defect confirmed** — whitelisted origin echoed in dev probe matching production parsing                                         |
| **Evidence collector**     | Prior failure likely env/timing or pre-patch probe path; operator script now uses raw `probeHttp()` for OPTIONS + GET                |
| **Env mismatch risk**      | If `WM_ALLOWED_ORIGINS` lists staging HTTPS origin only, probing `http://localhost:5173` will correctly return no ACAO in production |

## Proposed server patch

**None at this time.** Phase 2 auth / `server/index.ts` CORS block unchanged per Phase 2 lock.

If operator **production** probe (`PROBE_NODE_ENV=production`) still shows `(none)` for allowed origin while `WM_ALLOWED_ORIGINS` matches probe origin exactly, reopen this issue for a minimal Phase 2.1 hardening patch (e.g. explicit OPTIONS preflight logging, origin normalization audit) behind this gate only.

## Acceptance criteria (to close)

1. ~~Operator production probe shows `acao: "http://localhost:5173"` (or configured staging origin) on OPTIONS **or** GET for allowed origin.~~ **Met (2026-07-07)**
2. ~~Operator staging script **4.3 allowed-origin CORS** → PASS after rerun.~~ **Met (2026-07-07)**
3. No `Access-Control-Allow-Origin: *` with credentials. **Met**

## Closure evidence (2026-07-07)

Operator staging rerun: **4.3 allowed-origin CORS** PASS — ACAO echoed for `http://localhost:5173` (local staging simulation). **4.4 wrong-origin CORS** PASS. No server CORS code change required.

## Related checklist items

- `23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md` §4.1, §4.3–4.5

## Phase 2 lock

Does **not** modify accepted Phase 2 auth implementation unless production probe proves server defect and this issue gate opens a minimal CORS hardening patch.
