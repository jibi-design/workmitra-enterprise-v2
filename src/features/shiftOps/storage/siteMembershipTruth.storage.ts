/**
 * Job Mitra | siteMembershipTruth.storage.ts
 * Local mirror of formal shift_ops.site_memberships for Call gates + confirm truth.
 * Does not store phone/email — siteId + worker ML + status only.
 */

import type { SoMembershipStatus } from "../types";

const KEY = "wm_shift_ops_site_membership_truth_v1";

export type SiteMembershipTruthRow = {
  siteId: string;
  workerMlId: string;
  membershipId: string;
  status: SoMembershipStatus | string;
  updatedAt: number;
};

type TruthMap = Record<string, SiteMembershipTruthRow>;

const listeners = new Set<() => void>();

function truthKey(siteId: string, workerMlId: string): string {
  return `${siteId.trim().toLowerCase()}::${workerMlId.trim().toUpperCase()}`;
}

function readMap(): TruthMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as TruthMap;
  } catch {
    return {};
  }
}

function writeMap(map: TruthMap): void {
  localStorage.setItem(KEY, JSON.stringify(map));
  listeners.forEach((fn) => fn());
}

export function subscribeSiteMembershipTruth(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSiteMembershipTruth(
  siteId?: string | null,
  workerMlId?: string | null,
): SiteMembershipTruthRow | null {
  const site = (siteId ?? "").trim();
  const worker = (workerMlId ?? "").trim();
  if (!site || !worker) return null;
  return readMap()[truthKey(site, worker)] ?? null;
}

export function upsertSiteMembershipTruth(input: {
  siteId: string;
  workerMlId: string;
  membershipId: string;
  status: SoMembershipStatus | string;
}): SiteMembershipTruthRow | null {
  const siteId = input.siteId.trim();
  const workerMlId = input.workerMlId.trim().toUpperCase();
  const membershipId = input.membershipId.trim();
  const status = String(input.status ?? "").trim();
  if (!siteId || !workerMlId || !membershipId || !status) return null;

  const row: SiteMembershipTruthRow = {
    siteId,
    workerMlId,
    membershipId,
    status,
    updatedAt: Date.now(),
  };
  const map = readMap();
  map[truthKey(siteId, workerMlId)] = row;
  writeMap(map);
  return row;
}

export function clearSiteMembershipTruth(siteId: string, workerMlId: string): void {
  const map = readMap();
  const key = truthKey(siteId, workerMlId);
  if (!(key in map)) return;
  delete map[key];
  writeMap(map);
}

/** All mirrored memberships (local), newest first. Stable snapshot for useSyncExternalStore. */
let membershipListCache: SiteMembershipTruthRow[] = [];
let membershipListCacheKey = "";

export function listSiteMembershipTruth(workerMlId?: string | null): SiteMembershipTruthRow[] {
  const worker = (workerMlId ?? "").trim().toUpperCase();
  const map = readMap();
  const cacheKey = `${worker}::${JSON.stringify(map)}`;
  if (cacheKey === membershipListCacheKey) return membershipListCache;

  const rows = Object.values(map);
  const filtered = worker
    ? rows.filter((row) => row.workerMlId.trim().toUpperCase() === worker)
    : rows;
  membershipListCache = filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  membershipListCacheKey = cacheKey;
  return membershipListCache;
}
