/**
 * Wave 3 — Universal Calendar Layer (read-only agenda overlay).
 * Sources: personal calendar shift blocks + rest ritual + daily availability.
 * MUST NOT read/write wm_work_diary_* punches.
 */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  getPersonalCalendarShiftActiveSnapshot,
  personalCalendarShiftStorage,
  type PersonalCalendarShiftBlock,
} from "../../../shiftJobs/storage/personalCalendarShift.storage";
import { employeeRestRitualStorage } from "../../storage/employeeRestRitual.storage";
import { shiftAvailabilityDailyStorage } from "../../storage/shiftAvailabilityDaily.storage";

type AgendaKind = "shift" | "rest" | "availability";

type AgendaItem = {
  readonly id: string;
  readonly dateKey: string;
  readonly kind: AgendaKind;
  readonly title: string;
  readonly detail: string;
};

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(base.getDate() + days);
  return next;
}

function formatDayLabel(dateKey: string): string {
  try {
    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateKey;
  }
}

function buildWindowKeys(days: number): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keys: string[] = [];
  for (let i = 0; i < days; i++) {
    keys.push(toDateKey(addDays(today, i)));
  }
  return keys;
}

function subscribeCalendar(cb: () => void): () => void {
  const unsubShift = personalCalendarShiftStorage.subscribe(cb);
  const unsubRest = employeeRestRitualStorage.subscribe(cb);
  const unsubAvail = shiftAvailabilityDailyStorage.subscribe(cb);
  return () => {
    unsubShift();
    unsubRest();
    unsubAvail();
  };
}

function getCalendarRevision(): string {
  const shifts = getPersonalCalendarShiftActiveSnapshot();
  const rest = employeeRestRitualStorage.getSnapshot();
  const avail = shiftAvailabilityDailyStorage.getSnapshot();
  return `${shifts.length}|${shifts[0]?.id ?? ""}|${rest}|${avail}`;
}

function shiftTitle(block: PersonalCalendarShiftBlock): string {
  return block.planName?.trim() || block.jobName;
}

export function UniversalCalendarLayerWidget() {
  const revision = useSyncExternalStore(
    subscribeCalendar,
    getCalendarRevision,
    getCalendarRevision,
  );

  const items = useMemo(() => {
    void revision;
    const windowKeys = new Set(buildWindowKeys(14));
    const agenda: AgendaItem[] = [];

    const shifts = getPersonalCalendarShiftActiveSnapshot().filter((block) =>
      windowKeys.has(block.dateKey),
    );

    for (const block of shifts) {
      agenda.push({
        id: `shift-${block.id}`,
        dateKey: block.dateKey,
        kind: "shift",
        title: shiftTitle(block),
        detail: `${block.companyName} · ${block.status}`,
      });
    }

    const restSnap = employeeRestRitualStorage.getSnapshot();
    if (restSnap) {
      try {
        const rest = JSON.parse(restSnap) as { dateKey?: string };
        if (typeof rest.dateKey === "string" && windowKeys.has(rest.dateKey)) {
          agenda.push({
            id: `rest-${rest.dateKey}`,
            dateKey: rest.dateKey,
            kind: "rest",
            title: "Today I Rest",
            detail: "Personal rest ritual (not diary punch)",
          });
        }
      } catch {
        /* ignore */
      }
    }

    const availSnap = shiftAvailabilityDailyStorage.getSnapshot();
    if (availSnap) {
      try {
        const avail = JSON.parse(availSnap) as { dateKey?: string; status?: string };
        if (
          typeof avail.dateKey === "string" &&
          windowKeys.has(avail.dateKey) &&
          typeof avail.status === "string"
        ) {
          const label =
            avail.status === "available"
              ? "Available"
              : avail.status === "shifted"
                ? "Shifted"
                : "Off-Duty";
          agenda.push({
            id: `avail-${avail.dateKey}`,
            dateKey: avail.dateKey,
            kind: "availability",
            title: `Pulse: ${label}`,
            detail: "Daily availability status",
          });
        }
      } catch {
        /* ignore */
      }
    }

    agenda.sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.kind.localeCompare(b.kind));
    return agenda;
  }, [revision]);

  const grouped = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    for (const item of items) {
      const list = map.get(item.dateKey) ?? [];
      list.push(item);
      map.set(item.dateKey, list);
    }
    return Array.from(map.entries());
  }, [items]);

  const kindClass = useCallback((kind: AgendaKind): string => {
    if (kind === "shift") return "isShift";
    if (kind === "rest") return "isRest";
    return "isAvail";
  }, []);

  return (
    <section
      className="wm-dashWidget"
      data-testid="universal-calendar-layer-widget"
      aria-label="Universal calendar layer"
    >
      <div className="wm-dashWidget__head">
        <div className="wm-dashWidget__kicker">Next 14 days</div>
        <h2 className="wm-dashWidget__title">Universal Calendar</h2>
        <p className="wm-dashWidget__sub">
          Read-only overlay of shifts and personal markers. Does not write diary punches.
        </p>
      </div>

      {grouped.length > 0 ? (
        <ul className="wm-dashCalList">
          {grouped.map(([dateKey, dayItems]) => (
            <li key={dateKey} className="wm-dashCalDay">
              <div className="wm-dashCalDay__label">{formatDayLabel(dateKey)}</div>
              <ul className="wm-dashCalDay__items">
                {dayItems.map((item) => (
                  <li
                    key={item.id}
                    className={`wm-dashCalChip ${kindClass(item.kind)}`}
                    data-kind={item.kind}
                  >
                    <div className="wm-dashCalChip__title">{item.title}</div>
                    <div className="wm-dashCalChip__detail">{item.detail}</div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="wm-dashEmptyHint">
          No shift days or personal markers in the next two weeks yet.
        </p>
      )}
    </section>
  );
}
