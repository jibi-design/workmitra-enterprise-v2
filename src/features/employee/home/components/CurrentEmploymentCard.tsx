/** Job Mitra | CurrentEmploymentCard.tsx — Personal Work Diary (Locked / Active) */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
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
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  IconWrap,
  LockedMetricPill,
  NotebookIcon,
  ShiftCalendarChips,
  SLATE_400,
  SLATE_500,
} from "./CurrentEmploymentCard.parts";
import {
  getCardStyle,
  METRICS_ROW_STYLE,
  OPEN_BUTTON_STYLE,
  TAP_HINT_STYLE,
  TITLE_STYLE,
} from "./CurrentEmploymentCard.styles";

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
  const isActive = employment !== null;
  const hasShiftCalendar = shiftBlocks.length > 0;

  const metrics = useMemo(
    () => (employment ? getPersonalDiaryDisplayMetrics(employment.id) : null),
    [employment],
  );

  const durationLabel = useMemo(
    () => (employment ? formatEmploymentDuration(now, employment.joinedAt) : ""),
    [employment, now],
  );

  const handleOpen = useCallback(() => {
    if (!employment) return;
    nav(ROUTE_PATHS.employeeEmploymentDetail.replace(":employmentId", employment.id));
  }, [employment, nav]);

  const handleBtn = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      handleOpen();
    },
    [handleOpen],
  );

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleOpen();
      }
    },
    [handleOpen, isActive],
  );

  return (
    <section
      data-testid="employee-current-employment-card"
      data-employment-active={isActive ? "true" : "false"}
      data-diary-state={isActive ? "active" : "locked"}
      style={getCardStyle(isActive)}
      role={isActive ? "button" : "region"}
      tabIndex={isActive ? 0 : undefined}
      onClick={isActive ? handleOpen : undefined}
      onKeyDown={isActive ? handleKey : undefined}
      aria-label={
        isActive
          ? "Open personal work diary"
          : "Personal work diary — locked until you accept a job offer"
      }
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <IconWrap isActive={isActive}>
          <NotebookIcon color={isActive ? CAREER_BLUE : SLATE_400} />
        </IconWrap>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={TITLE_STYLE}>Personal Work Diary</div>

          {isActive && employment && metrics ? (
            <>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: CAREER_BLUE_DEEP,
                  lineHeight: 1.35,
                }}
              >
                {employment.companyName} · {employment.jobTitle} · {durationLabel}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: SLATE_500, lineHeight: 1.45 }}>
                Track your hours, earnings, and personal notes — private to you.
              </div>
            </>
          ) : (
            <>
              <div style={{ marginTop: 4, fontSize: 12.5, color: SLATE_500, lineHeight: 1.45 }}>
                Track your hours, earnings, and personal notes.
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11.5,
                  color: SLATE_400,
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {hasShiftCalendar
                  ? `${shiftBlocks.length} confirmed shift day${shiftBlocks.length !== 1 ? "s" : ""} synced to your calendar.`
                  : "Accept a job offer to unlock your diary."}
              </div>
            </>
          )}
        </div>

        {isActive ? (
          <button type="button" onClick={handleBtn} style={OPEN_BUTTON_STYLE}>
            Open
          </button>
        ) : null}
      </div>

      <div style={METRICS_ROW_STYLE} aria-label="Personal diary metrics">
        {isActive && metrics ? (
          <>
            <ActiveMetricPill label="Attendance" value={metrics.trackedHours} />
            <ActiveMetricPill label="Tasks" value={metrics.tasks} />
            <ActiveMetricPill label="Notices" value={metrics.notes} />
          </>
        ) : (
          <>
            <LockedMetricPill label="Attendance" />
            <LockedMetricPill label="Tasks" />
            <LockedMetricPill label="Notices" />
          </>
        )}
      </div>

      {hasShiftCalendar ? <ShiftCalendarChips blocks={shiftBlocks} /> : null}

      {isActive ? <div style={TAP_HINT_STYLE}>Tap to open your private work diary</div> : null}
    </section>
  );
}
