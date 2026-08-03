# WorkMitra Enterprise V2 — production multi-stage image
# Targets:
#   api  — Node API (non-root, healthchecked)  <- default
#   web  — Nginx + SPA assets (proxies /v1 to api)
#
# Aligns with 6-layer defense: fail-close env at boot, WM_TRUST_PROXY behind Nginx.

# -- deps --------------------------------------------------------------------
FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
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

ENV NODE_ENV=production \
    VITE_AUTH_BACKEND_ENABLED=${VITE_AUTH_BACKEND_ENABLED} \
    VITE_APP_URL=${VITE_APP_URL} \
    VITE_API_URL=${VITE_API_URL} \
    VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

RUN npm run build

# -- api runtime -------------------------------------------------------------
FROM node:22-bookworm-slim AS api
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 10001 wm \
  && useradd --system --uid 10001 --gid wm --home-dir /app --shell /usr/sbin/nologin wm

ENV NODE_ENV=production \
    PORT=3001 \
    AUTH_USER_SOURCE=db \
    WM_TRUST_PROXY=true

COPY package.json package-lock.json ./
# Production deps + tsx (server tsconfig is noEmit; runtime executes TypeScript via tsx)
RUN npm ci --omit=dev \
  && npm install tsx@4.23.0 --omit=dev --no-save \
  && npm cache clean --force

COPY --chown=wm:wm server ./server
COPY --chown=wm:wm scripts ./scripts

USER wm
EXPOSE 3001

# Hits /v1/jobmitra/health — same contract as ops probes
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
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

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
