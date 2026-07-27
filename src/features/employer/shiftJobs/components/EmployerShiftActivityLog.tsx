// App name: Job Mitra
// File name: EmployerShiftActivityLog.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftActivityLog.tsx

import type { EmployerShiftActivityEntry } from "../../shiftJobs/storage/employerShift.storage";
import { fmtDateTime } from "../helpers/shiftDashboardHelpers";

type EmployerShiftActivityLogProps = {
  open: boolean;
  activity: EmployerShiftActivityEntry[];
  onToggleOpen: () => void;
};

export function EmployerShiftActivityLog({
  open,
  activity,
  onToggleOpen,
}: EmployerShiftActivityLogProps) {
  return (
    <div
      style={{
        marginTop: 10,
        marginBottom: 24,
        borderRadius: "var(--wm-radius-chip)",
        border: "1px solid var(--wm-er-border)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "var(--wm-er-surface)",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--wm-er-text)",
        }}
      >
        <span>Activity Log</span>
        <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
          {open ? "Hide" : `${activity.length} entries`}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", background: "var(--wm-er-surface)" }}>
          {activity.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", paddingTop: 8 }}>
              No activity yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8, paddingTop: 8 }}>
              {activity.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--wm-radius-10)",
                    background: "var(--wm-er-bg)",
                    border: "1px solid var(--wm-er-border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
                      {entry.title}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "var(--wm-er-muted)", whiteSpace: "nowrap" }}
                    >
                      {fmtDateTime(entry.createdAt)}
                    </div>
                  </div>

                  {entry.body && (
                    <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 4 }}>
                      {entry.body}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
