// App name: Job Mitra
// File name: EmployeeCareerJobCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\EmployeeCareerJobCard.tsx

import { getCareerDiscoveryLabels } from "../helpers/careerDiscoveryHelpers";
import {
  fmtExperience,
  fmtJobType,
  fmtNoticePeriod,
  fmtSalaryRange,
} from "../helpers/careerSearchHelpers";
import type {
  CareerSearchApplicationState,
  CareerSearchPost,
} from "../helpers/careerSearchHelpers";

type EmployeeCareerJobCardProps = {
  post: CareerSearchPost;
  isSaved: boolean;
  applicationStatus?: CareerSearchApplicationState;
  variant?: "standard" | "mini";
  onOpen: (id: string) => void;
  onOpenApplications: () => void;
  onToggleSaved: (id: string) => void;
};

const CAREER_TEXT = "var(--wm-career-text, #0f172a)";
const CAREER_MUTED = "var(--wm-career-muted, #64748b)";

export function EmployeeCareerJobCard({
  post,
  isSaved,
  applicationStatus,
  variant = "standard",
  onOpen,
  onOpenApplications,
  onToggleSaved,
}: EmployeeCareerJobCardProps) {
  const salary = compactSalary(fmtSalaryRange(post.salaryMin, post.salaryMax, post.salaryPeriod));
  const experience = fmtExperience(post.experienceMin, post.experienceMax);
  const noticePeriod = fmtNoticePeriod(post.noticePeriodDays);
  const closingText = formatClosingDate(post.closingDate);
  const hasAppliedStatus = Boolean(applicationStatus);
  const labels = getCareerDiscoveryLabels({ post, isSaved, applicationStatus });
  const isMini = variant === "mini";
  const jobType = fmtJobType(post.jobType);

  return (
    <article
      className="wm-career-card wm-press-card"
      aria-label={`${formatDisplayTitle(post.jobTitle)} at ${post.companyName}`}
      style={{
        padding: isMini ? 14 : 16,
        display: "flex",
        flexDirection: "column",
        gap: isMini ? 10 : 12,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, minWidth: 0, flex: 1 }}>
          <div className="wm-career-logo" aria-hidden="true">
            {companyInitials(post.companyName)}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            {!isMini && labels.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                {labels.map((label) => (
                  <StatusPill
                    key={label}
                    label={label}
                    active={label === "Applied" || label === "Saved"}
                  />
                ))}
              </div>
            )}

            <h3
              style={{
                margin: 0,
                fontSize: isMini ? 14.5 : 16,
                fontWeight: 700,
                color: CAREER_TEXT,
                lineHeight: 1.25,
              }}
            >
              {formatDisplayTitle(post.jobTitle)}
            </h3>

            <p
              style={{
                margin: "6px 0 0 0",
                fontSize: 13,
                color: CAREER_MUTED,
                fontWeight: 500,
              }}
            >
              {post.companyName}
              {post.location ? ` • ${post.location}` : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="wm-career-tap"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSaved(post.id);
          }}
          aria-label={isSaved ? "Unsave job" : "Save job"}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 10,
            borderRadius: "50%",
            color: isSaved ? "var(--wm-career-accent)" : "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width={isMini ? "22" : "24"}
            height={isMini ? "22" : "24"}
            viewBox="0 0 24 24"
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        </button>
      </div>

      {!isMini && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span className="wm-career-pill wm-career-pill--pay">{salary}</span>
          {jobType ? (
            <span className="wm-career-pill wm-career-pill--outline">{jobType}</span>
          ) : null}
          <span style={{ fontSize: 12, color: CAREER_MUTED, fontWeight: 600 }}>{experience}</span>
          <span style={{ fontSize: 12, color: CAREER_MUTED, fontWeight: 600 }}>
            Notice: {noticePeriod}
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: isMini ? "row" : "column",
          justifyContent: "space-between",
          alignItems: isMini ? "center" : "stretch",
          marginTop: isMini ? 2 : 4,
          paddingTop: isMini ? 0 : 12,
          borderTop: isMini ? "none" : "1px solid rgba(29, 78, 216, 0.08)",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 12, color: CAREER_MUTED, fontWeight: 600 }}>
          {!isMini && closingText ? `Closes ${closingText}` : ""}
        </span>

        <button
          type="button"
          className="wm-career-cta"
          onClick={() => (hasAppliedStatus ? onOpenApplications() : onOpen(post.id))}
          style={{
            width: isMini ? "auto" : "100%",
            background: hasAppliedStatus
              ? "var(--wm-career-success-soft)"
              : "var(--wm-career-accent-soft)",
            color: hasAppliedStatus ? "var(--wm-career-success-strong)" : "var(--wm-career-accent)",
            border: hasAppliedStatus
              ? "1px solid var(--wm-career-success-border)"
              : "1px solid var(--wm-career-accent-border)",
          }}
          aria-label={
            hasAppliedStatus
              ? `View application for ${formatDisplayTitle(post.jobTitle)}`
              : `View details for ${formatDisplayTitle(post.jobTitle)}`
          }
        >
          {hasAppliedStatus ? "View Application" : "View Details"}
        </button>
      </div>
    </article>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`wm-career-pill${active ? " wm-career-pill--pay" : " wm-career-pill--outline"}`}
      style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3 }}
    >
      {label}
    </span>
  );
}

function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function compactSalary(value: string): string {
  const cleanedValue = value.replace(/[$₹£€¥]/g, "").trim();
  return cleanedValue.replace(" (Monthly)", "/mo").replace(" (Annual)", "/yr");
}

function formatDisplayTitle(value: string): string {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatClosingDate(value: number): string {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}
