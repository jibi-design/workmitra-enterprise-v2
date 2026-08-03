/**
 * Writes Docker production config files to repo root.
 * Run: node scripts/write-docker-prod-files.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();

function write(rel, body) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body, "utf8");
  console.log("wrote", rel);
}

write(
  ".dockerignore",
  [
    "# Build context hygiene — keep image builds fast and secret-free",
    "node_modules",
    "dist",
    "dist-ssr",
    ".vite",
    ".git",
    ".github",
    ".cursor",
    ".vscode",
    ".idea",
    "coverage",
    "playwright-report",
    "test-results",
    "tests",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "agent-transcripts",
    "workmitra-master-docs",
    "*.md",
    "!README.md",
    ".env",
    ".env.*",
    "!.env.production.template",
    "*.log",
    "*.bak",
    "*.bak2",
    ".DS_Store",
    "Thumbs.db",
    "android",
    "ios",
    "capacitor.config.ts",
    "src/index.css.__tmp",
    "",
  ].join("\n"),
);

write(
  "Dockerfile",
  `# WorkMitra Enterprise V2 — production multi-stage image
# Targets:
#   api  — Node API (non-root, healthchecked)  <- default
#   web  — Nginx + SPA assets (proxies /v1 to api)
#
# Aligns with 6-layer defense: fail-close env at boot, WM_TRUST_PROXY behind Nginx.

# -- deps --------------------------------------------------------------------
FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \\
  && apt-get install -y --no-install-recommends ca-certificates \\
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# -- builder (Vite SPA + typecheck gate) -------------------------------------
FROM deps AS builder
WORKDIR /app

COPY . .

# Vite public build-time flags (never bake secrets into the SPA)
ARG VITE_AUTH_BACKEND_ENABLED=true
ARG VITE_APP_URL=https://app.invalid
ARG VITE_API_URL=
ARG VITE_SUPABASE_URL=
ARG VITE_SUPABASE_ANON_KEY=

ENV NODE_ENV=production \\
    VITE_AUTH_BACKEND_ENABLED=\${VITE_AUTH_BACKEND_ENABLED} \\
    VITE_APP_URL=\${VITE_APP_URL} \\
    VITE_API_URL=\${VITE_API_URL} \\
    VITE_SUPABASE_URL=\${VITE_SUPABASE_URL} \\
    VITE_SUPABASE_ANON_KEY=\${VITE_SUPABASE_ANON_KEY}

RUN npm run build

# -- api runtime -------------------------------------------------------------
FROM node:22-bookworm-slim AS api
WORKDIR /app

RUN apt-get update \\
  && apt-get install -y --no-install-recommends ca-certificates \\
  && rm -rf /var/lib/apt/lists/* \\
  && groupadd --system --gid 10001 wm \\
  && useradd --system --uid 10001 --gid wm --home-dir /app --shell /usr/sbin/nologin wm

ENV NODE_ENV=production \\
    PORT=3001 \\
    AUTH_USER_SOURCE=db \\
    WM_TRUST_PROXY=true

COPY package.json package-lock.json ./
# Production deps + tsx (server tsconfig is noEmit; runtime executes TypeScript via tsx)
RUN npm ci --omit=dev \\
  && npm install tsx@4.23.0 --omit=dev --no-save \\
  && npm cache clean --force

COPY --chown=wm:wm server ./server
COPY --chown=wm:wm scripts ./scripts

USER wm
EXPOSE 3001

# Hits /v1/jobmitra/health — same contract as ops probes
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \\
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/v1/jobmitra/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["npx", "tsx", "server/index.ts"]

# -- web (Nginx + SPA) -------------------------------------------------------
FROM nginx:1.27-alpine AS web

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Mount TLS material at runtime:
#   /etc/nginx/certs/fullchain.pem
#   /etc/nginx/certs/privkey.pem
EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
`.replace(/\\\\/g, "\\"),
);

write(
  "docker-compose.yml",
  `# WorkMitra Enterprise V2 — Docker-centric production stack
# Usage:
#   1. cp .env.production.template .env.production  # fill real secrets
#   2. docker compose build
#   3. docker compose up -d
#
# Nginx (edge) -> app:3001 (API). Set WM_TRUST_PROXY=true in .env.production.

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: api
      args:
        VITE_AUTH_BACKEND_ENABLED: "true"
        VITE_APP_URL: \${VITE_APP_URL:-https://app.invalid}
        VITE_API_URL: \${VITE_API_URL:-}
        VITE_SUPABASE_URL: \${VITE_SUPABASE_URL:-}
        VITE_SUPABASE_ANON_KEY: \${VITE_SUPABASE_ANON_KEY:-}
    image: workmitra-api:latest
    container_name: workmitra-app
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      NODE_ENV: production
      PORT: "3001"
      AUTH_USER_SOURCE: db
      WM_TRUST_PROXY: "true"
    # Internal only — Nginx proxies here (do not publish publicly in prod)
    expose:
      - "3001"
    # Optional host debug mapping: uncomment when diagnosing without Nginx
    # ports:
    #   - "3001:3001"
    networks:
      - wm_net
    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "fetch('http://127.0.0.1:3001/v1/jobmitra/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))",
        ]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 45s

  nginx:
    build:
      context: .
      dockerfile: Dockerfile
      target: web
      args:
        VITE_AUTH_BACKEND_ENABLED: "true"
        VITE_APP_URL: \${VITE_APP_URL:-https://app.invalid}
        VITE_API_URL: \${VITE_API_URL:-}
        VITE_SUPABASE_URL: \${VITE_SUPABASE_URL:-}
        VITE_SUPABASE_ANON_KEY: \${VITE_SUPABASE_ANON_KEY:-}
    image: workmitra-web:latest
    container_name: workmitra-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      # Host TLS material (placeholders — replace with real certs)
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      app:
        condition: service_healthy
    networks:
      - wm_net

networks:
  wm_net:
    driver: bridge
`.replace(/\\\$\{/g, "${"),
);

write(
  "nginx.conf",
  `# WorkMitra Enterprise V2 — Nginx edge (SPA + API reverse proxy)
# Proxies /v1/* to the Docker app service on port 3001.
# Sets X-Forwarded-* so server/middleware/clientIp.ts works with WM_TRUST_PROXY=true.

worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
  multi_accept on;
}

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;

  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';

  access_log /var/log/nginx/access.log main;

  sendfile on;
  tcp_nopush on;
  keepalive_timeout 65;
  server_tokens off;

  # Upload / JSON body budget (align with API expectations)
  client_max_body_size 8m;

  # Gzip for SPA assets
  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
  gzip_min_length 1024;

  # Docker DNS — resolves compose service "app"
  resolver 127.0.0.11 valid=10s ipv6=off;

  upstream workmitra_api {
    server app:3001;
    keepalive 32;
  }

  # Shared proxy headers for Layer 3 clientIp / rate-limit trust
  map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
  }

  # ---------- HTTP (:80) — redirect to HTTPS when TLS is enabled ----------
  server {
    listen 80;
    listen [::]:80;
    server_name _;

    # Liveness for container HEALTHCHECK (no upstream hop)
    location = /healthz {
      access_log off;
      add_header Content-Type text/plain;
      return 200 'ok';
    }

    # Uncomment after TLS certs are mounted to force HTTPS:
    # return 301 https://$host$request_uri;

    # Temporary HTTP mode (dev/staging bootstrap) — remove when TLS is live
    include /etc/nginx/mime.types;

    root /usr/share/nginx/html;
    index index.html;

    location /v1/ {
      proxy_http_version 1.1;
      proxy_set_header Host              $host;
      proxy_set_header X-Real-IP         $remote_addr;
      proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Forwarded-Host  $host;
      proxy_set_header Connection        "";
      proxy_connect_timeout 5s;
      proxy_send_timeout 60s;
      proxy_read_timeout 60s;
      proxy_pass http://workmitra_api;
    }

    location / {
      try_files $uri $uri/ /index.html;
    }

    # Security headers (edge)
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
  }

  # ---------- HTTPS (:443) — PLACEHOLDER: mount certs then enable ----------
  # Place files at ./certs/fullchain.pem and ./certs/privkey.pem then uncomment.
  #
  # server {
  #   listen 443 ssl http2;
  #   listen [::]:443 ssl http2;
  #   server_name app.yourdomain.tld;
  #
  #   ssl_certificate     /etc/nginx/certs/fullchain.pem;
  #   ssl_certificate_key /etc/nginx/certs/privkey.pem;
  #   ssl_session_timeout 1d;
  #   ssl_session_cache shared:SSL:10m;
  #   ssl_protocols TLSv1.2 TLSv1.3;
  #   ssl_prefer_server_ciphers off;
  #
  #   add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
  #   add_header X-Content-Type-Options nosniff always;
  #   add_header X-Frame-Options DENY always;
  #   add_header Referrer-Policy strict-origin-when-cross-origin always;
  #   add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
  #
  #   root /usr/share/nginx/html;
  #   index index.html;
  #
  #   location = /healthz {
  #     access_log off;
  #     add_header Content-Type text/plain;
  #     return 200 'ok';
  #   }
  #
  #   location /v1/ {
  #     proxy_http_version 1.1;
  #     proxy_set_header Host              $host;
  #     proxy_set_header X-Real-IP         $remote_addr;
  #     proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
  #     proxy_set_header X-Forwarded-Proto $scheme;
  #     proxy_set_header X-Forwarded-Host  $host;
  #     proxy_set_header Connection        "";
  #     proxy_pass http://workmitra_api;
  #   }
  #
  #   location / {
  #     try_files $uri $uri/ /index.html;
  #   }
  # }
}
`,
);

write(
  ".env.production.template",
  `# WorkMitra Enterprise V2 — PRODUCTION ENV TEMPLATE
# Copy to .env.production and fill real values:
#   cp .env.production.template .env.production
# NEVER commit .env.production (gitignored).
# Fail-close boot (Layer 6) refuses weak/missing secrets.

# ── Runtime ──────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=3001
AUTH_USER_SOURCE=db

# Behind Docker Nginx — required for sanitized X-Forwarded-For (clientIp.ts)
WM_TRUST_PROXY=true

# ── Session / JWT pepper (REQUIRED, >= 32 chars, no placeholders) ────────────
# Canonical: WM_SESSION_HASH_PEPPER  |  Alias: JWT_SECRET
WM_SESSION_HASH_PEPPER=REPLACE_WITH_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS
# JWT_SECRET=

# ── Database (REQUIRED) ──────────────────────────────────────────────────────
# Must NOT be localhost / placeholder in production (fail-close).
DATABASE_URL=postgresql://USER:PASSWORD@YOUR_DB_HOST:6543/postgres
DATABASE_SSL=true
# Production default verifies TLS. Opt-out only for staging/self-signed:
# DATABASE_SSL_REJECT_UNAUTHORIZED=false
# Optional custom CA (PEM path or inline PEM):
# DATABASE_SSL_CA=
DATABASE_POOL_MAX=10
DATABASE_STATEMENT_TIMEOUT_MS=15000
DATABASE_LOCK_TIMEOUT_MS=5000
DATABASE_CONNECT_TIMEOUT_MS=10000
DATABASE_IDLE_TIMEOUT_MS=30000

# ── CORS whitelist (REQUIRED — https only, no wildcards) ─────────────────────
WM_ALLOWED_ORIGINS=https://app.yourdomain.tld
WM_APP_URL=https://app.yourdomain.tld
VITE_APP_URL=https://app.yourdomain.tld
# Same-origin via Nginx: leave empty so browser uses relative /v1 paths
VITE_API_URL=

# ── Client auth flag (REQUIRED for production Vite build + boot) ─────────────
VITE_AUTH_BACKEND_ENABLED=true
WM_ALLOW_DEMO_AUTH=false
WM_ENFORCE_AUTH=true

# ── Shared limiter / direct-invite ephemeral (multi-node) ────────────────────
# Leave unset for single-node memory store.
RATE_LIMIT_STORE=upstash
DIRECT_INVITE_STORE=upstash
UPSTASH_REDIS_REST_URL=https://YOUR_INSTANCE.upstash.io
UPSTASH_REDIS_REST_TOKEN=REPLACE_WITH_UPSTASH_REST_TOKEN

# ── Optional integrations (unset or real — never placeholders if set) ────────
# SENTRY_DSN=
# AGORA_APP_ID=
# AGORA_APP_CERTIFICATE=
# FCM_SERVER_KEY=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PROXY_NUMBER=
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
`,
);

write(
  "certs/.gitkeep",
  `# Mount TLS certs here for Nginx HTTPS:
#   fullchain.pem
#   privkey.pem
`,
);

console.log("Docker production config files written.");
