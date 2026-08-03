# WorkMitra Enterprise V2 — Production Deployment Manual

Co-worker / ops reference for Docker-centric production deploys.
Aligns with the **6-Layer Security Architecture** (fail-close env, trusted proxy IP, Zod/sanitize, resilient DB, shared limiters).

**Do not commit secrets.** `.env.production` is gitignored. Use `.env.production.template` only.

---

## 1. Architecture (edge → app)

```
Internet
   │
   ▼
Nginx (web)  :80 / :443
   │  SPA from /usr/share/nginx/html
   │  /v1/*  →  proxy_pass http://app:3001
   │  X-Forwarded-For, X-Real-IP, X-Forwarded-Proto
   ▼
API (app)    :3001 (internal only)
   │  NODE_ENV=production, AUTH_USER_SOURCE=db
   │  WM_TRUST_PROXY=true  →  clientIp.ts trusts sanitized XFF
   ▼
PostgreSQL (+ optional Upstash Redis for multi-node rate limit / invite ephemeral)
```

| Artifact | Purpose |
|----------|---------|
| `Dockerfile` | Multi-stage: `api` (Node, non-root) + `web` (Nginx + SPA) |
| `docker-compose.yml` | `app` + `nginx`, `restart: unless-stopped` |
| `nginx.conf` | SPA + `/v1/` reverse proxy + security headers + TLS placeholders |
| `.env.production.template` | Mandatory production env keys |
| `certs/` | Mount TLS `fullchain.pem` / `privkey.pem` (not committed) |

---

## 2. Prerequisites

- Docker Engine + Docker Compose v2
- PostgreSQL reachable from the `app` container (not `localhost` in production — fail-close refuses it)
- Real TLS certs for public HTTPS (place under `./certs/` then enable the HTTPS block in `nginx.conf`)
- Optional: Upstash Redis REST credentials for multi-node rate limiting / direct-invite ephemeral store

Local verification tools (host):

```bash
node -v          # 22+ recommended
npm -v
npx tsc --noEmit
npm run build
```

---

## 3. Environment setup

```bash
cp .env.production.template .env.production
# Edit .env.production with real secrets — never commit this file
```

### 3.1 Mandatory fail-close keys (Layer 6)

Boot **exits** if these are wrong in `NODE_ENV=production`:

| Variable | Rule |
|----------|------|
| `NODE_ENV` | `production` |
| `AUTH_USER_SOURCE` | Must be `db` |
| `WM_SESSION_HASH_PEPPER` (or `JWT_SECRET`) | Required, **≥ 32 chars**, no placeholders (`change-me`, `password`, etc.) |
| `DATABASE_URL` | Required; must **not** contain `localhost`, `user:password`, or `example.com` |
| `DATABASE_SSL` | Prefer `true` (prod verifies certs by default) |
| `WM_ALLOWED_ORIGINS` and/or `WM_APP_URL` / `VITE_APP_URL` | Required; **https only**; no `*` wildcards |
| `VITE_AUTH_BACKEND_ENABLED` | Must be `true` (build + runtime) |
| `WM_ALLOW_DEMO_AUTH` | Must be `false` / unset (never `true` in prod) |

### 3.2 Proxy / network (Layer 3)

| Variable | Rule |
|----------|------|
| `WM_TRUST_PROXY` | **`true`** when behind Docker Nginx (required for rate limits + audit IP) |
| `PORT` | `3001` (compose sets this; Nginx proxies here) |

Only set `WM_TRUST_PROXY=true` behind a **trusted** reverse proxy that overwrites `X-Forwarded-For`. Untrusted XFF is ignored / rejected by `server/middleware/clientIp.ts`.

### 3.3 Multi-node shared stores (optional)

| Variable | Purpose |
|----------|---------|
| `RATE_LIMIT_STORE` | `upstash` (or leave unset → memory) |
| `DIRECT_INVITE_STORE` | `upstash` (or leave unset → memory) |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |

Single-node: leave Upstash unset (in-memory limiters are fine).

### 3.4 SSL / DB TLS

| Variable | Purpose |
|----------|---------|
| `DATABASE_SSL=true` | Enable TLS to Postgres |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | Default **verify** in production; set `false` only for staging/self-signed |
| `DATABASE_SSL_CA` | Optional PEM path or inline PEM |

