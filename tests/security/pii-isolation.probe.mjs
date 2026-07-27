/**
 * Security probe — Candidate PII must not leak in public payloads.
 * Run: node tests/security/pii-isolation.probe.mjs
 */

const BASE = process.env.WM_API_BASE || "http://localhost:3001";

function assertNoLeak(label, body) {
  const raw = JSON.stringify(body);
  const leaks = [];
  if (/9876543210|phoneNumber|"phone"\s*:/.test(raw)) leaks.push("phone");
  if (/privateRating|"latitude"|"longitude"/.test(raw)) leaks.push("private_or_coords");
  if (leaks.length) {
    throw new Error(`${label} leaked: ${leaks.join(",")}`);
  }
}

async function main() {
  const put = await fetch(`${BASE}/v1/jobmitra/employee/shift/availability`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": "probe" },
    body: JSON.stringify({
      workerMlId: "WMID_PII",
      selectedDates: ["2026-07-21"],
      city: "Kochi",
      phone: "+91 98765 43210",
    }),
  });

  // CSRF may block PUT — still exercise GET pool + favorites POST when open.
  if (put.status === 200) {
    assertNoLeak("availability_put", await put.json());
  }

  const pool = await fetch(`${BASE}/v1/jobmitra/employer/shift/availability-pool`);
  if (!pool.ok) throw new Error(`pool status ${pool.status}`);
  assertNoLeak("availability_pool", await pool.json());

  const fav = await fetch(`${BASE}/v1/jobmitra/employer/shift/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": "probe" },
    body: JSON.stringify({
      workerMlId: "WMID_FAV",
      displayName: "Worker",
      phone: "+91 98765 43210",
      privateRating: 4.9,
      notes: "trusted",
    }),
  });

  if (fav.status === 201 || fav.status === 200) {
    assertNoLeak("favorites_create", await fav.json());
  }

  const list = await fetch(`${BASE}/v1/jobmitra/employer/shift/favorites`);
  if (!list.ok) throw new Error(`favorites list ${list.status}`);
  assertNoLeak("favorites_list", await list.json());

  console.log(JSON.stringify({ ok: true, probe: "pii_isolation" }));
}

main().catch((err) => {
  console.error("FAIL:", err.message || err);
  process.exit(1);
});
