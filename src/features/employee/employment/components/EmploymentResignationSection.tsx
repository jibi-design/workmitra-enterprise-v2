// src/features/employee/employment/components/EmploymentResignationSection.tsx
//
// Resignation pending/notice period info + important notice + resign button.

import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { formatDate } from "../helpers/employmentDetailHelpers";

function IconWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
    </svg>
  );
}

type Props = {
  record: EmploymentRecord;
  onResign: () => void;
};

export function EmploymentResignationSection({ record, onResign }: Props) {
  const canResign = record.status === "active" || record.status === "probation";

  return (
    <>
      {/* Resignation pending */}
      {record.status === "resignation_pending" && (
        <div className="wm-ee-card" style={{ borderLeft: "4px solid #d97706" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#d97706", fontWeight: 900, fontSize: 14, marginBottom: 8 }}>
            <IconWarning /> Resignation Submitted
          </div>
          {record.resignationNote && (
            <div style={{ fontSize: 12, color: "var(--wm-emp-text, var(--wm-er-text))", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>Your note: </span>{record.resignationNote}
            </div>
          )}
          {record.preferredLastDate && (
            <div style={{ fontSize: 12, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>
              Preferred last date: <span style={{ fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))" }}>{formatDate(record.preferredLastDate)}</span>
            </div>
          )}
          <div style={{ fontSize: 11, color: "#d97706", marginTop: 10, fontWeight: 700 }}>Waiting for employer to accept your resignation.</div>
        </div>
      )}

      {/* Notice period */}
      {record.status === "notice_period" && (
        <div className="wm-ee-card" style={{ borderLeft: "4px solid #d97706" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#d97706", fontWeight: 900, fontSize: 14 }}>
            <IconWarning /> Notice Period Active
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 8 }}>
            Your employer has accepted your resignation. Complete any pending handover and wait for exit processing.
          </div>
        </div>
      )}

      {/* Important notice */}
      {canResign && (
        <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)", borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#2563eb", marginBottom: 4 }}>Important</div>
          <div style={{ fontSize: 11, color: "var(--wm-emp-text, var(--wm-er-text))", lineHeight: 1.6 }}>
            When you leave this job, your employer must complete the exit process. Only then will your verified work history be updated automatically.
          </div>
        </div>
      )}

      {/* Resign button */}
      {canResign && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onResign}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1.5px solid #dc2626",
              background: "rgba(220,38,38,0.04)",
              color: "#dc2626",
              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            Submit Resignation
          </button>
        </div>
      )}
    </>
  );
}