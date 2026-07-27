import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employeePlanApplicationSummaryPath } from "../../planner/helpers/plannerEmployeeRoutes";
import type { PersonalCalendarShiftBlock } from "../../shiftJobs/storage/personalCalendarShift.storage";
import {
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  SLATE_400,
  SLATE_50,
  SLATE_200,
  SLATE_300,
  SLATE_500,
  SLATE_800,
} from "./CurrentEmploymentCard.styles";

export function NotebookIcon({ color = SLATE_400 }: { color?: string }) {
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

export function LockedMetricPill({ label }: { label: string }) {
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

export function ActiveMetricPill({ label, value }: { label: string; value: number }) {
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

export function IconWrap({ isActive, children }: { isActive: boolean; children: ReactNode }) {
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

export function ShiftCalendarChips({ blocks }: { blocks: PersonalCalendarShiftBlock[] }) {
  const nav = useNavigate();

  if (blocks.length === 0) return null;

  return (
    <div
      style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}
      aria-label="Synced shift calendar"
    >
      {blocks.slice(0, 6).map((block) => {
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
  );
}

export { CAREER_BLUE, CAREER_BLUE_DEEP, SLATE_500, SLATE_400 };
