# WorkMitra Load / Chaos

## Profiles

| Env | Meaning |
|-----|---------|
| `K6_VUS_MAX=50` | CI smoke |
| `K6_VUS_MAX=500` | Concurrent fan-out target (default for Node fallback) |
| `K6_VUS_MAX=1000` | staging soak |
| `K6_VUS_MAX=50000` | Full MNC ramp (dedicated load cluster + k6 required) |
| `K6_CHAOS=1` | Inject 5xx / latency / disconnect via `X-WM-Chaos` |
| `WM_API_BASE` | API origin (default `http://localhost:3001`) |
| `WM_FORCE_NODE_LOAD=1` | Skip k6; always use Node harness |
| `WM_ALLOW_API_DOWN=1` | Node harness exits 0 when API is unreachable (reports BLOCKED) |

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

Full 50k VU certification (requires k6 + load cluster):

```bash
K6_VUS_MAX=50000 K6_CHAOS=1 k6 run tests/load/k6-shift-chaos.js
```

Failover proof for `wm_retry_queue_v1`:

```bash
npm run test:failover
```
