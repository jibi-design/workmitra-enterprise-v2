// App name: Job Mitra
// File name: EmployerGivenWorkerRatings.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\givenReviews\EmployerGivenWorkerRatings.tsx

import type { EmployerToWorkerRating } from "../../../../../shared/rating/ratingTypes";
import type { ShiftWorkspace } from "../../../shiftJobs/types/shiftWorkspaceTypes";
import {
  buildEmployerGivenWorkerRatingRecords,
  buildEmployerGivenWorkerRatingSummary,
} from "../../helpers/employerVaultReviewHelpers";
import { EmployerGivenWorkerRatingCard } from "./EmployerGivenWorkerRatingCard";
import { EmployerGivenWorkerRatingSummary } from "./EmployerGivenWorkerRatingSummary";

type EmployerGivenWorkerRatingsProps = {
  ratings: EmployerToWorkerRating[];
  workspaces: ShiftWorkspace[];
  onOpenWorkspace?: (workspaceId: string) => void;
};

export function EmployerGivenWorkerRatings({
  ratings,
  workspaces,
  onOpenWorkspace,
}: EmployerGivenWorkerRatingsProps) {
  const records = buildEmployerGivenWorkerRatingRecords(ratings, workspaces);
  const summary = buildEmployerGivenWorkerRatingSummary(records);

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <EmployerGivenWorkerRatingSummary summary={summary} />

      {records.length === 0 ? (
        <div
          style={{
            padding: "24px 16px",
            borderRadius: "var(--wm-radius-employee-card)",
            textAlign: "center",
            background:
              "radial-gradient(circle at top, rgba(22,163,74,0.08), transparent 32%), linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
            border: "1px solid rgba(22,163,74,0.13)",
            boxShadow: "0 12px 28px rgba(15,23,42,0.045)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              padding: "5px 10px",
              borderRadius: "var(--wm-radius-pill)",
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.14)",
              color: "#16a34a",
              fontSize: 10,
              fontWeight: 950,
              textTransform: "uppercase",
              letterSpacing: 0.35,
            }}
          >
            Pending history
          </div>

          <div style={{ marginTop: 10, fontSize: 15, fontWeight: 950, color: "var(--wm-er-text)" }}>
            No worker ratings given yet
          </div>

          <div
            style={{
              marginTop: 7,
              fontSize: 12,
              color: "var(--wm-er-muted)",
              lineHeight: 1.5,
              fontWeight: 700,
            }}
          >
            Ratings you give after completed work will appear here as permanent local trust records.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {records.map((record) => (
            <EmployerGivenWorkerRatingCard
              key={record.id}
              record={record}
              onOpenWorkspace={onOpenWorkspace}
            />
          ))}
        </div>
      )}
    </section>
  );
}
