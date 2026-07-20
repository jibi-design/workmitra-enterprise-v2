// App name: Job Mitra
// File name: EmployeeCareerJobCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\EmployeeCareerJobCard.tsx

import { getCareerDiscoveryLabels } from "../helpers/careerDiscoveryHelpers";
import { fmtExperience, fmtNoticePeriod, fmtSalaryRange } from "../helpers/careerSearchHelpers";
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

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#475569";

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

  return (
    <article
      style={{
        width: "100%",
        padding: isMini ? "14px" : 20,
        borderRadius: isMini ? 20 : 24,
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.7))",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        gap: isMini ? 10 : 14,
        position: "relative",
        transition: "transform 0.1s ease",
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
        <div style={{ minWidth: 0 }}>
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
              fontSize: isMini ? 14.5 : 17,
              fontWeight: 800,
              color: CAREER_TEXT,
              lineHeight: 1.25,
            }}
          >
            {formatDisplayTitle(post.jobTitle)}
          </h3>

          <p
            style={{
              margin: "6px 0 0 0",
              fontSize: isMini ? 12 : 13,
              color: CAREER_MUTED,
              fontWeight: 500,
            }}
          >
            {post.companyName}
            {post.location ? ` • ${post.location}` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSaved(post.id);
          }}
          aria-label={isSaved ? "Unsave job" : "Save job"}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 6,
            borderRadius: "50%",
            color: isSaved ? CAREER_BLUE : "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            rowGap: 8,
            fontSize: 12.5,
            color: CAREER_MUTED,
            fontWeight: 600,
          }}
        >
          <MetaItem label={experience} icon="briefcase" />
          <MetaItem label={salary} icon="pay" />
          <MetaItem label={`Notice period: ${noticePeriod}`} icon="time" />
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: isMini ? 2 : 6,
          paddingTop: isMini ? 0 : 16,
          borderTop: isMini ? "none" : "1px solid rgba(15, 23, 42, 0.06)",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
          {!isMini && closingText ? `Closes ${closingText}` : ""}
        </span>

        <button
          type="button"
          onClick={() => (hasAppliedStatus ? onOpenApplications() : onOpen(post.id))}
          style={{
            padding: isMini ? "8px 14px" : "10px 18px",
            borderRadius: 14,
            background: hasAppliedStatus ? "rgba(22, 163, 74, 0.08)" : "rgba(37, 99, 235, 0.08)",
            color: hasAppliedStatus ? "#16a34a" : CAREER_BLUE,
            border: hasAppliedStatus
              ? "1px solid rgba(22, 163, 74, 0.15)"
              : "1px solid rgba(37, 99, 235, 0.12)",
            fontSize: isMini ? 12 : 13,
            fontWeight: 800,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s ease",
          }}
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
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        background: active ? "rgba(37, 99, 235, 0.08)" : "rgba(15, 23, 42, 0.04)",
        color: active ? CAREER_BLUE : CAREER_MUTED,
        fontSize: 10.5,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: 0.3,
      }}
    >
      {label}
    </span>
  );
}

function MetaItem({ label, icon }: { label: string; icon: "briefcase" | "pay" | "time" }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {icon === "briefcase" && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )}

      {icon === "pay" && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M7 9h.01M17 15h.01" />
        </svg>
      )}

      {icon === "time" && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )}

      {label}
    </span>
  );
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
