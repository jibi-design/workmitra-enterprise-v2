/**
 * Security probe — DoS/spam flood must trip 429 within SLA.
 * Run: node tests/security/rate-limit.probe.mjs
 */

const BASE = process.env.WM_API_BASE || "http://localhost:3001";
const PATH = "/v1/jobmitra/employee/shift/availability?workerMlId=probe";
const FLOOD = Number(process.env.WM_FLOOD_N || "80");
const SLA_MS = Number(process.env.WM_429_SLA_MS || "5000");

async function main() {
  const started = Date.now();
  let hit429 = false;
  let first429At = 0;

  for (let i = 0; i < FLOOD; i += 1) {
    const res = await fetch(`${BASE}${PATH}`, { method: "GET" });
    if (res.status === 429) {
      hit429 = true;
      first429At = Date.now() - started;
      break;
    }
  }

  if (!hit429) {
    console.error("FAIL: no 429 observed during flood");
    process.exit(1);
  }
  if (first429At > SLA_MS) {
    console.error(`FAIL: 429 after ${first429At}ms exceeded SLA ${SLA_MS}ms`);
    process.exit(1);
  }

  console.log(
    JSON.stringify({
      ok: true,
      probe: "rate_limit",
      first429AtMs: first429At,
      slaMs: SLA_MS,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
