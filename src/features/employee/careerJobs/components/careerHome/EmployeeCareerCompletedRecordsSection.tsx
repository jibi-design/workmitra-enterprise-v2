// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerCompletedRecordsSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\careerHome\EmployeeCareerCompletedRecordsSection.tsx

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import { employmentLifecycleStorage } from "../../../employment/storage/employmentLifecycle.storage";

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e40af";

function getHistorySnapshot(): string {
  return JSON.stringify(employmentLifecycleStorage.getVerifiedHistory());
}

function parseHistoryCount(raw: string): number {
  try {
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function EmployeeCareerCompletedRecordsSection() {
  const nav = useNavigate();

  const raw = useSyncExternalStore(
    employmentLifecycleStorage.subscribe,
    getHistorySnapshot,
    getHistorySnapshot,
  );

  const recordCount = useMemo(() => parseHistoryCount(raw), [raw]);

  if (recordCount === 0) return null;

  return (
    <button
      type="button"
      onClick={() => nav(ROUTE_PATHS.employeeCareerCompletedRecords)}
      className="wm-press-card wm-ee-card"
      style={{
        width: "100%",
        padding: "var(--wm-card-padding)",
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "rgba(255, 255, 255, 0.65)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
        backdropFilter: "blur(12px)",
        cursor: "pointer",
        textAlign: "left",
        transition: "transform 0.1s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "var(--wm-stack-gap)",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div className="wm-typeCardTitle">Completed Career Records</div>
          <div className="wm-typeHelperMd" style={{ marginTop: 6 }}>
            Closed jobs, feedback, and work history.
          </div>
        </div>

        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 700,
            padding: "6px 12px",
            borderRadius: "var(--wm-radius-employee-card)",
            color: CAREER_BLUE_DEEP,
            background: "rgba(37, 99, 235, 0.08)",
            border: "1px solid rgba(37, 99, 235, 0.1)",
            whiteSpace: "nowrap",
          }}
        >
          {recordCount} closed
        </span>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "10px 12px",
          borderRadius: "var(--wm-radius-button)",
          background: "rgba(37, 99, 235, 0.05)",
          color: CAREER_BLUE,
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          border: "1px solid rgba(37, 99, 235, 0.08)",
        }}
      >
        View records →
      </div>
    </button>
  );
}
