export const RESIGN_ERROR = "var(--wm-error, #dc2626)";
export const RESIGN_TEXT = "var(--wm-text-primary, #111827)";
export const RESIGN_MUTED = "var(--wm-text-muted, #64748b)";
export const RESIGN_BORDER = "var(--wm-border, #e2e8f0)";
export const RESIGN_CARD = "var(--wm-bg-card, #ffffff)";
export const RESIGN_WARNING = "#b45309";
export const MAX_RESIGN_NOTES_LENGTH = 240;

export function formatResignDateLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
