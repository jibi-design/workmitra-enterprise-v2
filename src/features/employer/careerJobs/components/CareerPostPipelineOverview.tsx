// App name: Job Mitra
// File name: CareerPostPipelineOverview.tsx

import type { CareerJobPost } from "../types/careerTypes";
import type { CareerTab } from "./CareerPipelineTabs";
import {
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  getNextActionText,
  getNextActionTitle,
  OVERVIEW_INTERACTIONS,
} from "./CareerPostPipelineOverview.helpers";
import { HealthBox, StageBox } from "./CareerPostPipelineOverview.parts";

type CareerPostPipelineOverviewProps = {
  post: CareerJobPost;
  closingText: string;
  tabCounts: Record<CareerTab, number>;
};

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
    <div className="wm-stackGrid">
      <style>{OVERVIEW_INTERACTIONS}</style>

      <section
        className="wm-overview-card"
        style={{
          padding: 28,
          borderRadius: "var(--wm-radius-employer-card)",
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
                borderRadius: "var(--wm-radius-button)",
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
              borderRadius: "var(--wm-radius-chip)",
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
          borderRadius: "var(--wm-radius-employee-card)",
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
            borderRadius: "var(--wm-radius-button)",
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
