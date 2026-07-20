// App name: Job Mitra
// File name: CurrentEmploymentListCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\CurrentEmploymentListCard.tsx

import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";

type CurrentEmploymentListCardProps = {
  record: EmploymentRecord;
  isPrimary: boolean;
  onSetPrimary: (employmentId: string) => void;
};

const TEXT = "var(--wm-emp-text, var(--wm-er-text, #1e293b))";
const MUTED = "var(--wm-emp-muted, var(--wm-er-muted, #64748b))";
const BLUE = "var(--wm-er-accent-console, #0369a1)";
const GREEN = "#15803d";

function getStatusLabel(status: EmploymentRecord["status"]): string {
  if (status === "joining_pending") return "Joining Pending";
  if (status === "probation") return "Probation";
  if (status === "resignation_pending") return "Resignation Pending";
  if (status === "notice_period") return "Notice Period";
  return "Currently Working";
}

export function CurrentEmploymentListCard({
  record,
  isPrimary,
  onSetPrimary,
}: CurrentEmploymentListCardProps) {
  return (
    <article
      className="wm-ee-card"
      style={{
        position: "relative",
        overflow: "hidden",
        border: isPrimary ? "1.5px solid rgba(3,105,161,0.52)" : "1px solid rgba(3,105,161,0.12)",
        background: isPrimary
          ? "linear-gradient(135deg, rgba(225,245,255,1), rgba(248,253,255,1) 58%, rgba(255,255,255,1))"
          : "#ffffff",
        boxShadow: isPrimary
          ? "0 16px 34px rgba(3,105,161,0.13)"
          : "0 8px 18px rgba(15,23,42,0.045)",
      }}
    >
      {isPrimary && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 5,
            background: "linear-gradient(180deg, #0369a1, #0ea5e9)",
          }}
        />
      )}

      <div style={{ display: "grid", gap: 10, paddingLeft: isPrimary ? 6 : 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            {isPrimary && (
              <div
                style={{
                  display: "inline-flex",
                  marginBottom: 7,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "rgba(3,105,161,0.12)",
                  color: BLUE,
                  fontSize: 10.5,
                  fontWeight: 950,
                }}
              >
                Shown on Home
              </div>
            )}

            <div style={{ fontSize: 14.5, fontWeight: 950, color: TEXT }}>{record.jobTitle}</div>

            <div
              style={{
                fontSize: 12.5,
                color: MUTED,
                marginTop: 4,
                fontWeight: isPrimary ? 750 : 500,
              }}
            >
              {record.companyName}
            </div>

            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4 }}>
              {record.location || record.department}
            </div>
          </div>

          {isPrimary && (
            <span
              style={{
                flexShrink: 0,
                padding: "7px 11px",
                borderRadius: 999,
                background: BLUE,
                color: "#ffffff",
                fontSize: 10.5,
                fontWeight: 950,
                whiteSpace: "nowrap",
                boxShadow: "0 8px 18px rgba(3,105,161,0.2)",
              }}
            >
              Primary
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <span
            style={{
              padding: "5px 9px",
              borderRadius: 999,
              background: isPrimary ? "rgba(3,105,161,0.11)" : "rgba(3,105,161,0.07)",
              color: BLUE,
              fontSize: 10.5,
              fontWeight: 850,
            }}
          >
            {getStatusLabel(record.status)}
          </span>

          {record.verified && (
            <span
              style={{
                padding: "5px 9px",
                borderRadius: 999,
                background: "rgba(22,163,74,0.1)",
                color: GREEN,
                fontSize: 10.5,
                fontWeight: 850,
              }}
            >
              Verified
            </span>
          )}
        </div>

        {!isPrimary && (
          <button
            type="button"
            onClick={() => onSetPrimary(record.id)}
            style={{
              minHeight: 36,
              borderRadius: 12,
              border: "1px solid rgba(3,105,161,0.18)",
              background: "rgba(3,105,161,0.07)",
              color: BLUE,
              fontSize: 12,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Set as Primary
          </button>
        )}
      </div>
    </article>
  );
}
