import type { CSSProperties } from "react";
import type { CareerJobPost } from "../types/careerTypes";

export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
export const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export const HEADER_INTERACTIONS = `
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

  .wm-hero-card {
    padding: var(--wm-space-32);
    border-radius: var(--wm-radius-employer-card);
  }
  .wm-hero-flex {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--wm-stack-gap);
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
    margin-top: var(--wm-space-24);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--wm-stack-gap);
  }
  @media (max-width: 580px) {
    .wm-hero-card {
      padding: var(--wm-space-20) !important;
      border-radius: var(--wm-radius-employer-card) !important;
    }
    .wm-hero-flex {
      flex-direction: column;
      gap: var(--wm-stack-gap);
    }
    .wm-hero-title {
      font-size: 18px !important;
      margin-top: 10px !important;
    }
    .wm-hero-actions {
      grid-template-columns: 1fr !important;
      margin-top: var(--wm-space-20) !important;
      gap: var(--wm-space-12) !important;
    }
    .wm-info-pill-container {
      gap: var(--wm-space-8) !important;
    }
  }
`;

export function formatDisplayTitle(value: string): string {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function formatJobType(value: CareerJobPost["jobType"]): string {
  if (value === "full-time") return "Full-time";
  if (value === "part-time") return "Part-time";
  return "Contract";
}

export function formatWorkMode(value: CareerJobPost["workMode"]): string {
  if (value === "on-site") return "On-site";
  if (value === "remote") return "Remote";
  return "Hybrid";
}

export function formatSalary(post: CareerJobPost): string {
  const period = post.salaryPeriod === "yearly" ? "Annual" : "Monthly";
  if (post.salaryMin <= 0 && post.salaryMax <= 0) return `Salary not specified (${period})`;
  const max = post.salaryMax > 0 ? post.salaryMax : post.salaryMin;
  if (post.salaryMin === max) return `${post.salaryMin.toLocaleString()} (${period})`;
  return `${post.salaryMin.toLocaleString()} - ${max.toLocaleString()} (${period})`;
}

export function formatStatusLabel(status: CareerJobPost["status"]): string {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  if (status === "closed") return "Closed";
  if (status === "filled") return "Filled";
  return "Draft";
}

export function getStatusStyle(status: CareerJobPost["status"]) {
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

export const HERO_SECTION_STYLE: CSSProperties = {
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8))",
  boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
  overflow: "hidden",
  position: "relative",
};
