// App name: Job Mitra
// File name: careerPostApplyStyles.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerPostApplyStyles.ts

export const PREMIUM_APPLY_STYLES = `
  .wm-apply-widget {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-apply-input {
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
  }
  .wm-apply-input:focus {
    border-color: var(--wm-career-accent) !important;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12) !important;
    background-color: var(--wm-career-bg, #ffffff) !important;
  }
  .wm-apply-btn {
    transition: transform 0.2s var(--wm-motion-spring), box-shadow 0.2s ease, opacity 0.2s ease !important;
  }
  .wm-apply-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 24px -4px rgba(37, 99, 235, 0.2) !important;
  }
  .wm-apply-btn:active:not(:disabled) {
    transform: scale(0.97) !important;
  }
  .wm-notice-btn {
    transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease !important;
  }
  .wm-notice-btn:hover {
    transform: translateY(-1px) !important;
  }
  .wm-notice-btn:active {
    transform: scale(0.96) !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .wm-apply-widget,
    .wm-apply-input,
    .wm-apply-btn,
    .wm-notice-btn {
      transition: none !important;
    }
    .wm-apply-btn:hover:not(:disabled),
    .wm-apply-btn:active:not(:disabled),
    .wm-notice-btn:hover,
    .wm-notice-btn:active {
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;
