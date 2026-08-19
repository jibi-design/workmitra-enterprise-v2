/** Job Mitra | CurrentEmploymentCard.tsx — Home Personal Work Diary entry
 *
 * Opens `/employee/personal-work-diary` (restored calendar content).
 * Never opens Workplace Hub. Metrics from original work diary store when employed.
 */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { HOME_LAYOUT_INSPECTION } from "../../../../shared/config/homeLayoutInspection";
import { employmentLifecycleStorage } from "../../employment/storage/employmentLifecycle.storage";
import { workDiaryStorage } from "../../employment/storage/workDiary.storage";
import {
  personalCalendarShiftStorage,
  getPersonalCalendarShiftActiveSnapshot,
} from "../../shiftJobs/storage/personalCalendarShift.storage";
import {
  formatEmploymentDuration,
  getPersonalDiaryDisplayMetrics,
} from "../helpers/currentEmploymentCardHelpers";
import {
  getEmploymentClockSnapshot,
  parseEmploymentSnapshot,
  readEmploymentSnapshot,
  subscribeEmploymentClock,
} from "./CurrentEmploymentCard.helpers";
import {
  ActiveMetricPill,
  LockedMetricPill,
  NotebookIcon,
  ShiftCalendarChips,
} from "./CurrentEmploymentCard.parts";
import { DIARY_BLUE } from "../../employment/helpers/diaryTheme";

export function CurrentEmploymentCard() {
  const nav = useNavigate();
  const now = useSyncExternalStore(
    subscribeEmploymentClock,
    getEmploymentClockSnapshot,
    getEmploymentClockSnapshot,
  );

  const subscribe = useCallback((callback: () => void) => {
    const unsubEmployment = employmentLifecycleStorage.subscribe(callback);
    const unsubDiary = workDiaryStorage.subscribe(callback);
    const unsubShiftCal = personalCalendarShiftStorage.subscribe(callback);
    return () => {
      unsubEmployment();
      unsubDiary();
      unsubShiftCal();
    };
  }, []);

  const raw = useSyncExternalStore(subscribe, readEmploymentSnapshot, readEmploymentSnapshot);
  const employment = useMemo(() => parseEmploymentSnapshot(raw), [raw]);
  const shiftBlocks = useSyncExternalStore(
    personalCalendarShiftStorage.subscribe,
    getPersonalCalendarShiftActiveSnapshot,
    getPersonalCalendarShiftActiveSnapshot,
  );

  const hasRealEmployment = employment !== null;
  const forceVisible = HOME_LAYOUT_INSPECTION;
  const hasShiftCalendar = shiftBlocks.length > 0;
  const showActiveChrome = hasRealEmployment || forceVisible || hasShiftCalendar;

  const metrics = useMemo(
    () => (employment ? getPersonalDiaryDisplayMetrics(employment.id) : null),
    [employment],
  );

  const durationLabel = useMemo(
    () => (employment ? formatEmploymentDuration(now, employment.joinedAt) : ""),
    [employment, now],
  );

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeePersonalWorkDiary);
  }, [nav]);

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleOpen();
      }
    },
    [handleOpen],
  );

  const statusLine = hasRealEmployment && employment
    ? `${employment.companyName} · ${employment.jobTitle} · ${durationLabel}`
    : forceVisible
      ? "Demo Partner Co · Warehouse Supervisor · Preview"
      : hasShiftCalendar
        ? `${shiftBlocks.length} confirmed shift day${shiftBlocks.length !== 1 ? "s" : ""} synced.`
        : "Accept a job offer to unlock your diary.";

  const displayMetrics = hasRealEmployment
    ? metrics
    : forceVisible
      ? { trackedHours: 0, tasks: 0, notes: 0 }
      : null;

  const bannerClass = [
    "wm-homeDiaryBanner",
    "wm-press-card",
    "wm-homeCardEnter",
    "wm-homeCardEnter--4",
    showActiveChrome ? "wm-homeDiaryBanner--active" : "wm-homeDiaryBanner--locked",
  ].join(" ");

  return (
    <section
      className={bannerClass}
      data-testid="employee-current-employment-card"
      data-employment-active={hasRealEmployment ? "true" : "false"}
      data-diary-state={showActiveChrome ? "active" : "locked"}
      data-diary-module="personal-work-diary"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKey}
      aria-label="Open Personal Work Diary"
    >
      <div className="wm-homeDiaryBanner__top">
        <div
          className="wm-homeDiaryBanner__icon"
          style={{
            background: showActiveChrome
              ? "color-mix(in srgb, var(--wm-diary-accent, #3b82f6) 14%, transparent)"
              : "rgba(148, 163, 184, 0.12)",
            color: showActiveChrome ? DIARY_BLUE : "#94a3b8",
            border: showActiveChrome
              ? "1px solid color-mix(in srgb, var(--wm-diary-accent, #3b82f6) 22%, transparent)"
              : "1px solid rgba(226, 232, 240, 0.9)",
          }}
        >
          <NotebookIcon color="currentColor" />
        </div>

        <div className="wm-homeDiaryBanner__copy">
          <h2 className="wm-homeDiaryBanner__title wm-typeCardTitle">Personal Work Diary</h2>
          <p className="wm-homeDiaryBanner__status wm-typeHelper">{statusLine}</p>
          <p className="wm-homeDiaryBanner__desc wm-typeHelper">
            Private tracker for hours, earnings, and notes.
          </p>
        </div>
      </div>

      <div className="wm-homeDiaryMetrics" aria-label="Personal diary metrics">
        <div className="wm-homeDiaryMetrics__pills">
          {displayMetrics ? (
            <>
              <ActiveMetricPill label="Attendance" value={displayMetrics.trackedHours} />
              <ActiveMetricPill label="Tasks" value={displayMetrics.tasks} />
              <ActiveMetricPill label="Notices" value={displayMetrics.notes} />
            </>
          ) : (
            <>
              <LockedMetricPill label="Attendance" />
              <LockedMetricPill label="Tasks" />
              <LockedMetricPill label="Notices" />
            </>
          )}
        </div>
      </div>

      {hasShiftCalendar ? <ShiftCalendarChips blocks={shiftBlocks} /> : null}
    </section>
  );
}
