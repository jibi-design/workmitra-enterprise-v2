// App name: Job Mitra
// File name: EmployerReceivedWorkerReviews.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\components\EmployerReceivedWorkerReviews.tsx

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { WorkerToEmployerRating } from "../../../../shared/rating/ratingTypes";
import type { ShiftWorkspace } from "../../../employer/shiftJobs/types/shiftWorkspaceTypes";
import { getReviewCenterTheme } from "../helpers/reviewCenter.helpers";

type EmployerReceivedWorkerReviewsProps = {
  reviews: WorkerToEmployerRating[];
  workspaces: ShiftWorkspace[];
};

export function EmployerReceivedWorkerReviews({
  reviews,
  workspaces,
}: EmployerReceivedWorkerReviewsProps) {
  const nav = useNavigate();

  if (reviews.length === 0) return null;

  const theme = getReviewCenterTheme("shift");

  return (
    <section style={{ marginTop: 12, display: "grid", gap: 12 }}>
      <div
        style={{
          padding: "11px 12px",
          borderRadius: 16,
          border: `1px solid ${theme.border}`,
          background: "linear-gradient(180deg, rgba(240,253,244,0.72), rgba(255,255,255,0.98))",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
          Reviews from Workers
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          Worker feedback received for completed shift work.
        </div>
      </div>

      {reviews.map((review) => {
        const workspace = workspaces.find((item) => item.postId === review.jobId);
        const title = workspace
          ? `${workspace.companyName} - ${workspace.jobName}`
          : `Shift ${review.jobId.slice(0, 8)}`;

        return (
          <article
            key={review.id}
            className="wm-reviewCard"
            style={{
              borderLeft: `3px solid ${theme.accent}`,
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
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--wm-er-text)",
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: "var(--wm-er-muted)" }}>
                  From worker: {review.workerMlId || "Worker"}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 2,
                    color: "#d97706",
                    fontSize: 28,
                    lineHeight: 1,
                  }}
                  aria-label={`${review.stars} of 5 stars`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ opacity: i < review.stars ? 1 : 0.25 }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <span
                style={{
                  padding: "5px 9px",
                  borderRadius: 999,
                  background: "rgba(217,119,6,0.12)",
                  border: "1px solid rgba(217,119,6,0.22)",
                  color: "#d97706",
                  fontSize: 11,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {review.stars}/5
              </span>
            </div>

            {review.tags.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "4px 9px",
                      borderRadius: 999,
                      background: "rgba(22,163,74,0.08)",
                      border: `1px solid ${theme.border}`,
                      color: theme.accent,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {review.comment && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  fontWeight: 400,
                  color: "var(--wm-er-muted)",
                  lineHeight: 1.45,
                }}
              >
                {review.comment}
              </div>
            )}

            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)" }}>
                Would work again: {review.workAgain ? "Yes" : "No"} · {formatDate(review.createdAt)}
              </div>

              {workspace && (
                <button
                  type="button"
                  onClick={() =>
                    nav(ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", workspace.id))
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    color: theme.accent,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    padding: 0,
                    minHeight: 44,
                  }}
                >
                  Open work group
                </button>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function formatDate(value: number): string {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Date not available";
  }
}
