/** Probe whether live /v1 routes are real API JSON or SPA HTML fallback. */
const bases = [
  "https://mitraaccesshub.com",
  "https://mitra-access-hub.jibin-dev-apps.workers.dev",
];
const paths = [
  "/v1/jobmitra/health",
  "/v1/jobmitra/auth/csrf",
  "/v1/jobmitra/auth/login",
];

for (const base of bases) {
  for (const p of paths) {
    const url = `${base}${p}`;
    const method = p.endsWith("/login") ? "POST" : "GET";
    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: method === "POST" ? JSON.stringify({ email: "x@y.z", password: "invalid-password-xx" }) : undefined,
    });
    const text = await res.text();
    const ct = res.headers.get("content-type") || "";
    const kind = text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")
      ? "HTML"
      : text.trimStart().startsWith("{")
        ? "JSON"
        : "OTHER";
    console.log(
      `${res.status} ${kind} ct=${ct.slice(0, 40)} len=${text.length} ${method} ${url}`,
    );
  }
}
