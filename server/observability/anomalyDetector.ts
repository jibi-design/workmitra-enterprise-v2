/**
 * Real-time anomaly / fraud signal engine (in-memory ring + optional persistence hook).
 * Advisory for Super-Admin dashboard — does not auto-execute hard actuators.
 */

import { createHash } from "node:crypto";
import { logSecurityEvent } from "../observability/securityEvents.js";

export type AnomalySeverity = "yellow" | "red";

export type AnomalyKind =
  | "auth_failure_burst"
  | "credential_stuffing"
  | "rate_limit_storm"
  | "posting_spike"
  | "rbac_denied_burst";

export type AnomalyEvent = {
  id: string;
  kind: AnomalyKind;
  severity: AnomalySeverity;
  clientKey: string;
  path?: string;
  count: number;
  windowSec: number;
  detail: string;
  atIso: string;
};

type CounterBucket = {
  count: number;
  resetAt: number;
  paths: Map<string, number>;
};

const WINDOW_MS = 60_000;
const AUTH_FAIL_THRESHOLD = 8;
const RATE_HIT_THRESHOLD = 12;
const POST_SPIKE_THRESHOLD = 25;
const RBAC_THRESHOLD = 10;
const MAX_EVENTS = 80;

const authFail = new Map<string, CounterBucket>();
const rateHits = new Map<string, CounterBucket>();
const posts = new Map<string, CounterBucket>();
const rbacDenied = new Map<string, CounterBucket>();
const events: AnomalyEvent[] = [];

function bump(
  map: Map<string, CounterBucket>,
  key: string,
  path?: string,
): CounterBucket {
  const now = Date.now();
  let b = map.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + WINDOW_MS, paths: new Map() };
    map.set(key, b);
  }
  b.count += 1;
  if (path) b.paths.set(path, (b.paths.get(path) || 0) + 1);
  return b;
}

function makeId(kind: string, clientKey: string): string {
  return createHash("sha256")
    .update(`${kind}:${clientKey}:${Math.floor(Date.now() / WINDOW_MS)}`)
    .digest("hex")
    .slice(0, 24);
}

function pushEvent(ev: Omit<AnomalyEvent, "id" | "atIso"> & { id?: string }): void {
  const full: AnomalyEvent = {
    id: ev.id || makeId(ev.kind, ev.clientKey),
    kind: ev.kind,
    severity: ev.severity,
    clientKey: ev.clientKey,
    path: ev.path,
    count: ev.count,
    windowSec: ev.windowSec,
    detail: ev.detail,
    atIso: new Date().toISOString(),
  };
  const idx = events.findIndex((e) => e.id === full.id);
  if (idx >= 0) events[idx] = full;
  else events.unshift(full);
  while (events.length > MAX_EVENTS) events.pop();

  logSecurityEvent({
    event: "ANOMALY_RAISED",
    path: full.path,
    httpStatus: 0,
    clientKey: full.clientKey,
    meta: { kind: full.kind, severity: full.severity, count: full.count },
  });
}

export function recordAuthFailureSignal(clientKey: string, path?: string): void {
  const key = clientKey || "unknown";
  const b = bump(authFail, key, path);
  if (b.count >= AUTH_FAIL_THRESHOLD) {
    const distinctPaths = b.paths.size;
    const stuffing = distinctPaths >= 3 || b.count >= AUTH_FAIL_THRESHOLD + 4;
    pushEvent({
      kind: stuffing ? "credential_stuffing" : "auth_failure_burst",
      severity: stuffing ? "red" : "yellow",
      clientKey: key,
      path,
      count: b.count,
      windowSec: WINDOW_MS / 1000,
      detail: stuffing
        ? `Credential stuffing pattern: ${b.count} auth failures across ${distinctPaths} paths in 60s.`
        : `Auth failure burst: ${b.count} failures in 60s.`,
    });
  }
}

export function recordRateLimitSignal(
  clientKey: string,
  path?: string,
  rateClass?: string,
): void {
  const key = clientKey || "unknown";
  const b = bump(rateHits, key, path);
  if (b.count >= RATE_HIT_THRESHOLD) {
    pushEvent({
      kind: "rate_limit_storm",
      severity: b.count >= RATE_HIT_THRESHOLD + 8 ? "red" : "yellow",
      clientKey: key,
      path,
      count: b.count,
      windowSec: WINDOW_MS / 1000,
      detail: `Rate-limit storm: ${b.count} hits (${rateClass || "unknown"}) in 60s.`,
    });
  }
}

export function recordPostingSpikeSignal(clientKey: string, path?: string): void {
  const key = clientKey || "unknown";
  const b = bump(posts, key, path);
  if (b.count >= POST_SPIKE_THRESHOLD) {
    pushEvent({
      kind: "posting_spike",
      severity: "yellow",
      clientKey: key,
      path,
      count: b.count,
      windowSec: WINDOW_MS / 1000,
      detail: `Rapid posting spike: ${b.count} mutating requests in 60s.`,
    });
  }
}

export function recordRbacDeniedSignal(clientKey: string, path?: string): void {
  const key = clientKey || "unknown";
  const b = bump(rbacDenied, key, path);
  if (b.count >= RBAC_THRESHOLD) {
    pushEvent({
      kind: "rbac_denied_burst",
      severity: "yellow",
      clientKey: key,
      path,
      count: b.count,
      windowSec: WINDOW_MS / 1000,
      detail: `RBAC denial burst: ${b.count} denials in 60s.`,
    });
  }
}

export function listAnomalies(limit = 40): AnomalyEvent[] {
  return events.slice(0, Math.max(1, Math.min(limit, MAX_EVENTS)));
}

export function anomalyBadgeSummary(): {
  total: number;
  red: number;
  yellow: number;
  latest: AnomalyEvent | null;
} {
  const red = events.filter((e) => e.severity === "red").length;
  const yellow = events.filter((e) => e.severity === "yellow").length;
  return {
    total: events.length,
    red,
    yellow,
    latest: events[0] || null,
  };
}
