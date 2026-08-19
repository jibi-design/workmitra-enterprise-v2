/**
 * Mitra Access Hub edge Worker — proxy Job Mitra API under /v1/* (and /auth/* alias).
 * Static/Coming Soon for all other paths.
 *
 * Env bindings (wrangler):
 *   API_UPSTREAM — origin of workmitra-api (no trailing slash), e.g. https://xxx.trycloudflare.com
 */
import { guestEdgeRateLimit } from "./guestEdgeRateLimit";

export interface Env {
  API_UPSTREAM: string;
}

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "cf-connecting-ip",
  "cf-ipcountry",
  "cf-ray",
  "cf-visitor",
  "cdn-loop",
]);

function isApiPath(pathname: string): boolean {
  return (
    pathname === "/v1" ||
    pathname.startsWith("/v1/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  );
}

function buildUpstreamHeaders(request: Request, upstreamHost: string, publicHost: string): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    if (lower === "cookie" || lower.startsWith("x-csrf") || lower === "authorization") {
      headers.set(key, value);
      return;
    }
    headers.set(key, value);
  });
  headers.set("Host", upstreamHost);
  headers.set("X-Forwarded-Host", publicHost);
  headers.set("X-Forwarded-Proto", "https");
  headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP") || "");
  // Ensure JSON clients are not rewritten by accidental Accept mismatches upstream.
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  return headers;
}

/**
 * Preserve multi Set-Cookie (Workers may collapse). Strip Domain= so cookies bind to edge host.
 */
function passthroughResponseHeaders(upstream: Response): Headers {
  const out = new Headers();
  const cookies: string[] = [];

  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie") {
      cookies.push(value);
      return;
    }
    if (HOP_BY_HOP.has(lower)) return;
    if (lower === "content-encoding" || lower === "content-length") return;
    out.set(key, value);
  });

  // getSetCookie available on newer runtimes
  const multi =
    typeof upstream.headers.getSetCookie === "function" ? upstream.headers.getSetCookie() : cookies;

  for (const raw of multi) {
    const rewritten = raw
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part && !/^domain=/i.test(part))
      .join("; ");
    out.append("Set-Cookie", rewritten);
  }

  // Propagate CSRF header if present
  const csrf = upstream.headers.get("X-CSRF-Token") || upstream.headers.get("x-csrf-token");
  if (csrf) out.set("X-CSRF-Token", csrf);

  return out;
}

async function proxyApi(request: Request, env: Env, url: URL): Promise<Response> {
  const upstreamBase = (env.API_UPSTREAM || "").replace(/\/$/, "");
  if (!upstreamBase) {
    return Response.json(
      { error: { code: "API_UPSTREAM_UNSET", message: "API_UPSTREAM binding missing" } },
      { status: 503 },
    );
  }

  let upstreamOrigin: URL;
  try {
    upstreamOrigin = new URL(upstreamBase);
  } catch {
    return Response.json(
      { error: { code: "API_UPSTREAM_INVALID", message: "API_UPSTREAM is not a valid URL" } },
      { status: 503 },
    );
  }

  const target = new URL(url.pathname + url.search, upstreamOrigin);
  const init: RequestInit = {
    method: request.method,
    headers: buildUpstreamHeaders(request, upstreamOrigin.host, url.host),
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    // @ts-expect-error duplex required for streamed body in CF
    init.duplex = "half";
  }

  const upstream = await fetch(target, init);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: passthroughResponseHeaders(upstream),
  });
}

/** Android App Links — package + upload-key SHA-256 (see docs/play-store/assetlinks.json). */
const JOB_MITRA_ASSETLINKS = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.mitralabs.jobmitra",
      sha256_cert_fingerprints: [
        "B2:4D:FD:F4:94:1D:0B:21:8F:62:F3:FB:0D:58:74:C5:C9:78:E9:84:57:8A:84:B3:77:DD:58:65:C8:41:01:57",
      ],
    },
  },
] as const;

function assetLinksResponse(): Response {
  return new Response(JSON.stringify(JOB_MITRA_ASSETLINKS), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
      "access-control-allow-origin": "*",
    },
  });
}

function comingSoon(): Response {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Mitra Access Hub</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc}
main{text-align:center;padding:24px}h1{font-size:1.75rem;margin:0 0 8px}p{opacity:.75;margin:0}</style></head>
<body><main><h1>Mitra Access Hub</h1><p>Coming Soon</p></main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (
      url.pathname === "/.well-known/assetlinks.json" ||
      url.pathname === "/.well-known/assetlinks.json/"
    ) {
      return assetLinksResponse();
    }
    if (isApiPath(url.pathname)) {
      const limited = guestEdgeRateLimit(request, url);
      if (limited) return limited;
      try {
        return await proxyApi(request, env, url);
      } catch (err) {
        const message = err instanceof Error ? err.message : "proxy_failed";
        return Response.json({ error: { code: "API_PROXY_ERROR", message } }, { status: 502 });
      }
    }
    return comingSoon();
  },
};
