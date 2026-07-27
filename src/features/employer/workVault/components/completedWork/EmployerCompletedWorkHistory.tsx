// App name: Job Mitra
// File name: EmployerCompletedWorkHistory.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\completedWork\EmployerCompletedWorkHistory.tsx

import type {
  EmployerToWorkerRating,
  WorkerToEmployerRating,
} from "../../../../../shared/rating/ratingTypes";
import type { ShiftWorkspace } from "../../../shiftJobs/types/shiftWorkspaceTypes";
import {
  buildEmployerCompletedWorkRecords,
  buildEmployerCompletedWorkSummary,
} from "../../helpers/employerVaultReviewHelpers";
import { EmployerCompletedWorkCard } from "./EmployerCompletedWorkCard";
import { EmployerCompletedWorkSummary } from "./EmployerCompletedWorkSummary";

type EmployerCompletedWorkHistoryProps = {
  workspaces: ShiftWorkspace[];
  workerReviews: WorkerToEmployerRating[];
  workerRatings: EmployerToWorkerRating[];
  onOpenWorkspace?: (workspaceId: string) => void;
  compactTitle?: boolean;
};

export function EmployerCompletedWorkHistory({
  workspaces,
  workerReviews,
  workerRatings,
  onOpenWorkspace,
  compactTitle = false,
}: EmployerCompletedWorkHistoryProps) {
  const records = buildEmployerCompletedWorkRecords(workspaces, workerReviews, workerRatings);
  const summary = buildEmployerCompletedWorkSummary(records);

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <EmployerCompletedWorkSummary summary={summary} compactTitle={compactTitle} />

      {records.length === 0 ? (
        <div
          style={{
            padding: "22px 16px",
            borderRadius: "var(--wm-radius-employee-card)",
            textAlign: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
            border: "1px solid rgba(226,232,240,0.9)",
            boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
            No completed work yet
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            Completed shift groups will appear here after work is closed.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {records.map((record) => (
            <EmployerCompletedWorkCard
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
