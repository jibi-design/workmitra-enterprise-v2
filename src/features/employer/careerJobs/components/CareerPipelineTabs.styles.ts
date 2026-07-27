import type { CSSProperties } from "react";

export const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
export const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
export const CAREER_AMBER = "#d97706";
export const CAREER_AMBER_DEEP = "#92400e";

export const TAB_INTERACTIONS = `
  .wm-pipeline-btn {
    transition: all 0.3s var(--wm-motion-spring) !important;
  }
  .wm-pipeline-btn:hover {
    transform: translateX(4px) !important;
  }
  .wm-pipeline-btn:active {
    transform: scale(0.98) !important;
  }
  .wm-pipeline-btn:focus-visible {
    outline: var(--wm-focus-ring-width) solid var(--wm-focus-ring-career);
    outline-offset: var(--wm-focus-ring-offset);
  }

  @keyframes activePulseNode {
    0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.3); }
    70% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
  }
  .wm-node-pulse {
    animation: activePulseNode 2s infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .wm-pipeline-btn,
    .wm-pipeline-btn:hover,
    .wm-pipeline-btn:active {
      transition: none !important;
      transform: none !important;
    }
    .wm-node-pulse {
      animation: none !important;
    }
  }
`;

export const SECTION_STYLE: CSSProperties = {
  padding: 28,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8))",
  boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
};

export const EYEBROW_STYLE: CSSProperties = {
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
};

export const TITLE_STYLE: CSSProperties = {
  marginTop: 10,
  fontSize: 18,
  fontWeight: 900,
  color: CAREER_TEXT,
  lineHeight: 1.2,
  letterSpacing: "-0.3px",
};

export const SUBTITLE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 13,
  fontWeight: 700,
  color: CAREER_MUTED,
  lineHeight: 1.5,
};

export function getCardBorder(
  isActive: boolean,
  isBackup: boolean,
  hasCount: boolean,
  primary: boolean,
): string {
  if (isActive && isBackup) return "1px solid rgba(217,119,6,0.5)";
  if (isActive) return "1px solid rgba(37,99,235,0.5)";
  if (primary && hasCount && isBackup) return "1px solid rgba(217,119,6,0.25)";
  if (primary && hasCount) return "1px solid rgba(37,99,235,0.25)";
  return "1px solid rgba(0,0,0,0.06)";
}

export function getCardBackground(
  isActive: boolean,
  isBackup: boolean,
  hasCount: boolean,
  primary: boolean,
): string {
  if (isActive && isBackup)
    return "linear-gradient(135deg, rgba(254,243,199,0.95), rgba(255,255,255,1))";
  if (isActive) return "linear-gradient(135deg, rgba(239,246,255,0.95), rgba(255,255,255,1))";
  if (primary && hasCount && isBackup) return "rgba(255,251,235,0.9)";
  if (primary && hasCount) return "rgba(248,250,252,0.9)";
  return "rgba(255,255,255,0.7)";
}

export function getCardShadow(isActive: boolean, isBackup: boolean, primary: boolean): string {
  if (!isActive) return "0 4px 12px rgba(0,0,0,0.02)";
  if (isBackup)
    return primary ? "0 12px 24px rgba(217,119,6,0.1)" : "0 8px 16px rgba(217,119,6,0.08)";
  return primary ? "0 12px 24px rgba(37,99,235,0.1)" : "0 8px 16px rgba(37,99,235,0.08)";
}

export function getCountBackground(
  isActive: boolean,
  isBackup: boolean,
  hasCount: boolean,
): string {
  if (hasCount && isActive)
    return isBackup
      ? "linear-gradient(135deg, #d97706, #b45309)"
      : "linear-gradient(135deg, #2563eb, #1d4ed8)";
  if (hasCount && isBackup) return "rgba(217,119,6,0.15)";
  if (hasCount) return "rgba(37,99,235,0.15)";
  return "rgba(15,23,42,0.04)";
}

export function getCountColor(isActive: boolean, isBackup: boolean, hasCount: boolean): string {
  if (hasCount && isActive) return "#fff";
  if (hasCount && isBackup) return CAREER_AMBER_DEEP;
  if (hasCount) return CAREER_BLUE_DEEP;
  return "rgba(15,23,42,0.4)";
}

export function getCountBorder(isActive: boolean, isBackup: boolean, hasCount: boolean): string {
  if (hasCount && isActive) return "1px solid transparent";
  if (hasCount && isBackup) return "1px solid rgba(217,119,6,0.2)";
  if (hasCount) return "1px solid rgba(37,99,235,0.2)";
  return "1px solid rgba(0,0,0,0.04)";
}
