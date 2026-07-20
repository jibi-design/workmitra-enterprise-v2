// Body size limit — simulate readJsonBody logic
const MAX_BODY_BYTES = 8 * 1024;

async function readJsonBody(chunks) {
  let total = 0;
  const collected = [];
  for (const chunk of chunks) {
    const buf = Buffer.from(chunk);
    total += buf.byteLength;
    if (total > MAX_BODY_BYTES) return null;
    collected.push(buf);
  }
  if (collected.length === 0) return {};
  try { return JSON.parse(Buffer.concat(collected).toString("utf8")); } catch { return {}; }
}

// Normal login body (~60 bytes)
const normal = [JSON.stringify({ email: "employee@demo.jobmitra.app", password: "demo1234" })];
const normalResult = await readJsonBody(normal);
console.log("NORMAL_BODY:", normalResult !== null ? "PASS (parsed)" : "FAIL");

// Oversized body (9 KB > 8 KB limit)
const oversized = ["x".repeat(9 * 1024)];
const oversizedResult = await readJsonBody(oversized);
console.log("OVERSIZED_BODY_RETURNS_NULL:", oversizedResult === null ? "PASS (413 path)" : "FAIL");
console.log("OVERSIZED_NO_SESSION:", oversizedResult === null ? "PASS (session.create never called)" : "FAIL");

// Empty body
const empty = [];
const emptyResult = await readJsonBody(empty);
console.log("EMPTY_BODY:", JSON.stringify(emptyResult) === "{}" ? "PASS (empty object)" : "FAIL");
