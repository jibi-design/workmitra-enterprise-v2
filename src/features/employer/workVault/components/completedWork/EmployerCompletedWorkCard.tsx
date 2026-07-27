// App name: Job Mitra
// File name: EmployerCompletedWorkCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\completedWork\EmployerCompletedWorkCard.tsx

import type { EmployerCompletedWorkRecord } from "../../types/employerVaultReview.types";
import { formatEmployerVaultDate } from "../../helpers/employerVaultReviewHelpers";

type EmployerCompletedWorkCardProps = {
  record: EmployerCompletedWorkRecord;
  onOpenWorkspace?: (workspaceId: string) => void;
};

const SHIFT_GREEN = "#16a34a";

export function EmployerCompletedWorkCard({
  record,
  onOpenWorkspace,
}: EmployerCompletedWorkCardProps) {
  return (
    <article
      style={{
        padding: 15,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(22,163,74,0.17)",
        borderLeft: `5px solid ${SHIFT_GREEN}`,
        background:
          "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98) 54%, rgba(240,253,244,0.58))",
        boxShadow: "0 16px 36px rgba(15,23,42,0.075)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{ fontSize: 15, fontWeight: 950, color: "var(--wm-er-text)", lineHeight: 1.25 }}
          >
            {record.title}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 12,
              color: "var(--wm-er-muted)",
              lineHeight: 1.45,
              fontWeight: 750,
            }}
          >
            {record.subtitle} · {record.dateRange}
          </div>
        </div>

        <span
          style={{
            padding: "6px 9px",
            borderRadius: "var(--wm-radius-pill)",
            background: "rgba(22,163,74,0.09)",
            border: "1px solid rgba(22,163,74,0.17)",
            color: SHIFT_GREEN,
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          Completed
        </span>
      </div>

      <div
        style={{
          marginTop: 11,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        <MiniStatus label="Updates" value={String(record.updateCount)} />
        <MiniStatus
          label="Rated"
          value={record.hasEmployerRating ? "Yes" : "Pending"}
          strong={record.hasEmployerRating}
        />
        <MiniStatus
          label="Worker review"
          value={record.hasWorkerReview ? "Received" : "Not yet"}
          strong={record.hasWorkerReview}
        />
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 850,
            color: "var(--wm-er-muted)",
            whiteSpace: "nowrap",
          }}
        >
          Last activity: {formatEmployerVaultDate(record.lastActivityAt)}
        </div>

        {onOpenWorkspace && (
          <button
            type="button"
            onClick={() => onOpenWorkspace(record.id)}
            style={{
              minHeight: 32,
              padding: "7px 11px",
              borderRadius: "var(--wm-radius-pill)",
              border: "1px solid rgba(22,163,74,0.16)",
              background: "rgba(22,163,74,0.08)",
              color: SHIFT_GREEN,
              fontSize: 12,
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            Open work group
          </button>
        )}
      </div>
    </article>
  );
}

function MiniStatus({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 8px",
        borderRadius: "var(--wm-radius-chip)",
        background: strong ? "rgba(22,163,74,0.08)" : "rgba(248,250,252,0.96)",
        border: strong ? "1px solid rgba(22,163,74,0.14)" : "1px solid rgba(226,232,240,0.9)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          fontWeight: 950,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.25,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          fontWeight: 950,
          color: strong ? SHIFT_GREEN : "var(--wm-er-text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}
