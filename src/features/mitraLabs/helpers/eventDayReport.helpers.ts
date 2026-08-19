/** Event Day report — PIN check-in aggregates (device-local). */

import type { PassCheckInEvent } from "../validation/mitraLabs.schemas";

export const EVENT_REPORT_DEVICE_COPY =
  "Saved on this device. Export CSV for backup. Multi-device sync is not active.";

const DAY_MS = 24 * 60 * 60 * 1000;
export const REPORT_WINDOW_DAYS = 7;

export type EventDayReportRow = {
  readonly eventId: string;
  readonly staffName: string;
  readonly passId: string;
  readonly entryAt: string;
  readonly status: "Entered";
};

export type EventDayDayBucket = {
  readonly dayKey: string;
  readonly label: string;
  readonly checkInCount: number;
  readonly uniqueCount: number;
};

export type EventDayReportModel = {
  readonly todayCheckIns: number;
  readonly todayUnique: number;
  readonly windowCheckIns: number;
  readonly windowUnique: number;
  readonly scanVerifyCount: number;
  readonly last7Days: EventDayDayBucket[];
  readonly people: EventDayReportRow[];
};

export function isPinVerifiedCheckIn(event: PassCheckInEvent): boolean {
  return event.action === "check_in";
}

export function toLocalDayKey(iso: string, now = new Date(iso)): string {
  const d = Number.isNaN(Date.parse(iso)) ? now : new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function listLast7DayKeys(nowMs: number): string[] {
  const keys: string[] = [];
  for (let i = REPORT_WINDOW_DAYS - 1; i >= 0; i -= 1) {
    keys.push(toLocalDayKey(new Date(nowMs - i * DAY_MS).toISOString()));
  }
  return keys;
}

function uniquePassCount(events: readonly PassCheckInEvent[]): number {
  return new Set(events.map((event) => event.passId)).size;
}

function formatDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split("-");
  if (!y || !m || !d) return dayKey;
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function buildEventDayReport(
  events: readonly PassCheckInEvent[],
  nowMs = Date.now(),
): EventDayReportModel {
  const dayKeys = listLast7DayKeys(nowMs);
  const windowStartKey = dayKeys[0] ?? toLocalDayKey(new Date(nowMs).toISOString());
  const todayKey = dayKeys[dayKeys.length - 1] ?? toLocalDayKey(new Date(nowMs).toISOString());

  const entered = events.filter(isPinVerifiedCheckIn);
  const inWindow = entered.filter((event) => toLocalDayKey(event.verifiedAt) >= windowStartKey);
  const today = inWindow.filter((event) => toLocalDayKey(event.verifiedAt) === todayKey);
  const scans = events.filter((event) => event.action === "scan_verify");
  const scansInWindow = scans.filter((event) => toLocalDayKey(event.verifiedAt) >= windowStartKey);

  const last7Days = dayKeys.map((dayKey) => {
    const dayEvents = inWindow.filter((event) => toLocalDayKey(event.verifiedAt) === dayKey);
    return {
      dayKey,
      label: formatDayLabel(dayKey),
      checkInCount: dayEvents.length,
      uniqueCount: uniquePassCount(dayEvents),
    };
  });

  const people: EventDayReportRow[] = [...inWindow]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((event) => ({
      eventId: event.eventId,
      staffName: event.staffName,
      passId: event.passId,
      entryAt: event.verifiedAt,
      status: "Entered" as const,
    }));

  return {
    todayCheckIns: today.length,
    todayUnique: uniquePassCount(today),
    windowCheckIns: inWindow.length,
    windowUnique: uniquePassCount(inWindow),
    scanVerifyCount: scansInWindow.length,
    last7Days,
    people,
  };
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildEventDayReportCsv(rows: readonly EventDayReportRow[]): string {
  const header = "Name,Pass ID,Entry time,Status";
  const body = rows.map((row) =>
    [csvCell(row.staffName), csvCell(row.passId), csvCell(row.entryAt), csvCell(row.status)].join(
      ",",
    ),
  );
  return [header, ...body].join("\n");
}

export function buildEventDayReportJson(model: EventDayReportModel): string {
  return JSON.stringify(
    {
      disclaimer: EVENT_REPORT_DEVICE_COPY,
      todayCheckIns: model.todayCheckIns,
      todayUnique: model.todayUnique,
      windowDays: REPORT_WINDOW_DAYS,
      entries: model.people,
    },
    null,
    2,
  );
}

export function downloadTextFile(filename: string, mime: string, body: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
