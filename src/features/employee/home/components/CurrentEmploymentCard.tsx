/** Job Mitra | CurrentEmploymentCard.tsx — Personal Work Diary (Locked / Active) */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employmentLifecycleStorage } from "../../employment/storage/employmentLifecycle.storage";
import { workDiaryStorage } from "../../employment/storage/workDiary.storage";
import {
  personalCalendarShiftStorage,
  getPersonalCalendarShiftActiveSnapshot,
} from "../../shiftJobs/storage/personalCalendarShift.storage";
import { employeePlanApplicationSummaryPath } from "../../planner/helpers/plannerEmployeeRoutes";
import {
  formatEmploymentDuration,
  getPersonalDiaryDisplayMetrics,
} from "../helpers/currentEmploymentCardHelpers";

const CAREER_BLUE = "#2563EB";
const CAREER_BLUE_DEEP = "#1D4ED8";
const SLATE_800 = "#1E293B";
const SLATE_500 = "#64748B";
const SLATE_400 = "#94A3B8";
const SLATE_300 = "#CBD5E1";
const SLATE_200 = "#E2E8F0";
const SLATE_50 = "#F8FAFC";

let employmentClockSnapshot = Date.now();

function subscribeEmploymentClock(onStoreChange: () => void) {
  const id = window.setInterval(() => {
    employmentClockSnapshot = Date.now();
    onStoreChange();
  }, 60_000);
  return () => window.clearInterval(id);
}

function getEmploymentClockSnapshot() {
  return employmentClockSnapshot;
}

type EmploymentSnapshot = {
  id: string;
  jobTitle: string;
  companyName: string;
  joinedAt: number;
};

function readEmploymentSnapshot(): string {
  const employment = employmentLifecycleStorage.getPrimaryActive();
  if (!employment) return "";

  return JSON.stringify({
    id: employment.id,
    jobTitle: employment.jobTitle,
    companyName: employment.companyName,
    joinedAt: employment.joinedAt,
  } satisfies EmploymentSnapshot);
}

function parseEmploymentSnapshot(raw: string): EmploymentSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as EmploymentSnapshot;
    return parsed.id ? parsed : null;
  } catch {
    return null;
  }
}

function NotebookIcon({ color = SLATE_400 }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 2h9l3 3v17a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M15 2v4h4" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M8 11h8M8 15h5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LockedMetricPill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 11px",
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 600,
        color: SLATE_400,
        background: SLATE_50,
        border: `1px dashed ${SLATE_300}`,
        whiteSpace: "nowrap",
      }}
    >
      <LockIcon />
      {label}
    </span>
  );
}

function ActiveMetricPill({ label, value }: { label: string; value: number }) {
  const display = Number.isInteger(value) ? String(value) : value.toFixed(1);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 700,
        color: SLATE_800,
        background: "#FFFFFF",
        border: "1px solid #BFDBFE",
        boxShadow: "0 1px 2px rgba(37, 99, 235, 0.08)",
        whiteSpace: "nowrap",
      }}
    >
      {label}: <span style={{ color: CAREER_BLUE_DEEP }}>{display}</span>
    </span>
  );
}

function IconWrap({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: isActive ? "rgba(37, 99, 235, 0.12)" : SLATE_50,
        border: isActive ? "1px solid rgba(37, 99, 235, 0.18)" : `1px solid ${SLATE_200}`,
      }}
    >
      {children}
    </div>
  );
}

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

  const cardStyle: CSSProperties = isActive
    ? {
        opacity: 1,
        background: "#EFF6FF",
        border: "1px solid #BFDBFE",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(37, 99, 235, 0.06), 0 4px 14px rgba(37, 99, 235, 0.08)",
        padding: 18,
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    : {
        opacity: 0.9,
        background: "rgba(255, 255, 255, 0.8)",
        border: "1px solid rgba(226, 232, 240, 0.6)",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
        padding: 18,
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      };

  return (
    <section
      data-testid="employee-current-employment-card"
      data-employment-active={isActive ? "true" : "false"}
      data-diary-state={isActive ? "active" : "locked"}
      style={cardStyle}
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
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: SLATE_800,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}
          >
            Personal Work Diary
          </div>

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
          <button
            type="button"
            onClick={handleBtn}
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg, ${CAREER_BLUE} 0%, ${CAREER_BLUE_DEEP} 100%)`,
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.28)",
            }}
          >
            Open
          </button>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
        aria-label="Personal diary metrics"
      >
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

      {hasShiftCalendar ? (
        <div
          style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}
          aria-label="Synced shift calendar"
        >
          {shiftBlocks.slice(0, 6).map((block) => {
            const isPlanner = block.source === "planner";
            return (
              <button
                key={block.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (block.workspaceId) {
                    const wsPath = isPlanner
                      ? ROUTE_PATHS.employeePlannerWorkspace
                      : ROUTE_PATHS.employeeShiftWorkspace;
                    nav(wsPath.replace(":workspaceId", block.workspaceId));
                  } else if (block.planId) {
                    nav(employeePlanApplicationSummaryPath(block.planId));
                  }
                }}
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "5px 9px",
                  borderRadius: 999,
                  border: isPlanner
                    ? "1px solid rgba(8,145,178,0.35)"
                    : "1px solid rgba(22,163,74,0.35)",
                  background: isPlanner ? "rgba(8,145,178,0.1)" : "rgba(22,163,74,0.1)",
                  color: isPlanner ? "#0e7490" : "#15803d",
                  cursor: "pointer",
                }}
              >
                {isPlanner ? "📋" : "🟢"} {block.planName ?? block.jobName} · {block.dateKey}
              </button>
            );
          })}
        </div>
      ) : null}

      {isActive ? (
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            fontWeight: 600,
            color: CAREER_BLUE,
            textAlign: "center",
          }}
        >
          Tap to open your private work diary
        </div>
      ) : null}
    </section>
  );
}
