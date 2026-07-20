// App name: Job Mitra
// File name: CareerPostPipelineOverview.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerPostPipelineOverview.tsx

import type { CareerJobPost } from "../types/careerTypes";
import type { CareerTab } from "./CareerPipelineTabs";

type CareerPostPipelineOverviewProps = {
  post: CareerJobPost;
  closingText: string;
  tabCounts: Record<CareerTab, number>;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

const OVERVIEW_INTERACTIONS = `
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
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
    margin-top: 20px;
  }
  .wm-pipeline-health-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 20px;
  }
  
  @media (max-width: 640px) {
    .wm-pipeline-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .wm-pipeline-health-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export function CareerPostPipelineOverview({
  post,
  closingText,
  tabCounts,
}: CareerPostPipelineOverviewProps) {
  const appliedCount = tabCounts.applied;
  const shortlistedCount = tabCounts.shortlisted;
  const interviewCount = tabCounts.interview;
  const offeredCount = tabCounts.offered;
  const hiredCount = tabCounts.hired;

  const activePipelineCount =
    appliedCount + shortlistedCount + interviewCount + offeredCount + hiredCount;

  const stats = [
    { label: "Applied", count: appliedCount },
    { label: "Shortlist", count: shortlistedCount },
    { label: "Interview", count: interviewCount },
    { label: "Offered", count: offeredCount },
    { label: "Hired", count: hiredCount },
  ] as const;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <style>{OVERVIEW_INTERACTIONS}</style>

      <section
        className="wm-overview-card"
        style={{
          padding: 28,
          borderRadius: 28,
          border: "1px solid rgba(255, 255, 255, 0.9)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8))",
          boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 12px",
                borderRadius: 12,
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.12)",
                color: CAREER_BLUE_DEEP,
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 10,
              }}
            >
              Overview
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: CAREER_TEXT,
                lineHeight: 1.2,
                letterSpacing: "-0.3px",
              }}
            >
              Pipeline Analytics
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                fontWeight: 700,
                color: CAREER_MUTED,
                lineHeight: 1.5,
              }}
            >
              Monitor candidate movement from application review to final hire.
            </div>
          </div>

          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 16,
              background: post.status === "active" ? "rgba(37,99,235,0.08)" : "rgba(15,23,42,0.06)",
              border:
                post.status === "active"
                  ? "1px solid rgba(37,99,235,0.15)"
                  : "1px solid rgba(148,163,184,0.15)",
              color: post.status === "active" ? "#2563eb" : CAREER_MUTED,
              fontSize: 11,
              fontWeight: 900,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {post.status === "active" ? (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#2563eb",
                  display: "inline-block",
                  animation: "pulseDot 2s infinite",
                }}
              />
            ) : null}
            {post.status === "active" ? "Accepting Applications" : "Not Accepting"}
          </div>
        </div>

        <div className="wm-pipeline-stats-grid">
          {stats.map((stat) => (
            <StageBox key={stat.label} label={stat.label} count={stat.count} />
          ))}
        </div>

        <div className="wm-pipeline-health-grid">
          <HealthBox
            icon="👁️"
            label="Visibility"
            value={post.status === "active" ? "Live for applicants" : "Limited"}
            helper={post.status === "active" ? "Employee side visible" : "Not fully visible"}
          />
          <HealthBox
            icon="⏳"
            label="Pending Review"
            value={`${appliedCount} candidate${appliedCount === 1 ? "" : "s"}`}
            helper={appliedCount > 0 ? "Applied queue" : "No applied queue"}
          />
          <HealthBox
            icon="💬"
            label="Interviews"
            value={`${post.interviewRounds} round${post.interviewRounds === 1 ? "" : "s"}`}
            helper="Review setup"
          />
          <HealthBox
            icon="📅"
            label="Closing"
            value={post.closingDate > 0 ? closingText : "No closing date"}
            helper="Application deadline"
          />
        </div>
      </section>

      <div
        className="wm-overview-card"
        style={{
          padding: "16px 20px",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.9)",
          background:
            activePipelineCount > 0
              ? "linear-gradient(135deg, rgba(239,246,255,0.95), rgba(255,255,255,0.95))"
              : "linear-gradient(135deg, rgba(248,250,252,0.95), rgba(255,255,255,0.95))",
          boxShadow:
            activePipelineCount > 0
              ? "0 8px 20px -4px rgba(37, 99, 235, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)"
              : "0 8px 20px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
          backdropFilter: "blur(16px)",
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: activePipelineCount > 0 ? "rgba(37,99,235,0.1)" : "rgba(100,116,139,0.1)",
            color: activePipelineCount > 0 ? CAREER_BLUE : CAREER_MUTED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {activePipelineCount > 0 ? "⚡" : "⏸️"}
        </div>
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: activePipelineCount > 0 ? CAREER_BLUE_DEEP : CAREER_TEXT,
            }}
          >
            {getNextActionTitle(post, tabCounts)}
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 12,
              fontWeight: 700,
              color: CAREER_MUTED,
              lineHeight: 1.4,
            }}
          >
            {getNextActionText(post, tabCounts)}
          </div>
        </div>
      </div>
    </div>
  );
}

function StageBox({ label, count }: { label: string; count: number }) {
  const active = count > 0;

  return (
    <div
      className="wm-stat-box"
      style={{
        minWidth: 0,
        padding: "16px 10px",
        borderRadius: 16,
        textAlign: "center",
        background: active ? "#ffffff" : "rgba(248,250,252,0.6)",
        border: active ? "1px solid rgba(37,99,235,0.2)" : "1px solid rgba(0,0,0,0.04)",
        boxShadow: active ? "0 4px 12px rgba(37,99,235,0.06)" : "0 2px 6px rgba(0,0,0,0.02)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
          }}
        />
      )}
      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: active ? CAREER_BLUE : "rgba(15,23,42,0.3)",
          lineHeight: 1,
        }}
      >
        {count}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          fontWeight: 900,
          color: active ? CAREER_BLUE_DEEP : CAREER_MUTED,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function HealthBox({
  icon,
  label,
  value,
  helper,
}: {
  icon: string;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div
      className="wm-health-box"
      style={{
        minWidth: 0,
        padding: "14px 16px",
        borderRadius: 16,
        background: "rgba(248,250,252,0.8)",
        border: "1px solid rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 20, flexShrink: 0, opacity: 0.8 }}>{icon}</div>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: CAREER_MUTED,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 14,
            fontWeight: 900,
            color: CAREER_TEXT,
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 12,
            fontWeight: 700,
            color: CAREER_MUTED,
            lineHeight: 1.3,
          }}
        >
          {helper}
        </div>
      </div>
    </div>
  );
}

function getNextActionTitle(post: CareerJobPost, tabCounts: Record<CareerTab, number>): string {
  if (tabCounts.applied > 0)
    return `${tabCounts.applied} candidate${tabCounts.applied === 1 ? "" : "s"} needs review`;
  if (tabCounts.shortlisted > 0) return "Shortlisted candidates need interview planning";
  if (tabCounts.interview > 0) return "Interview candidates need result updates";
  if (tabCounts.offered > 0) return "Offers sent, waiting for final hiring";
  if (tabCounts.hired > 0) return "Hiring completed for selected candidates";
  if (post.status === "active") return "Post is live and ready for applicants";
  return "Post is not currently active";
}

function getNextActionText(post: CareerJobPost, tabCounts: Record<CareerTab, number>): string {
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