Never hardcode `rejectUnauthorized: false` in code for production.

### 3.5 Vite build-time public args

Passed as Docker **build args** (not secrets):

- `VITE_AUTH_BACKEND_ENABLED=true`
- `VITE_APP_URL` — public SPA origin (`https://…`)
- `VITE_API_URL` — usually **empty** when Nginx serves SPA + API same-origin (`/v1/…`)
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — only if Shift Ops / bridge needs them (anon only; never service role in SPA)

---

## 4. Deployment commands

### 4.1 First-time deploy

```bash
# 1) Secrets
cp .env.production.template .env.production
# fill WM_SESSION_HASH_PEPPER, DATABASE_URL, WM_ALLOWED_ORIGINS, etc.

# 2) Optional TLS files
# certs/fullchain.pem
# certs/privkey.pem
# Then uncomment the HTTPS server block in nginx.conf and enable HTTP→HTTPS redirect

# 3) Build images (api + web)
docker compose build

# 4) Start stack
docker compose up -d

# 5) Watch health
docker compose ps
docker compose logs -f app
```

### 4.2 Rebuild after code changes

```bash
docker compose build --no-cache
docker compose up -d
```

Or rebuild a single target:

```bash
docker compose build app
docker compose build nginx
docker compose up -d
```

### 4.3 Stop / restart

```bash
docker compose restart
docker compose down          # stop and remove containers (keeps images)
docker compose down -v       # also remove anonymous volumes (use with care)
```

### 4.4 Host-side build gate (before tagging a release)

```bash
npx tsc --noEmit
npm run build
# Expect: [build-integrity] OK
```

### 4.5 Migrations

On API boot with `AUTH_USER_SOURCE=db`, the server verifies DB connectivity and runs migrations automatically (`server/db/migrate.ts`).

Manual (host, with DB env loaded):

```bash
npm run db:migrate
```

---

## 5. Health checks & smoke tests

| Check | Command / URL |
|-------|----------------|
| API (inside network) | `GET /v1/jobmitra/health` → `{ ok: true, service: "workmitra-api" }` |
| Nginx liveness | `GET /healthz` → `ok` |
| Compose status | `docker compose ps` (both healthy) |
| API logs | `docker compose logs -f app` — look for `Fail-close environment check passed` |

Examples:

```bash
# Via Nginx edge (HTTP bootstrap)
curl -sS http://127.0.0.1/healthz
curl -sS http://127.0.0.1/v1/jobmitra/health

# Direct to API container (debug only — do not publish 3001 publicly)
docker compose exec app node -e "fetch('http://127.0.0.1:3001/v1/jobmitra/health').then(r=>r.json()).then(console.log)"
```

---

## 6. Environment verification checklist

Use before every production promote. Mark each item.

### Secrets & auth

- [ ] `.env.production` exists on the host and is **not** in git
- [ ] `AUTH_USER_SOURCE=db`
- [ ] Pepper ≥ 32 chars (`WM_SESSION_HASH_PEPPER` or `JWT_SECRET`); not a known default
- [ ] `WM_ALLOW_DEMO_AUTH` is not `true`
- [ ] `VITE_AUTH_BACKEND_ENABLED=true`
- [ ] No secrets in SPA (`VITE_*` never holds service role / pepper / `DATABASE_URL`)

### Database

- [ ] `DATABASE_URL` points at real hosted Postgres (no `localhost`)
- [ ] `DATABASE_SSL=true`
- [ ] CA / verify settings reviewed (`DATABASE_SSL_CA` / rejectUnauthorized opt-out only if intentional)
- [ ] Boot log shows DB verified + migrations applied

### Network / CORS / proxy

- [ ] `WM_TRUST_PROXY=true` (Docker Nginx in front)
- [ ] `WM_ALLOWED_ORIGINS` (and/or `VITE_APP_URL`) are exact `https://` origins — no wildcards
- [ ] API port `3001` is **not** published to the public internet (compose `expose` only)
- [ ] Nginx sets `X-Forwarded-For`, `X-Real-IP`, `X-Forwarded-Proto`

