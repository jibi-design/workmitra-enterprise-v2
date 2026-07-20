// App name: Job Mitra
// File name: CareerPostDashboardHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerPostDashboardHeader.tsx

import type { CareerJobPost } from "../types/careerTypes";

type CareerPostDashboardHeaderProps = {
  post: CareerJobPost;
  onAllPosts: () => void;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
  onRepost: () => void;
};

const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

const HEADER_INTERACTIONS = `
  .wm-header-btn {
    transition: all 0.3s var(--wm-motion-spring) !important;
  }
  .wm-header-btn:hover {
    transform: translateY(-2px) !important;
  }
  .wm-header-btn:active {
    transform: scale(0.96) !important;
  }
  
  @keyframes activePulse {
    0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
    70% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
  }
  .wm-badge-pulse {
    animation: activePulse 2s infinite;
  }

  /* Mobile Responsive Styles */
  .wm-hero-card {
    padding: 32px;
    border-radius: 32px;
  }
  .wm-hero-flex {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .wm-hero-title {
    margin-top: 14px;
    font-size: 20px;
    font-weight: 900;
    color: ${CAREER_TEXT};
    line-height: 1.3;
    letter-spacing: -0.3px;
  }
  .wm-hero-actions {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 580px) {
    .wm-hero-card {
      padding: 20px !important;
      border-radius: 24px !important;
    }
    .wm-hero-flex {
      flex-direction: column;
      gap: 16px;
    }
    .wm-hero-title {
      font-size: 18px !important;
      margin-top: 10px !important;
    }
    .wm-hero-actions {
      grid-template-columns: 1fr !important;
      margin-top: 20px !important;
      gap: 12px !important;
    }
    .wm-info-pill-container {
      gap: 8px !important;
    }
  }
`;

function formatDisplayTitle(value: string): string {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatJobType(value: CareerJobPost["jobType"]): string {
  if (value === "full-time") return "Full-time";
  if (value === "part-time") return "Part-time";
  return "Contract";
}

function formatWorkMode(value: CareerJobPost["workMode"]): string {
  if (value === "on-site") return "On-site";
  if (value === "remote") return "Remote";
  return "Hybrid";
}

function formatSalary(post: CareerJobPost): string {
  const period = post.salaryPeriod === "yearly" ? "Annual" : "Monthly";
  if (post.salaryMin <= 0 && post.salaryMax <= 0) return `Salary not specified (${period})`;
  const max = post.salaryMax > 0 ? post.salaryMax : post.salaryMin;
  if (post.salaryMin === max) return `${post.salaryMin.toLocaleString()} (${period})`;
  return `${post.salaryMin.toLocaleString()} - ${max.toLocaleString()} (${period})`;
}

function formatStatusLabel(status: CareerJobPost["status"]): string {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  if (status === "closed") return "Closed";
  if (status === "filled") return "Filled";
  return "Draft";
}

function getStatusStyle(status: CareerJobPost["status"]) {
  if (status === "active")
    return {
      background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(29,78,216,0.15))",
      color: "#1d4ed8",
      border: "1px solid rgba(37,99,235,0.25)",
      ring: "wm-badge-pulse",
    };
  if (status === "paused")
    return {
      background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.15))",
      color: "#b45309",
      border: "1px solid rgba(245,158,11,0.25)",
      ring: "",
    };
  if (status === "closed" || status === "filled")
    return {
      background: "linear-gradient(135deg, rgba(148,163,184,0.1), rgba(100,116,139,0.15))",
      color: "#475569",
      border: "1px solid rgba(148,163,184,0.25)",
      ring: "",
    };
  return {
    background: "rgba(248,250,252,0.9)",
    color: CAREER_MUTED,
    border: "1px solid rgba(148,163,184,0.2)",
    ring: "",
  };
}

export function CareerPostDashboardHeader({
  post,
  onPause,
  onResume,
  onClose,
  onRepost,
}: CareerPostDashboardHeaderProps) {
  const statusStyle = getStatusStyle(post.status);
  const workSummary = `${formatJobType(post.jobType)} / ${formatWorkMode(post.workMode)}`;
  const locationSummary = [post.companyName, post.department, post.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      className="wm-premium-widget wm-hero-card"
      style={{
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8))",
        boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(24px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{HEADER_INTERACTIONS}</style>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            post.status === "active"
              ? "linear-gradient(90deg, #3b82f6, #1d4ed8)"
              : "rgba(148,163,184,0.2)",
        }}
      />

      <div className="wm-hero-flex">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 12,
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.12)",
                color: CAREER_BLUE_DEEP,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              Employer Career
            </span>
            <span
              className={statusStyle.ring}
              style={{
                padding: "6px 14px",
                borderRadius: 12,
                background: statusStyle.background,
                border: statusStyle.border,
                color: statusStyle.color,
                fontSize: 11,
                fontWeight: 900,
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {formatStatusLabel(post.status)}
            </span>
          </div>

          <div className="wm-hero-title">{formatDisplayTitle(post.jobTitle)}</div>

          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              fontWeight: 700,
              color: CAREER_MUTED,
              lineHeight: 1.5,
            }}
          >
            {locationSummary}
          </div>

          <div
            className="wm-info-pill-container"
            style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            <InfoPill icon="💼" label={workSummary} />
            <InfoPill icon="💰" label={formatSalary(post)} />
          </div>
        </div>
      </div>

      <div className="wm-hero-actions">
        {post.status === "active" && (
          <CommandButton label="Pause Applications" variant="neutral" onClick={onPause} />
        )}
        {post.status === "paused" && (
          <CommandButton label="Resume Receiving" variant="primary" onClick={onResume} />
        )}
        {(post.status === "closed" || post.status === "filled") && (
          <CommandButton label="Create Similar Job" variant="primary" onClick={onRepost} />
        )}
        {post.status !== "closed" && post.status !== "filled" && (
          <CommandButton label="Close Job Post" variant="danger" onClick={onClose} />
        )}
      </div>
    </section>
  );
}

function InfoPill({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      style={{
        padding: "8px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(0,0,0,0.06)",
        color: CAREER_TEXT,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.2,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span> {label}
    </span>
  );
}

function CommandButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: "primary" | "neutral" | "danger";
  onClick: () => void;
}) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";

  return (
    <button
      type="button"
      onClick={onClick}
      className="wm-header-btn"
      style={{
        minHeight: 48,
        borderRadius: 16,
        border: isPrimary
          ? "none"
          : isDanger
            ? "1px solid rgba(220,38,38,0.25)"
            : "1px solid rgba(148,163,184,0.3)",
        background: isPrimary
          ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
          : isDanger
            ? "linear-gradient(135deg, rgba(254,242,242,0.9), rgba(255,255,255,0.9))"
            : "linear-gradient(135deg, rgba(248,250,252,0.9), rgba(255,255,255,0.9))",
        color: isPrimary ? "#fff" : isDanger ? "#dc2626" : CAREER_TEXT,
        fontSize: 13,
        fontWeight: 900,
        cursor: "pointer",
        boxShadow: isPrimary ? "0 8px 20px rgba(37,99,235,0.2)" : "0 4px 12px rgba(0,0,0,0.03)",
      }}
    >
      {label}
    </button>
  );
}
