export const ANALYSIS_INTERACTIONS = `
  .wm-analysis-widget {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-analysis-widget:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
  .wm-analysis-btn {
    transition: transform 0.2s var(--wm-motion-spring), box-shadow 0.2s ease !important;
  }
  .wm-analysis-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
  }
  .wm-analysis-btn:active:not(:disabled) {
    transform: scale(0.97) !important;
  }
  .wm-close-btn {
    transition: background-color 0.2s ease, transform 0.2s ease;
  }
  .wm-close-btn:hover {
    background-color: rgba(15, 23, 42, 0.08);
  }
  .wm-close-btn:active {
    transform: scale(0.9);
  }
`;

export function getFinalizeLabel(shortlistCount: number, backupCount: number): string {
  if (shortlistCount > 0 && backupCount > 0) {
    return `Move ${shortlistCount} to Shortlist · Keep ${backupCount} as Backup`;
  }

  if (shortlistCount > 0) {
    return `Move ${shortlistCount} to Shortlist`;
  }

  if (backupCount > 0) {
    return `Keep ${backupCount} as Backup`;
  }

  return "No candidates selected";
}
