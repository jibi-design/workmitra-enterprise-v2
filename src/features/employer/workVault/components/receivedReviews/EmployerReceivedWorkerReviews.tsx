// App name: Job Mitra
// File name: EmployerReceivedWorkerReviews.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\receivedReviews\EmployerReceivedWorkerReviews.tsx

import type { WorkerToEmployerRating } from "../../../../../shared/rating/ratingTypes";
import type { ShiftWorkspace } from "../../../shiftJobs/types/shiftWorkspaceTypes";
import {
  buildEmployerWorkerReviewRecords,
  buildEmployerWorkerReviewSummary,
} from "../../helpers/employerVaultReviewHelpers";
import { EmployerWorkerReviewCard } from "./EmployerWorkerReviewCard";
import { EmployerWorkerReviewSummary } from "./EmployerWorkerReviewSummary";

type EmployerReceivedWorkerReviewsProps = {
  reviews: WorkerToEmployerRating[];
  workspaces: ShiftWorkspace[];
  onOpenWorkspace?: (workspaceId: string) => void;
  showSummary?: boolean;
};

export function EmployerReceivedWorkerReviews({
  reviews,
  workspaces,
  onOpenWorkspace,
  showSummary = true,
}: EmployerReceivedWorkerReviewsProps) {
  const records = buildEmployerWorkerReviewRecords(reviews, workspaces);
  const summary = buildEmployerWorkerReviewSummary(records);

  return (
    <section style={{ display: "grid", gap: 12 }}>
      {showSummary && <EmployerWorkerReviewSummary summary={summary} />}

      {records.length === 0 ? (
        <div
          style={{
            padding: "22px 16px",
            borderRadius: 20,
            textAlign: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
            border: "1px solid rgba(226,232,240,0.9)",
            boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
            No worker reviews yet
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            Worker reviews will appear here after completed shift work. Reviews are linked to
            completed work records only.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {records.map((record) => (
            <EmployerWorkerReviewCard
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
