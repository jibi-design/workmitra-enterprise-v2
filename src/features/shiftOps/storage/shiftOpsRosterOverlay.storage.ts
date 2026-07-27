/** Job Mitra | shiftOpsRosterOverlay.storage.ts | Local roster overlay when RPC unavailable */

import type { ActiveGroupRosterRow } from "../types";

const KEY = "wm_shift_ops_roster_overlay_v1";

type OverlayMap = Record<string, ActiveGroupRosterRow[]>;

function readMap(): OverlayMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as OverlayMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: OverlayMap): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* demo-safe */
  }
}

export function listOverlayRoster(siteId: string): ActiveGroupRosterRow[] {
  const id = siteId.trim();
  if (!id) return [];
  return readMap()[id] ?? [];
}

export function upsertOverlayRosterMember(row: ActiveGroupRosterRow): void {
  const siteId = row.site_id.trim();
  if (!siteId) return;
  const map = readMap();
  const list = [...(map[siteId] ?? [])];
  const idx = list.findIndex((r) => r.membership_id === row.membership_id);
  if (idx >= 0) list[idx] = row;
  else list.unshift(row);
  map[siteId] = list;
  // Drop from other sites if group moved
  for (const key of Object.keys(map)) {
    if (key === siteId) continue;
    map[key] = (map[key] ?? []).filter((r) => r.membership_id !== row.membership_id);
  }
  writeMap(map);
}

export function seedOverlayRosterIfEmpty(siteId: string, siteName: string): ActiveGroupRosterRow[] {
  const existing = listOverlayRoster(siteId);
  if (existing.length > 0) return existing;
  const demo: ActiveGroupRosterRow = {
    membership_id: `local_${siteId.slice(0, 8)}_demo`,
    site_id: siteId,
    site_name: siteName,
    worker_user_id: "00000000-0000-0000-0000-000000000001",
    display_name: "Demo Worker",
    status: "ready_for_assignment",
    assignment_zone: "General",
    crew_role: "Staff",
    jobmitra_ml_id: "ML-DEMO-WORKER",
    last_reassign_note: null,
    last_reassigned_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  upsertOverlayRosterMember(demo);
  return [demo];
}
