/** Job Mitra | i18nConfig.ts | src/shared/i18n/i18nConfig.ts */

/**
 * ARCHITECTURE NOTE:
 * Basic structure for multi-language support.
 * Prevents hardcoded strings in components, making the app scalable globally.
 */

export const LABELS = {
  common: {
    back: "Back",
    save: "Save Changes",
    cancel: "Cancel",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Couldn't load this. Try again.",
    noData: "Nothing here yet",
  },
  auth: {
    welcome: "Welcome back",
    signIn: "Sign in",
    selectRole: "Choose your role",
  },
  employer: {
    dashboard: "Hiring snapshot",
    hiring: "Hiring",
    activeStaff: "People at work",
  },
  employee: {
    home: "My Workspace",
    findShifts: "Find Shifts",
    vault: "My Work Vault",
  },
} as const;

// Helper to access labels (can be expanded to dynamic hook later)
export type AppLabels = typeof LABELS;
export const useLabels = () => LABELS;
