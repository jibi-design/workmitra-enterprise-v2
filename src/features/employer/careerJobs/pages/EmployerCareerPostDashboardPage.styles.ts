export const PREMIUM_INTERACTIONS = `
  .wm-premium-widget {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-premium-widget:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 24px 40px -12px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
  .wm-premium-widget:active {
    transform: scale(0.98) !important;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05) !important;
    transition: transform var(--wm-motion-fast) var(--wm-motion-spring), box-shadow var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-stat-box {
    transition: all 0.3s var(--wm-motion-spring);
  }
  .wm-stat-box:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.95) !important;
    border-color: rgba(37, 99, 235, 0.3) !important;
    box-shadow: 0 12px 24px -6px rgba(37,99,235,0.15) !important;
  }
`;

export function formatPostedNoticePeriod(days?: number): string {
  if (!days || days <= 0) return "No notice period";
  return `${days} day${days === 1 ? "" : "s"}`;
}

export const EMPLOYMENT_TERMS_SECTION_STYLE = {
  padding: 24,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
  position: "relative" as const,
  overflow: "hidden" as const,
};

export const STAT_BOX_STYLE = {
  padding: "20px",
  borderRadius: "var(--wm-radius-employee-card)",
  background: "rgba(248,250,252,0.6)",
  border: "1px solid rgba(0,0,0,0.04)",
  position: "relative" as const,
};
