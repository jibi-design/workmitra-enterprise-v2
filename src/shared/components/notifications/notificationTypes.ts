// src/shared/components/notifications/notificationTypes.ts
//
// Shared types and domain style constants for notification pages.
// Used by both Employer and Employee notification systems.

/* ------------------------------------------------ */
/* Domain Style Type                                */
/* ------------------------------------------------ */
export type NotificationDomainStyle = {
  color: string;
  bgTint: string;    // 0.05 opacity — card unread bg
  bgBadge: string;   // 0.1 opacity — badge pill bg
  bgTab: string;     // 0.06 opacity — inactive tab bg
  label: string;
};

/* ------------------------------------------------ */
/* Employer Domain Styles                           */
/* ------------------------------------------------ */
export const EMPLOYER_DOMAINS: Record<string, NotificationDomainStyle> = {
  hr:        { color: "#7c3aed", bgTint: "rgba(124,58,237,0.05)", bgBadge: "rgba(124,58,237,0.1)", bgTab: "rgba(124,58,237,0.06)", label: "HR" },
  console:   { color: "#0369a1", bgTint: "rgba(3,105,161,0.05)",  bgBadge: "rgba(3,105,161,0.1)",  bgTab: "rgba(3,105,161,0.06)",  label: "Console" },
  shift:     { color: "#16a34a", bgTint: "rgba(22,163,74,0.05)",  bgBadge: "rgba(22,163,74,0.1)",  bgTab: "rgba(22,163,74,0.06)",  label: "Shift" },
  career:    { color: "#1d4ed8", bgTint: "rgba(29,78,216,0.05)",  bgBadge: "rgba(29,78,216,0.1)",  bgTab: "rgba(29,78,216,0.06)",  label: "Career" },
  workforce: { color: "#b45309", bgTint: "rgba(180,83,9,0.05)",   bgBadge: "rgba(180,83,9,0.1)",   bgTab: "rgba(180,83,9,0.06)",   label: "Workforce" },
};

/* ------------------------------------------------ */
/* Employee Domain Styles                           */
/* ------------------------------------------------ */
export const EMPLOYEE_DOMAINS: Record<string, NotificationDomainStyle> = {
  shift:      { color: "#16a34a", bgTint: "rgba(22,163,74,0.05)",  bgBadge: "rgba(22,163,74,0.1)",  bgTab: "rgba(22,163,74,0.06)",  label: "Shift" },
  career:     { color: "#1d4ed8", bgTint: "rgba(29,78,216,0.05)",  bgBadge: "rgba(29,78,216,0.1)",  bgTab: "rgba(29,78,216,0.06)",  label: "Career" },
  workforce:  { color: "#b45309", bgTint: "rgba(180,83,9,0.05)",   bgBadge: "rgba(180,83,9,0.1)",   bgTab: "rgba(180,83,9,0.06)",   label: "Workforce" },
  employment: { color: "#7c3aed", bgTint: "rgba(124,58,237,0.05)", bgBadge: "rgba(124,58,237,0.1)", bgTab: "rgba(124,58,237,0.06)", label: "Employment" },
};

/* ------------------------------------------------ */
/* Tab Definition                                   */
/* ------------------------------------------------ */
export type NotificationTab = {
  key: string;
  label: string;
};

export const EMPLOYER_TABS: NotificationTab[] = [
  { key: "all", label: "All" },
  { key: "hr", label: "HR" },
  { key: "console", label: "Console" },
  { key: "shift", label: "Shift" },
  { key: "career", label: "Career" },
  { key: "workforce", label: "Workforce" },
];

export const EMPLOYEE_TABS: NotificationTab[] = [
  { key: "all", label: "All" },
  { key: "shift", label: "Shift" },
  { key: "career", label: "Career" },
  { key: "workforce", label: "Workforce" },
  { key: "employment", label: "Employment" },
];

/* ------------------------------------------------ */
/* Shared Constants                                 */
/* ------------------------------------------------ */
export const NOTIFICATION_CYAN = "#0891b2";
export const BELL_CIRCLE_BG = "#e0f7fa";
export const TAB_ACTIVE_BG = "#1e293b";
export const TAB_ZERO_BORDER = "#e2e8f0";
export const TAB_ZERO_TEXT = "#94a3b8";
export const TEXT_SECONDARY = "#64748b";
export const TEXT_TERTIARY = "#94a3b8";
export const SUCCESS_GREEN = "#16a34a";