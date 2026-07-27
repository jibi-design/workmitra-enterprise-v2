// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerCompletedRecordsPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerCompletedRecordsPage.tsx

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import {
  employmentLifecycleStorage,
  type EmploymentRecord,
} from "../../employment/storage/employmentLifecycle.storage";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "var(--wm-career-text, #111827)";
const CAREER_MUTED = "var(--wm-career-muted, #64748b)";

function getHistorySnapshot(): string {
  return JSON.stringify(employmentLifecycleStorage.getVerifiedHistory());
}

function parseHistorySnapshot(raw: string): EmploymentRecord[] {
  try {
    const parsed = JSON.parse(raw) as EmploymentRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return "Date not available";

  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Date not available";
  }
}

function getExitLabel(record: EmploymentRecord): string {
  if (record.exitReason === "resigned") return "Resigned";
  if (record.exitReason === "terminated") return "Ended";
  if (record.exitReason === "layoff") return "Layoff";
  if (record.exitReason === "contract_end") return "Contract ended";
  if (record.exitReason === "mutual_agreement") return "Mutual closure";
  return "Completed";
}

function getRecordPath(recordId: string): string {
  return ROUTE_PATHS.employeeEmploymentDetail.replace(":employmentId", recordId);
}

export function EmployeeCareerCompletedRecordsPage() {
  const nav = useNavigate();

  const raw = useSyncExternalStore(
    employmentLifecycleStorage.subscribe,
    getHistorySnapshot,
    getHistorySnapshot,
  );

  const records = useMemo(() => parseHistorySnapshot(raw), [raw]);

  return (
    <div className="wm-ee-vCareer wm-stackGrid" style={{ paddingBottom: 30 }}>
      <DomainHero
        variant="career"
        audience="employee"
        eyebrow="Career Records"
        title="Completed Career Records"
        subtitle="Closed jobs, feedback, and work diary history"
        description="View closed Career jobs, feedback, work diary history, and saved reports from one protected record hub."
      />

      {records.length === 0 ? (
        <section
          className="wm-ee-card"
          style={{
            textAlign: "center",
            padding: 26,
            border: "1px solid rgba(148,163,184,0.18)",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 950, color: CAREER_TEXT }}>
            No completed records yet
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: CAREER_MUTED, lineHeight: 1.5 }}>
            Closed Career work records will appear here after employment is completed or exited.
          </div>
        </section>
      ) : (
        <section className="wm-stackGrid">
          {records.map((record) => (
            <button
              key={record.id}
              type="button"
              onClick={() => nav(getRecordPath(record.id))}
              style={{
                width: "100%",
                padding: 15,
                borderRadius: "var(--wm-radius-employee-card)",
                border: "1px solid rgba(29,78,216,0.14)",
                background:
                  "radial-gradient(circle at 95% 10%, rgba(29,78,216,0.07), transparent 30%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
                boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ fontSize: 15, fontWeight: 950, color: CAREER_TEXT, lineHeight: 1.25 }}
                  >
                    {record.jobTitle}
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 12,
                      color: CAREER_MUTED,
                      lineHeight: 1.45,
                      fontWeight: 720,
                    }}
                  >
                    {record.companyName}
                    {record.department ? ` · ${record.department}` : ""}
                  </div>
                </div>

                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 10,
                    fontWeight: 950,
                    padding: "5px 9px",
                    borderRadius: "var(--wm-radius-pill)",
                    color: CAREER_BLUE,
                    background: "rgba(29,78,216,0.08)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getExitLabel(record)}
                </span>
              </div>

              <div
                style={{
                  marginTop: 11,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    padding: "7px 10px",
                    borderRadius: "var(--wm-radius-button)",
                    background: "rgba(29,78,216,0.065)",
                    color: CAREER_BLUE,
                    fontSize: 10.8,
                    fontWeight: 900,
                  }}
                >
                  View full record
                </div>

                <div
                  style={{
                    padding: "8px 10px",
                    borderRadius: "var(--wm-radius-chip)",
                    background: "rgba(15,23,42,0.035)",
                    color: CAREER_MUTED,
                    fontSize: 10.4,
                    fontWeight: 780,
                    textAlign: "right",
                    opacity: 0.88,
                  }}
                >
                  Closed: {formatDate(record.exitedAt)}
                </div>
              </div>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
