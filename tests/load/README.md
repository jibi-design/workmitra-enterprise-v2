# WorkMitra Load / Chaos

## Profiles

| Env | Meaning |
|-----|---------|
| `K6_VUS_MAX=50` | CI smoke |
| `K6_VUS_MAX=500` | Concurrent fan-out target (default for Node fallback) |
| `K6_VUS_MAX=1000` | staging soak / **Play Store live stress** |
| `K6_VUS_MAX=50000` | Full MNC ramp (dedicated load cluster + k6 required) |
| `K6_CHAOS=1` | Inject 5xx / latency / disconnect via `X-WM-Chaos` (**forbidden** on store-submission live run) |
| `WM_API_BASE` | API origin (default `http://localhost:3001`) |
| `WM_LOAD_TEST_EMAIL` / `WM_LOAD_TEST_PASSWORD` | Optional auth credentials for store-stress |
| `WM_FORCE_NODE_LOAD=1` | Skip k6; always use Node harness |
| `WM_ALLOW_API_DOWN=1` | Node harness exits 0 when API is unreachable (reports BLOCKED) |
| `WM_LOAD_TEST_RELAX_RATE_LIMIT=1` | API process only — raises Layer-3 ceilings for harness (unset before production promote) |

## Locked finding (2026-08-10) — pause 1k VU on quick tunnels

Canonical lock: `authenticated-store-stress-FINAL-AUDIT-report.json` + hosting doc 17.

| Finding | Detail |
|---------|--------|
| App / DB | Ready — **0 HTTP 5xx**, **0 timeouts**; auth+RLS healthy ≤**200 VU** with rate-limit relax |
| Blocker | Free Cloudflare **quick tunnel** edge throttle **>200 VU** (429 without `X-RateLimit-*`) |
| Rule | **PAUSE** further authenticated 1k stress until **Named Tunnel / durable API gateway** |
| Do not use | `https://*.trycloudflare.com` for 500–1000 VU production certification |

Resume (durable gateway only):

```powershell
$env:WM_API_BASE="https://<durable-api-or-edge>"
$env:K6_VUS_MAX="1000"
$env:K6_CHAOS="0"
npm run test:load:store-stress:auth
```

## Run

```bash
npm run dev:api
npm run test:load:k6
```

`test:load:k6` prefers the k6 binary. If k6 is missing, it **automatically falls back** to the Node 500-client fan-out harness (`tests/load/node-shift-chaos-fanout.mjs`) with strict partial-failure isolation (no false PASS).

Force Node only:

```bash
npm run test:load:node
# or
set WM_FORCE_NODE_LOAD=1
npm run test:load:k6
```

### Play Store live stress (Cloudflare + Supabase) — 1 → 1000 VUs

Chaos **must** stay off. Point `WM_API_BASE` at a **durable** API origin (not a trycloudflare quick tunnel).

```bash
# PowerShell
$env:WM_API_BASE="https://api.example.durable"   # named tunnel / production edge
$env:K6_VUS_MAX="1000"
$env:K6_CHAOS="0"
npm run test:load:store-stress
# Authenticated path (provisions ephemeral load-test user):
npm run test:load:store-stress:auth
```

Summaries:
- k6 → `tests/load/k6-store-submission-stress-summary.json`
- Node → `tests/load/node-store-submission-stress-summary.json`
- Locked audit → `tests/load/authenticated-store-stress-FINAL-AUDIT-report.json`

Full 50k VU certification (requires k6 + load cluster):

```bash
K6_VUS_MAX=50000 K6_CHAOS=1 k6 run tests/load/k6-shift-chaos.js
```

Failover proof for `wm_retry_queue_v1`:

```bash
npm run test:failover
```
