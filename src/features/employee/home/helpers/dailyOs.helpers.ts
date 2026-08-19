/** Job Mitra | dailyOs.helpers.ts | Funnel, heat, sparkline, Needs-you ranking */

import type { AppLite } from "../../careerJobs/types/careerApplicationTypes";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";
import type { PersonalCalendarShiftBlock } from "../../shiftJobs/storage/personalCalendarShift.storage";
import type { EarningEntry } from "../../shiftJobs/storage/earningsStorage";
import type { DailyAvailabilityStatus } from "../storage/shiftAvailabilityDaily.storage";
import type {
  CareerFunnelCounts,
  CareerFunnelStage,
  DailyOsHeatCell,
  DailyOsHeatKind,
  DailyOsNextShift,
  DailyOsSparkPoint,
} from "./dailyOs.types";
import { mapApplicationStatus } from "./candidateDashboard.helpers";

const CLOSED = new Set(["rejected", "withdrawn", "offer_declined"]);

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateFromKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(base.getDate() + days);
  return next;
}

export function startOfLocalDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function weekdayShort(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" });
}

function dayNum(dateKey: string): string {
  return dateKey.slice(8);
}

export function computeCareerFunnel(apps: readonly AppLite[]): CareerFunnelCounts {
  const counts: CareerFunnelCounts = {
    applied: 0,
    shortlisted: 0,
    interview: 0,
    offer: 0,
  };
  for (const app of apps) {
    const stage = String(app.stage ?? "").toLowerCase();
    if (CLOSED.has(stage)) continue;
    const mapped = mapApplicationStatus(String(app.stage));
    if (mapped === "Offer") counts.offer += 1;
    else if (mapped === "Interview") counts.interview += 1;
    else if (mapped === "Shortlisted") counts.shortlisted += 1;
    else if (mapped !== "Closed") counts.applied += 1;
  }
  return counts;
}

export function funnelMax(counts: CareerFunnelCounts): number {
  return Math.max(1, counts.applied, counts.shortlisted, counts.interview, counts.offer);
}

const FUNNEL_ORDER: readonly CareerFunnelStage[] = [
  "applied",
  "shortlisted",
  "interview",
  "offer",
];

/** Deepest stage that currently has at least one live application. */
export function resolveCurrentFunnelStage(
  counts: CareerFunnelCounts,
): CareerFunnelStage | null {
  let current: CareerFunnelStage | null = null;
  for (const stage of FUNNEL_ORDER) {
    if (counts[stage] > 0) current = stage;
  }
  return current;
}

export function countCriticalActions(items: readonly PendingActionItem[]): number {
  return items.filter((item) => item.count > 0).reduce((sum, item) => sum + item.count, 0);
}

export function pickNeedsYouItems(
  items: readonly PendingActionItem[],
  limit = 3,
): PendingActionItem[] {
  const rank = (item: PendingActionItem): number => {
    const id = item.id.toLowerCase();
    const label = item.label.toLowerCase();
    if (id.includes("offer") || label.includes("offer")) return 0;
    if (id.includes("interview") || label.includes("interview")) return 1;
    if (id.includes("attendance") || label.includes("confirm")) return 2;
    if (item.domain === "career") return 3;
    if (item.domain === "shift") return 4;
    return 5;
  };
  return [...items]
    .filter((item) => item.count > 0)
    .sort((a, b) => rank(a) - rank(b) || b.count - a.count)
    .slice(0, limit);
}

export function countCareerCriticalActions(items: readonly PendingActionItem[]): number {
  return items
    .filter((item) => item.domain === "career" && item.count > 0)
    .reduce((sum, item) => sum + item.count, 0);
}

export function resolveNextConfirmedShift(
  blocks: readonly PersonalCalendarShiftBlock[],
  todayKey: string,
  horizonDays = 7,
): DailyOsNextShift | null {
  const end = addDays(dateFromKey(todayKey), horizonDays);
  const endKey = toDateKey(end);
  const upcoming = blocks
    .filter((block) => block.status === "confirmed")
    .filter((block) => block.dateKey >= todayKey && block.dateKey <= endKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.syncedAt - b.syncedAt);
  const nearest = upcoming[0];
  if (!nearest) return null;
  return {
    jobName: nearest.jobName,
    companyName: nearest.companyName,
    dateKey: nearest.dateKey,
  };
}

export function formatShiftWhen(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return "Today";
  const tomorrow = toDateKey(addDays(dateFromKey(todayKey), 1));
  if (dateKey === tomorrow) return "Tomorrow";
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function buildWeekHeatCells(args: {
  todayKey: string;
  confirmedDateKeys: readonly string[];
}): DailyOsHeatCell[] {
  const confirmedKeys = new Set(args.confirmedDateKeys);
  const origin = dateFromKey(args.todayKey);
  const cells: DailyOsHeatCell[] = [];
  for (let i = 0; i < 7; i += 1) {
    const dateKey = toDateKey(addDays(origin, i));
    const kind: DailyOsHeatKind = confirmedKeys.has(dateKey) ? "confirmed" : "empty";
    cells.push({
      dateKey,
      weekday: weekdayShort(dateKey),
      dayNum: dayNum(dateKey),
      kind,
      label: kind === "confirmed" ? "Shift" : "Free",
    });
  }
  return cells;
}

function dayMs(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).setHours(0, 0, 0, 0);
}

export function buildEarningsSparkline(
  entries: readonly EarningEntry[],
  todayKey: string,
  days = 7,
): DailyOsSparkPoint[] {
  const origin = startOfLocalDay(dateFromKey(todayKey));
  const points: DailyOsSparkPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const dateKey = toDateKey(addDays(origin, -i));
    const start = dayMs(dateKey);
    const end = start + 86_400_000 - 1;
    let amount = 0;
    let hours = 0;
    for (const entry of entries) {
      if (entry.endAt < start || entry.startAt > end) continue;
      amount += entry.payPerDay;
      hours += 8;
    }
    points.push({ dateKey, weekday: weekdayShort(dateKey), amount, hours });
  }
  return points;
}

export function sparklinePath(
  amounts: readonly number[],
  width: number,
  height: number,
  pad = 4,
): string {
  if (amounts.length === 0) return "";
  const max = Math.max(1, ...amounts);
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const step = amounts.length === 1 ? 0 : innerW / (amounts.length - 1);
  return amounts
    .map((value, index) => {
      const x = pad + step * index;
      const y = pad + innerH - (value / max) * innerH;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function pulseHeroLabel(status: DailyAvailabilityStatus | null): string {
  if (status === "available") return "Available";
  if (status === "shifted") return "On a shift";
  if (status === "off_duty") return "Off-duty";
  return "Not set";
}

export function pickPipelineSummary<T extends { status: string }>(
  rows: readonly T[],
  limit = 2,
): T[] {
  const rank = (status: string): number => {
    if (status === "Offer") return 0;
    if (status === "Interview") return 1;
    if (status === "Shortlisted") return 2;
    if (status === "In Review") return 3;
    return 4;
  };
  return [...rows].sort((a, b) => rank(a.status) - rank(b.status)).slice(0, limit);
}

