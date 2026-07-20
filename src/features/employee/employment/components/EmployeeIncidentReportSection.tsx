// App name: Job Mitra
// File name: EmployeeIncidentReportSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\EmployeeIncidentReportSection.tsx

import { useEffect, useState } from "react";
import { incidentReportStorage } from "../../../employer/hrManagement/storage/incidentReport.storage";
import type { IncidentReport } from "../../../employer/hrManagement/types/incidentReport.types";

const CONSOLE_BLUE = "var(--wm-er-accent-console, #0369a1)";
const TEXT = "var(--wm-emp-text, var(--wm-er-text, #1e293b))";
const MUTED = "var(--wm-emp-muted, var(--wm-er-muted, #64748b))";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  reported: { label: "Reported", color: "#dc2626" },
  acknowledged: { label: "Acknowledged", color: "#d97706" },
  in_progress: { label: "In Progress", color: "#2563eb" },
  resolved: { label: "Resolved", color: "#15803d" },
};

type Props = {
  employmentId: string;
  hrCandidateId: string | null;
  employeeName: string;
};

export function EmployeeIncidentReportSection({ employmentId }: Props) {
  const [reports, setReports] = useState<IncidentReport[]>(() =>
    incidentReportStorage.getForEmployment(employmentId),
  );

  useEffect(() => {
    const refresh = () => setReports(incidentReportStorage.getForEmployment(employmentId));
    refresh();
    return incidentReportStorage.subscribe(refresh);
  }, [employmentId]);

  return (
    <div className="wm-ee-card" style={{ border: "1px solid rgba(3,105,161,0.12)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 950, fontSize: 14, color: TEXT }}>Report Issue</div>
          <div style={{ fontSize: 11.5, color: MUTED, marginTop: 3, lineHeight: 1.45 }}>
            Workplace issue reporting will be available after employer reporting tools are enabled.
          </div>
        </div>

        <button
          type="button"
          disabled
          aria-disabled="true"
          style={{
            flexShrink: 0,
            height: 34,
            padding: "0 14px",
            borderRadius: 999,
            border: "1px solid rgba(3,105,161,0.14)",
            background: "rgba(3,105,161,0.08)",
            color: CONSOLE_BLUE,
            fontSize: 12,
            fontWeight: 950,
            cursor: "not-allowed",
            opacity: 0.72,
          }}
        >
          Report
        </button>
      </div>

      {reports.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reports.map((report) => {
            const sCfg = STATUS_LABELS[report.status] ?? STATUS_LABELS.reported;
            const dateStr = new Date(report.reportedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={report.id}
                style={{
                  padding: "11px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.18)",
                  background: report.status === "resolved" ? "#fafafa" : "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 750, color: TEXT, lineHeight: 1.4, flex: 1 }}
                  >
                    {report.description.length > 80
                      ? `${report.description.slice(0, 80)}...`
                      : report.description}
                  </div>

                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 900,
                      background: `${sCfg.color}15`,
                      color: sCfg.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sCfg.label}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: MUTED, marginTop: 5, display: "flex", gap: 8 }}>
                  {report.location && <span>{report.location}</span>}
                  <span>{dateStr}</span>
                </div>

                {report.employerNotes.length > 0 && (
                  <div
                    style={{
                      marginTop: 7,
                      padding: "7px 9px",
                      borderRadius: 10,
                      background: "rgba(3,105,161,0.07)",
                      border: "1px solid rgba(3,105,161,0.13)",
                      fontSize: 12,
                      color: CONSOLE_BLUE,
                      lineHeight: 1.45,
                    }}
                  >
                    Employer: {report.employerNotes[report.employerNotes.length - 1].content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: "16px 14px",
            borderRadius: 16,
            background: "rgba(248,250,252,0.92)",
            border: "1px solid rgba(148,163,184,0.15)",
            textAlign: "center",
            color: MUTED,
            fontSize: 12.5,
            fontWeight: 750,
            lineHeight: 1.45,
          }}
        >
          No issues reported yet. Reporting is currently read-only.
        </div>
      )}
    </div>
  );
}
