/** Debug login Set-Cookie capture against live API (no password print). */
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
function loadEnvFile(name) {
  const full = resolve(root, name);
  if (!existsSync(full)) return;
  for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
for (const f of [".env", ".env.local", ".env.production", "server/.env"]) loadEnvFile(f);

const BASE = process.env.WM_API_BASE || "https://mitraaccesshub.com";
const EMAIL = process.env.WM_LOAD_TEST_EMAIL || "loadtest.store@workmitra.com";
const PASSWORD = process.env.WM_LOAD_TEST_PASSWORD || "";

if (!PASSWORD) {
  console.error("WM_LOAD_TEST_PASSWORD required for debug (set by provision script)");
  process.exit(2);
}

const jar = {};
function apply(res) {
  const raw =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie")]
        : [];
  console.log("set-cookie count=", raw.length);
  for (const line of raw) {
    const name = String(line).split("=")[0];
    const attrs = String(line)
      .split(";")
      .slice(1)
      .map((s) => s.trim().split("=")[0].toLowerCase());
    console.log(" cookie=", name, "attrs=", attrs.join(","));
    const pair = String(line).split(";")[0];
    const eq = pair.indexOf("=");
    if (eq > 0) jar[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
  }
  // dump header keys of interest
  const keys = [];
  res.headers.forEach((_, k) => keys.push(k));
  console.log(
    "header keys containing cookie/csrf/session:",
    keys.filter((k) => /cookie|csrf|session|set-/i.test(k)).join(", ") || "(none)",
  );
}

const csrf = await fetch(`${BASE}/v1/jobmitra/auth/csrf`);
console.log("csrf status", csrf.status);
apply(csrf);

const login = await fetch(`${BASE}/v1/jobmitra/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Cookie: Object.entries(jar)
      .map(([k, v]) => `${k}=${v}`)
      .join("; "),
  },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
console.log("login status", login.status);
const body = await login.json().catch(() => ({}));
console.log("login body keys", Object.keys(body?.data || body || {}));
console.log("has csrfToken in body", Boolean(body?.data?.csrfToken || body?.csrfToken));
apply(login);
console.log("jar keys", Object.keys(jar).join(",") || "(empty)");
