// App name: Job Mitra
// File name: EmploymentResignationSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\EmploymentResignationSection.tsx

import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { formatDate } from "../helpers/employmentDetailHelpers";

const TEXT = "var(--wm-emp-text, var(--wm-er-text, #1e293b))";
const MUTED = "var(--wm-emp-muted, var(--wm-er-muted, #64748b))";

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
      {record.status === "resignation_pending" && (
        <div className="wm-ee-card" style={{ borderLeft: "4px solid #d97706" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#d97706",
              fontWeight: 950,
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            <IconWarning /> Resignation Submitted
          </div>

          {record.resignationNote && (
            <div style={{ fontSize: 12, color: TEXT, marginBottom: 6, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 800, color: MUTED }}>Your note: </span>
              {record.resignationNote}
            </div>
          )}

          {record.preferredLastDate && (
            <div style={{ fontSize: 12, color: MUTED }}>
              Preferred last date:{" "}
              <span style={{ fontWeight: 850, color: TEXT }}>
                {formatDate(record.preferredLastDate)}
              </span>
            </div>
          )}

          <div style={{ fontSize: 11.5, color: "#d97706", marginTop: 10, fontWeight: 850 }}>
            Waiting for employer to accept your resignation.
          </div>
        </div>
      )}

      {record.status === "notice_period" && (
        <div className="wm-ee-card" style={{ borderLeft: "4px solid #d97706" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#d97706",
              fontWeight: 950,
              fontSize: 14,
            }}
          >
            <IconWarning /> Notice Period Active
          </div>

          <div style={{ fontSize: 12, color: MUTED, marginTop: 8, lineHeight: 1.55 }}>
            Your employer has accepted your resignation. Complete any pending handover and wait for
            exit processing.
          </div>
        </div>
      )}

      {canResign && (
        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background:
              "radial-gradient(circle at 100% 0%, rgba(220,38,38,0.045), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
            border: "1px solid rgba(220,38,38,0.12)",
            boxShadow: "0 10px 22px rgba(15,23,42,0.045)",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 12.5, color: "#1e40af", marginBottom: 5 }}>
            Important
          </div>

          <div style={{ fontSize: 11.5, color: TEXT, lineHeight: 1.6 }}>
            When you leave this job, your employer must complete the exit process. Only then will
            your verified work history be updated automatically.
          </div>

          <button
            type="button"
            onClick={onResign}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "11px 18px",
              borderRadius: 13,
              border: "1.5px solid rgba(220,38,38,0.34)",
              background: "rgba(220,38,38,0.055)",
              color: "#dc2626",
              fontWeight: 950,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            Submit Resignation
          </button>
        </div>
      )}
    </>
  );
}
