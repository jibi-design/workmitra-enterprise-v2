import type { CareerJobPost } from "../types/careerTypes";
import type { CareerTab } from "./CareerPipelineTabs";

export const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
export const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export const OVERVIEW_INTERACTIONS = `
  .wm-overview-card {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-overview-card:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
  .wm-stat-box {
    transition: all 0.3s var(--wm-motion-spring);
  }
  .wm-stat-box:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px -6px rgba(37,99,235,0.15) !important;
    border-color: rgba(37,99,235,0.3) !important;
  }
  .wm-health-box {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring);
  }
  .wm-health-box:hover {
    background: #ffffff !important;
    border-color: rgba(0,0,0,0.1) !important;
    box-shadow: 0 8px 16px rgba(0,0,0,0.04) !important;
  }
  
  .wm-pipeline-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
    gap: 10px;
    margin-top: 20px;
  }
  .wm-pipeline-health-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    margin-top: 20px;
  }
  
  @media (max-width: 640px) {
    .wm-pipeline-stats-grid,
    .wm-pipeline-health-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export function getNextActionTitle(
  post: CareerJobPost,
  tabCounts: Record<CareerTab, number>,
): string {
  if (tabCounts.applied > 0)
    return `${tabCounts.applied} candidate${tabCounts.applied === 1 ? "" : "s"} needs review`;
  if (tabCounts.shortlisted > 0) return "Shortlisted candidates need interview planning";
  if (tabCounts.interview > 0) return "Interview candidates need result updates";
  if (tabCounts.offered > 0) return "Offers sent, waiting for final hiring";
  if (tabCounts.hired > 0) return "Hiring completed for selected candidates";
  if (post.status === "active") return "Post is live and ready for applicants";
  return "Post is not currently active";
}

export function getNextActionText(
  post: CareerJobPost,
  tabCounts: Record<CareerTab, number>,
): string {
  if (tabCounts.applied > 0)
    return "Run local analysis for remaining applied candidates, then manually confirm shortlist, backup, reject, or interview actions.";
  if (tabCounts.shortlisted > 0)
    return "Schedule interview rounds for shortlisted candidates and keep the pipeline moving.";
  if (tabCounts.interview > 0)
    return "Record interview results so candidates can move forward to offer or rejection.";
  if (tabCounts.offered > 0)
    return "Review offered candidates and mark hired only after the hiring decision is final.";
  if (tabCounts.hired > 0)
    return "Hired candidate workspaces will appear in the Career workspace area for follow-up.";
  if (post.status === "active")
    return "Applicants will appear here after they submit. Keep the job details accurate and avoid closing the post early.";
  return "Resume or repost this Career Job when you are ready to receive applicants again.";
}
