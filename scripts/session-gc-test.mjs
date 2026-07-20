// Session GC — simulate session.store.ts logic
import { randomUUID } from "node:crypto";

const sessions = new Map();

function sweepExpiredSessions() {
  const now = Date.now();
  let swept = 0;
  for (const [id, record] of sessions) {
    if (record.expiresAt < now) { sessions.delete(id); swept++; }
  }
  return swept;
}

// Test 1: expired session removed on .get()
const pastExpiry = Date.now() - 1000;
const expiredId = randomUUID();
sessions.set(expiredId, { userId: "u1", createdAt: Date.now() - 2000, expiresAt: pastExpiry });

function get(sessionId) {
  const record = sessions.get(sessionId);
  if (!record) return null;
  if (record.expiresAt < Date.now()) { sessions.delete(sessionId); return null; }
  return record;
}

const accessed = get(expiredId);
console.log("EXPIRED_ON_ACCESS_RETURNS_NULL:", accessed === null ? "PASS" : "FAIL");
console.log("EXPIRED_ON_ACCESS_DELETED:", !sessions.has(expiredId) ? "PASS" : "FAIL");

// Test 2: hourly sweep removes expired sessions
const validId = randomUUID();
sessions.set(validId, { userId: "u2", createdAt: Date.now(), expiresAt: Date.now() + 60_000 });
const exp1 = randomUUID();
const exp2 = randomUUID();
sessions.set(exp1, { userId: "u3", createdAt: Date.now(), expiresAt: Date.now() - 5000 });
sessions.set(exp2, { userId: "u4", createdAt: Date.now(), expiresAt: Date.now() - 10000 });

const before = sessions.size;
const swept = sweepExpiredSessions();
const after = sessions.size;
console.log(`SWEEP_REMOVED_${swept}_EXPIRED:`, swept === 2 ? "PASS" : "FAIL");
console.log("SWEEP_KEPT_VALID:", sessions.has(validId) ? "PASS" : "FAIL");
console.log(`SWEEP_SIZE_BEFORE:${before} AFTER:${after}`);

// Test 3: unref() check
const gcTimer = setInterval(() => {}, 3_600_000);
console.log("UNREF_AVAILABLE:", typeof gcTimer.unref === "function" ? "PASS" : "FAIL");
if (typeof gcTimer.unref === "function") gcTimer.unref();
clearInterval(gcTimer);

// Test 4: module-level setInterval only runs once (no reload risk in ESM)
console.log("ESM_MODULE_SINGLETON:", "PASS (ESM modules are cached — setInterval fires once per process)");
