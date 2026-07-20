// CORS origin resolver — isolated unit test (mirrors server/index.ts logic exactly)
const ALLOWED_DEV = new Set(["http://localhost:5173", "http://localhost:4173"]);

function resolveOriginDev(o) {
  if (!o) return null;
  if (ALLOWED_DEV.has(o)) return o;
  try { const u = new URL(o); if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return o; } catch { return null; }
  return null;
}
function resolveOriginProd(o) {
  if (!o) return null;
  if (ALLOWED_DEV.has(o)) return o;
  return null;
}

// comma+spaces parsing proof
const raw = "https://workmitra.app , https://app.workmitra.com";
const parsed = raw.split(",").map(o => o.trim());
console.log("COMMA_PARSE:", JSON.stringify(parsed));

// dev
console.log("DEV known 5173:", resolveOriginDev("http://localhost:5173"));
console.log("DEV other port 4000:", resolveOriginDev("http://localhost:4000"));
console.log("DEV 127.0.0.1:", resolveOriginDev("http://127.0.0.1:5173"));
console.log("DEV evil.com:", resolveOriginDev("https://evil.com"));
console.log("DEV malformed:", resolveOriginDev("not-a-url"));
console.log("DEV no origin:", resolveOriginDev(undefined));

// prod
console.log("PROD known 5173 (whitelisted):", resolveOriginProd("http://localhost:5173"));
console.log("PROD evil.com:", resolveOriginProd("https://evil.com"));
console.log("PROD no origin:", resolveOriginProd(undefined));
