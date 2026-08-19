/**
 * Weekly Shift Planner — pure business helpers.
 */

import type { ShiftSwapRecord } from "../storage/shiftSwap.storage";
import { SWAP_MAX_PER_MONTH, SWAP_MIN_NOTICE_MS } from "../validation/shiftSwap.schemas";

/** True when fewer than 24 hours remain before shift start (swap lock). */
export function isShiftLockedForSwap(startAtTimestamp: string): boolean {
  const startMs = Date.parse(startAtTimestamp);
  if (!Number.isFinite(startMs)) return true;
  return startMs - Date.now() < SWAP_MIN_NOTICE_MS;
}

/**
 * Caps active/completed swaps in the calendar month of targetDateStr to max 3.
 * Counts initiator-side records that are not rejected/expired.
 */
export function hasExceededMonthlyLimit(
  employeeId: string,
  swaps: ShiftSwapRecord[],
  targetDateStr: string,
): boolean {
  const monthKey = targetDateStr.slice(0, 7); // YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return true;

  const counted = swaps.filter((s) => {
    if (s.initiatorId !== employeeId) return false;
    if (s.status === "rejected" || s.status === "expired") return false;
    return s.date.slice(0, 7) === monthKey;
  });

  return counted.length >= SWAP_MAX_PER_MONTH;
}

/** Same site + compatible role tags (exact match or shared base tag). */
export function canSwapRoles(
  initiatorRoleTag: string,
  peerRoleTag: string,
  initiatorSite: string,
  peerSite: string,
): boolean {
  const siteA = initiatorSite.trim().toLowerCase();
  const siteB = peerSite.trim().toLowerCase();
  if (!siteA || !siteB || siteA !== siteB) return false;

  const roleA = initiatorRoleTag.trim().toLowerCase();
  const roleB = peerRoleTag.trim().toLowerCase();
  if (!roleA || !roleB) return false;
  if (roleA === roleB) return true;

  // Compatible if one tag is a prefix/base of the other (e.g. barista / barista_senior).
  return roleA.startsWith(roleB) || roleB.startsWith(roleA);
}

export type PlannerDayShift = {
  readonly instanceId: string;
  readonly weekId: string;
  readonly date: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly siteId: string;
  readonly roleTag: string;
  readonly assigneeId: string;
  readonly assigneeName: string;
  readonly isOverride: boolean;
};

/** Build ISO week id from a Date (UTC Monday-based label). */
export function weekIdFromDate(d: Date): string {
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Next 7 calendar days starting today (local). */
export function buildRollingSevenDays(from = new Date()): Date[] {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/**
 * Demo baseline shifts for the rolling window (local SoT placeholder).
 * Instance overrides from approved swaps replace assignee for that instance only.
 */
export function buildDemoWeekShifts(
  days: readonly Date[],
  overrides: ReadonlyMap<string, { assigneeId: string; assigneeName: string }>,
): PlannerDayShift[] {
  const out: PlannerDayShift[] = [];
  for (const day of days) {
    const date = toIsoDate(day);
    const weekId = weekIdFromDate(day);
    // Day+2 10:00 local is typically >=24h from "now" so Zod notice rules are testable.
    const morningStart = new Date(day);
    morningStart.setHours(10, 0, 0, 0);
    const morningEnd = new Date(day);
    morningEnd.setHours(18, 0, 0, 0);

    const instanceId = `inst_${date}_am`;
    const override = overrides.get(instanceId);
    out.push({
      instanceId,
      weekId,
      date,
      startAt: morningStart.toISOString(),
      endAt: morningEnd.toISOString(),
      siteId: "site_main",
      roleTag: "floor",
      assigneeId: override?.assigneeId ?? "worker_a",
      assigneeName: override?.assigneeName ?? "Worker A",
      isOverride: Boolean(override),
    });
  }
  return out;
}

export function collectApprovedOverrides(
  swaps: readonly ShiftSwapRecord[],
): Map<string, { assigneeId: string; assigneeName: string }> {
  const map = new Map<string, { assigneeId: string; assigneeName: string }>();
  for (const s of swaps) {
    if (s.status !== "manager_approved") continue;
    // Peer takes the initiator's instance for that date only.
    map.set(s.shiftInstanceId, {
      assigneeId: s.peerId,
      assigneeName: `Peer ${s.peerId.slice(-4)}`,
    });
  }
  return map;
}
