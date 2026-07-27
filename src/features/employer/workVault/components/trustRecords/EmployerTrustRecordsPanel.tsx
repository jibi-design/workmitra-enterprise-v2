// App name: Job Mitra
// File name: EmployerTrustRecordsPanel.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\trustRecords\EmployerTrustRecordsPanel.tsx

import type { ReactNode } from "react";
import type {
  EmployerToWorkerRating,
  WorkerToEmployerRating,
} from "../../../../../shared/rating/ratingTypes";
import type { ShiftWorkspace } from "../../../shiftJobs/types/shiftWorkspaceTypes";
import {
  buildEmployerWorkerReviewRecords,
  buildEmployerWorkerReviewSummary,
} from "../../helpers/employerVaultReviewHelpers";
import { EmployerCompletedWorkHistory } from "../completedWork/EmployerCompletedWorkHistory";
import { EmployerGivenWorkerRatings } from "../givenReviews/EmployerGivenWorkerRatings";
import { EmployerReceivedWorkerReviews } from "../receivedReviews/EmployerReceivedWorkerReviews";
import { EmployerWorkerReviewSummary } from "../receivedReviews/EmployerWorkerReviewSummary";

type EmployerTrustRecordsPanelProps = {
  reviews: WorkerToEmployerRating[];
  workerRatings: EmployerToWorkerRating[];
  workspaces: ShiftWorkspace[];
  onOpenWorkspace?: (workspaceId: string) => void;
};

type TrustSectionFrameProps = {
  title: string;
  subtitle: string;
  badge: string;
  defaultOpen: boolean;
  children: ReactNode;
};

const VAULT_PURPLE = "#7c3aed";
const SHIFT_GREEN = "#16a34a";

export function EmployerTrustRecordsPanel({
  reviews,
  workerRatings,
  workspaces,
  onOpenWorkspace,
}: EmployerTrustRecordsPanelProps) {
  const completedCount = workspaces.filter((workspace) => workspace.status === "completed").length;
  const receivedReviewCount = reviews.filter((review) => review.domain === "shift").length;
  const givenRatingCount = workerRatings.filter((rating) => rating.domain === "shift").length;

  const reviewRecords = buildEmployerWorkerReviewRecords(reviews, workspaces);
  const reviewSummary = buildEmployerWorkerReviewSummary(reviewRecords);

  return (
    <section style={{ marginTop: 14, display: "grid", gap: 14 }}>
      <div
        style={{
          padding: "20px 17px",
          borderRadius: "var(--wm-radius-employer-card)",
          border: "1px solid rgba(124,58,237,0.2)",
          background:
            "radial-gradient(circle at top left, rgba(124,58,237,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(22,163,74,0.1), transparent 30%), linear-gradient(135deg, rgba(245,243,255,0.94), rgba(255,255,255,0.99) 48%, rgba(240,253,244,0.68))",
          boxShadow: "0 20px 46px rgba(15,23,42,0.09)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "5px 9px",
            borderRadius: "var(--wm-radius-pill)",
            background: "rgba(124,58,237,0.09)",
            border: "1px solid rgba(124,58,237,0.14)",
            color: VAULT_PURPLE,
            fontSize: 10,
            fontWeight: 950,
            textTransform: "uppercase",
            letterSpacing: 0.45,
          }}
        >
          Permanent local trust vault
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 20,
            fontWeight: 950,
            color: "var(--wm-er-text)",
            lineHeight: 1.15,
          }}
        >
          Employer Trust Records
        </div>

        <div
          style={{
            marginTop: 7,
            fontSize: 12,
            color: "var(--wm-er-muted)",
            lineHeight: 1.55,
            fontWeight: 750,
          }}
        >
          Track completed shift history, worker feedback, ratings given, and local trust signals.
        </div>

        <div
          style={{
            marginTop: 13,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8,
          }}
        >
          <HeroStat label="Completed" value={String(completedCount)} accent={SHIFT_GREEN} />
          <HeroStat label="Reviews" value={String(receivedReviewCount)} accent={VAULT_PURPLE} />
          <HeroStat label="Given" value={String(givenRatingCount)} accent={SHIFT_GREEN} />
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "10px 11px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(226,232,240,0.9)",
            fontSize: 11,
            fontWeight: 800,
            color: "var(--wm-er-muted)",
            lineHeight: 1.55,
          }}
        >
          <div>Reviews are linked to completed work records.</div>
          <div style={{ marginTop: 3 }}>One worker review per completed work record.</div>
          <div style={{ marginTop: 3 }}>
            Phase-0 local record only. No official verification, ID validation, or background
            checking.
          </div>
        </div>
      </div>

      <EmployerWorkerReviewSummary summary={reviewSummary} />

      <TrustSectionFrame
        title="Completed Work History"
        subtitle="Completed shift groups and review status."
        badge={`${completedCount} completed`}
        defaultOpen
      >
        <EmployerCompletedWorkHistory
          workspaces={workspaces}
          workerReviews={reviews}
          workerRatings={workerRatings}
          onOpenWorkspace={onOpenWorkspace}
          compactTitle
        />
      </TrustSectionFrame>

      <TrustSectionFrame
        title="Reviews from Workers"
        subtitle="Feedback workers gave after completed work."
        badge={`${receivedReviewCount} received`}
        defaultOpen={receivedReviewCount > 0}
      >
        <EmployerReceivedWorkerReviews
          reviews={reviews}
          workspaces={workspaces}
          onOpenWorkspace={onOpenWorkspace}
          showSummary={false}
        />
      </TrustSectionFrame>

      <TrustSectionFrame
        title="Ratings Given to Workers"
        subtitle="Ratings and feedback you gave to workers."
        badge={`${givenRatingCount} given`}
        defaultOpen
      >
        <EmployerGivenWorkerRatings
          ratings={workerRatings}
          workspaces={workspaces}
          onOpenWorkspace={onOpenWorkspace}
        />
      </TrustSectionFrame>
    </section>
  );
}

function HeroStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        padding: "10px 9px",
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(226,232,240,0.9)",
        minWidth: 0,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.82)",
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          fontWeight: 950,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.28,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>

      <div style={{ marginTop: 5, fontSize: 17, fontWeight: 950, color: accent, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

function TrustSectionFrame({
  title,
  subtitle,
  badge,
  defaultOpen,
  children,
}: TrustSectionFrameProps) {
  return (
    <details
      open={defaultOpen}
      style={{
        borderRadius: "var(--wm-radius-employer-card)",
        border: "1px solid rgba(226,232,240,0.92)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
        boxShadow: "0 14px 32px rgba(15,23,42,0.055)",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          padding: "14px 15px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "flex-start",
          gap: 12,
          borderBottom: "1px solid rgba(226,232,240,0.74)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)", lineHeight: 1.3 }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              fontWeight: 750,
              color: "var(--wm-er-muted)",
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </div>
        </div>

        <span
          style={{
            padding: "5px 9px",
            borderRadius: "var(--wm-radius-pill)",
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.14)",
            color: VAULT_PURPLE,
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {badge}
        </span>
      </summary>

      <div style={{ padding: 12 }}>{children}</div>
    </details>
  );
}