### Limiters / scale

- [ ] Single node: memory stores OK
- [ ] Multi-node: Upstash URL + token set; `RATE_LIMIT_STORE` / `DIRECT_INVITE_STORE` as needed

### TLS / edge

- [ ] Real certs in `./certs/` (or managed LB TLS)
- [ ] HTTPS server block enabled in `nginx.conf` when going public
- [ ] HSTS enabled on HTTPS (see commented block)

### Build integrity

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` → `[build-integrity] OK`
- [ ] `docker compose ps` → `app` and `nginx` healthy

---

## 7. Docker guidelines

### Image targets

| Target | Image | Runs as | Port |
|--------|-------|---------|------|
| `api` (default) | `workmitra-api` | non-root user `wm` (uid 10001) | `3001` |
| `web` | `workmitra-web` | Nginx | `80` / `443` |

### Compose rules

- `restart: unless-stopped` on both services
- `app` loads `env_file: .env.production`
- `nginx` waits for `app` **healthy** before starting
- Shared bridge network: `wm_net`
- Debug only: uncomment `ports: ["3001:3001"]` on `app` — remove for real prod

### Build args example

```bash
export VITE_APP_URL=https://app.yourdomain.tld
export VITE_API_URL=
docker compose build
```

### Security notes

- Never bake `.env.production` into the image (`.dockerignore` excludes `.env*`)
- API process drops privileges (`USER wm`)
- HEALTHCHECK hits `/v1/jobmitra/health` (API) and `/healthz` (Nginx)

---

## 8. Nginx guidelines

Config file: `nginx.conf` (copied into the `web` image).

### Required proxy headers (must stay)

```nginx
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

These feed `WM_TRUST_PROXY` + `server/middleware/clientIp.ts` for rate limiting and security events.

### Routing

| Path | Behavior |
|------|----------|
| `/healthz` | Nginx-local `200 ok` (no upstream) |
| `/v1/` | Reverse proxy → `app:3001` |
| `/` | SPA `try_files` → `index.html` |

### TLS enablement

1. Place `certs/fullchain.pem` and `certs/privkey.pem`
2. Uncomment the HTTPS `server { listen 443 … }` block in `nginx.conf`
3. Uncomment HTTP → HTTPS `return 301` in the `:80` server
4. Rebuild / recreate `nginx`:

```bash
docker compose up -d --build nginx
```

### Security headers (edge)

`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and (on HTTPS) `Strict-Transport-Security` are defined in `nginx.conf`. API also applies its own headers via `securityHeaders.ts`.

---

## 9. Rollback & incident basics

```bash
# Previous image tags (if you retagged before deploy)
docker images | findstr workmitra   # Windows
# docker images | grep workmitra    # Linux/macOS

# Quick restart
docker compose restart app

# Full stop
docker compose down
```

If boot fails with `[FATAL]`:

1. Read `docker compose logs app` (message names the missing/weak key — not the secret value)
2. Fix `.env.production`
3. `docker compose up -d app`

Common fatals:

- Pepper missing / &lt; 32 chars / placeholder
- `AUTH_USER_SOURCE` not `db`
- `DATABASE_URL` localhost or placeholder
- CORS origins missing, `http://`, or wildcard
- `VITE_AUTH_BACKEND_ENABLED=false`

---

## 10. Domain & security reminders (permanent)

- **Shift ≠ Career ≠ Admin** — never mix job state stores or UI shells
- Never trust `wm_id` / user ids from request bodies; bind to authenticated session
- Shift invites require verified `invite_token` before consume
- DB writes use `withResilientTransaction` (deadlock `40P01` retry)
- Pulse = action-required; bell = informational — no full-card blink

Coding standards: see `.cursorrules` → **WORKMITRA ENTERPRISE V2 — MANDATORY CODING & SECURITY RULES**.

---

## 11. Quick command card

```bash
cp .env.production.template .env.production   # once
# edit secrets …
docker compose build
docker compose up -d
docker compose ps
curl -sS http://127.0.0.1/healthz
curl -sS http://127.0.0.1/v1/jobmitra/health
docker compose logs -f app
```

Host release gate:

```bash
npx tsc --noEmit && npm run build
```
