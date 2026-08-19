# Mitra Access Hub Worker — API proxy

## Purpose

Route `https://mitraaccesshub.com/v1/*` (and `/auth/*`) to the real WorkMitra API (`API_UPSTREAM`)
while keeping Coming Soon HTML for all other paths.

Also serves Android App Links at:

`https://mitraaccesshub.com/.well-known/assetlinks.json`

(`application/json`, package `com.mitralabs.jobmitra`, upload-key SHA-256).

Cookies / `Set-Cookie` / `X-CSRF-Token` are passed through. `Domain=` is stripped so session
cookies bind to the edge host.

## Upstream requirement (load certification)

`API_UPSTREAM` must be a **durable** HTTPS origin (named Cloudflare Tunnel, Render, or other
production API host).

Do **not** point production certification traffic at ephemeral `*.trycloudflare.com` quick
tunnels — empirical lock (2026-08-10) showed free quick-tunnel **edge throttle above ~200 VU**
(HTTP 429 without application `X-RateLimit-*` headers) while the API itself returned **0 5xx**
through a full 1k ramp. See:

- `tests/load/authenticated-store-stress-FINAL-AUDIT-report.json`
- `workmitra-master-docs/HOSTING_BACKEND_DATABASE_/17_AUTHENTICATED_LOAD_BENCHMARK_LOCK_2026-08-10.md`

## Deploy

```bash
cd cloudflare/mitra-access-hub-worker
npx wrangler login   # or CLOUDFLARE_API_TOKEN
# Upstream must be a public HTTPS origin reaching workmitra-api (named tunnel or VPS)
npx wrangler secret put API_UPSTREAM
# paste: https://<durable-api-upstream>
npx wrangler deploy
```

## Verify

```bash
curl -sS -D- https://mitraaccesshub.com/v1/jobmitra/health
# Expect: HTTP 200, content-type application/json
```
