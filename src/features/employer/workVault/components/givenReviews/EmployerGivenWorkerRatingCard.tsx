// App name: Job Mitra
// File name: EmployerGivenWorkerRatingCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\givenReviews\EmployerGivenWorkerRatingCard.tsx

import { EditedBadge } from "../../../../../shared/components/rating/EditedBadge";
import { formatEmployerVaultDate } from "../../helpers/employerVaultReviewHelpers";
import type { EmployerGivenWorkerRatingRecord } from "../../types/employerVaultReview.types";

type EmployerGivenWorkerRatingCardProps = {
  record: EmployerGivenWorkerRatingRecord;
  onOpenWorkspace?: (workspaceId: string) => void;
};

const SHIFT_GREEN = "#16a34a";

export function EmployerGivenWorkerRatingCard({
  record,
  onOpenWorkspace,
}: EmployerGivenWorkerRatingCardProps) {
  return (
    <article
      style={{
        padding: 15,
        borderRadius: 22,
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
            {record.subtitle}
          </div>

          <div
            style={{
              marginTop: 7,
              display: "inline-flex",
              maxWidth: "100%",
              padding: "5px 8px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.035)",
              border: "1px solid rgba(148,163,184,0.18)",
              fontSize: 10.5,
              color: "var(--wm-er-muted)",
              fontWeight: 850,
              fontFamily: "monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Worker Code: {record.workerWmId}
          </div>
        </div>

        <span
          style={{
            minWidth: 48,
            padding: "8px 9px",
            borderRadius: 16,
            background: "rgba(22,163,74,0.09)",
            border: "1px solid rgba(22,163,74,0.17)",
            color: SHIFT_GREEN,
            fontSize: 14,
            fontWeight: 950,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {record.stars}/5
        </span>
      </div>

      {record.tags.length > 0 && (
        <div style={{ marginTop: 11, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {record.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                background: "rgba(22,163,74,0.08)",
                border: "1px solid rgba(22,163,74,0.14)",
                color: SHIFT_GREEN,
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {record.comment && (
        <div
          style={{
            marginTop: 11,
            padding: "10px 11px",
            borderRadius: 15,
            background: "rgba(248,250,252,0.96)",
            border: "1px solid rgba(226,232,240,0.9)",
            fontSize: 12,
            fontWeight: 750,
            color: "var(--wm-er-muted)",
            lineHeight: 1.5,
          }}
        >
          {record.comment}
        </div>
      )}

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
        <div style={{ fontSize: 11, fontWeight: 850, color: "var(--wm-er-muted)" }}>
          Hire again: {record.hireAgain ? "Yes" : "No"} ·{" "}
          {formatEmployerVaultDate(record.createdAt)}
          <EditedBadge editedAt={record.source.editedAt} />
        </div>

        {record.workspaceId && onOpenWorkspace && (
          <button
            type="button"
            onClick={() => onOpenWorkspace(record.workspaceId as string)}
            style={{
              minHeight: 32,
              padding: "7px 11px",
              borderRadius: 999,
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
