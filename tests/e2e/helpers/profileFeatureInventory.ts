/**
 * Job Mitra — Profile & Settings Feature Inventory (canonical checklist source)
 * Used by live-visual-profile-settings-micro-audit.spec.ts
 *
 * Domains: Employer | Employee | Shared
 * Scope: Profile setup/edit, preferences, security, notifications, danger/gaps.
 * Admin settings lightly skipped (out of primary scope).
 */

export type ProfileInventoryItem = {
  id: string;
  domain: "Employer" | "Employee" | "Shared";
  category:
    | "Profile"
    | "Settings"
    | "Security"
    | "Notifications"
    | "Danger"
    | "Documents"
    | "Preferences";
  name: string;
  route?: string;
  probe:
    | { type: "goto-testid"; path: string; testId: string }
    | {
        type: "goto-role";
        path: string;
        role: "button" | "link" | "heading" | "tab";
        name: string | RegExp;
      }
    | { type: "goto-text"; path: string; text: string | RegExp }
    | { type: "click-testid"; path: string; testId: string; afterTestId?: string }
    | {
        type: "click-role";
        path: string;
        role: "button" | "link" | "tab";
        name: string | RegExp;
        afterText?: string | RegExp;
      }
    | {
        type: "shell-logout";
        path: string;
        afterText?: string | RegExp;
      }
    | { type: "storage"; key: string; expectNonEmpty?: boolean }
    | { type: "skip"; reason: string };
  intent: "ui" | "demo" | "dev" | "flag";
};

export const PROFILE_FEATURE_INVENTORY: ProfileInventoryItem[] = [
  // —— Employee Profile ——
  {
    id: "EP-1",
    domain: "Employee",
    category: "Profile",
    name: "Profile hero surface",
    route: "/#/employee/profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/profile",
      text: /Your profile|Edit/i,
    },
    intent: "ui",
  },
  {
    id: "EP-2",
    domain: "Employee",
    category: "Profile",
    name: "Edit profile CTA",
    route: "/#/employee/profile",
    probe: {
      type: "goto-role",
      path: "/#/employee/profile",
      role: "button",
      name: /^Edit$/,
    },
    intent: "ui",
  },
  {
    id: "EP-3",
    domain: "Employee",
    category: "Profile",
    name: "Profile completion checklist",
    route: "/#/employee/profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/profile",
      text: /Profile Completion|Add full name|Verify phone/i,
    },
    intent: "ui",
  },
  {
    id: "EP-4",
    domain: "Employee",
    category: "Profile",
    name: "Worker identity card (Mitra ID)",
    route: "/#/employee/profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/profile",
      text: /Worker Identity Card|Worker ID|Mitra Labs/i,
    },
    intent: "ui",
  },
  {
    id: "EP-5",
    domain: "Employee",
    category: "Profile",
    name: "Copy Worker ID",
    route: "/#/employee/profile",
    probe: {
      type: "goto-role",
      path: "/#/employee/profile",
      role: "button",
      name: /Copy Worker ID/i,
    },
    intent: "ui",
  },
  {
    id: "EP-6",
    domain: "Employee",
    category: "Profile",
    name: "Share my profile",
    route: "/#/employee/profile",
    probe: {
      type: "goto-role",
      path: "/#/employee/profile",
      role: "button",
      name: /Share my profile/i,
    },
    intent: "ui",
  },
  {
    id: "EP-7",
    domain: "Employee",
    category: "Profile",
    name: "Currently employed badge",
    route: "/#/employee/profile",
    probe: {
      type: "skip",
      reason:
        "Conditional — only renders when active employment record exists; not always probeable",
    },
    intent: "flag",
  },
  {
    id: "EP-8",
    domain: "Employee",
    category: "Profile",
    name: "Basic profile section",
    route: "/#/employee/profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/profile",
      text: /Basic Profile|Full name|City/i,
    },
    intent: "ui",
  },
  {
    id: "EP-9",
    domain: "Employee",
    category: "Profile",
    name: "Profile photo upload",
    route: "/#/employee/profile",
    probe: {
      type: "click-role",
      path: "/#/employee/profile",
      role: "button",
      name: /^Edit$/,
      afterText: /Profile photo|Upload|Change/i,
    },
    intent: "ui",
  },
  {
    id: "EP-10",
    domain: "Employee",
    category: "Profile",
    name: "Contact & verification section",
    route: "/#/employee/profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/profile",
      text: /Contact & Verification|Phone|Email|Unverified/i,
    },
    intent: "ui",
  },
  {
    id: "EP-11",
    domain: "Employee",
    category: "Profile",
    name: "Work profile — skills",
    route: "/#/employee/profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/profile",
      text: /Work Profile|Skills|Experience level/i,
    },
    intent: "ui",
  },
  {
    id: "EP-12",
    domain: "Employee",
    category: "Profile",
    name: "Work profile — availability",
    route: "/#/employee/profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/profile",
      text: /Availability|Weekdays|Weekends|Morning|Afternoon|Evening/i,
    },
    intent: "ui",
  },
  {
    id: "EP-13",
    domain: "Employee",
    category: "Documents",
    name: "Career documents vault deep-link",
    route: "/#/employee/profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/profile",
      text: /Career Documents|Work Vault Documents/i,
    },
    intent: "ui",
  },
  {
    id: "EP-14",
    domain: "Employee",
    category: "Profile",
    name: "Save profile bar",
    route: "/#/employee/profile",
    probe: {
      type: "click-role",
      path: "/#/employee/profile",
      role: "button",
      name: /^Edit$/,
      afterText: /Save profile/i,
    },
    intent: "ui",
  },

  // —— Vault edit-profile ——
  {
    id: "VE-1",
    domain: "Employee",
    category: "Profile",
    name: "Edit Vault Profile hero",
    route: "/#/employee/vault/edit-profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/vault/edit-profile",
      text: /Edit Vault Profile|professional summary/i,
    },
    intent: "ui",
  },
  {
    id: "VE-2",
    domain: "Employee",
    category: "Profile",
    name: "Professional summary fields",
    route: "/#/employee/vault/edit-profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/vault/edit-profile",
      text: /Professional Summary|Headline|Employment status/i,
    },
    intent: "ui",
  },
  {
    id: "VE-3",
    domain: "Employee",
    category: "Documents",
    name: "Education & certifications",
    route: "/#/employee/vault/edit-profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/vault/edit-profile",
      text: /Education & Certifications|Education level/i,
    },
    intent: "ui",
  },
  {
    id: "VE-4",
    domain: "Employee",
    category: "Profile",
    name: "Skill proficiency levels",
    route: "/#/employee/vault/edit-profile",
    probe: {
      type: "goto-text",
      path: "/#/employee/vault/edit-profile",
      text: /Skill Proficiency Levels|Beginner|Intermediate|Expert/i,
    },
    intent: "ui",
  },
  {
    id: "VE-5",
    domain: "Employee",
    category: "Profile",
    name: "Save vault profile changes",
    route: "/#/employee/vault/edit-profile",
    probe: {
      type: "goto-role",
      path: "/#/employee/vault/edit-profile",
      role: "button",
      name: /Save Changes/i,
    },
    intent: "ui",
  },

  // —— Employee Settings ——
  {
    id: "ES-1",
    domain: "Employee",
    category: "Settings",
    name: "Pro / Advanced Settings hero",
    route: "/#/employee/settings",
    probe: {
      type: "goto-text",
      path: "/#/employee/settings",
      text: /Pro \/ Advanced Settings|Security, payout preferences/i,
    },
    intent: "ui",
  },
  {
    id: "ES-2",
    domain: "Employee",
    category: "Settings",
    name: "Settings tab — Account & Security",
    route: "/#/employee/settings",
    probe: {
      type: "goto-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Account & Security/i,
    },
    intent: "ui",
  },
  {
    id: "ES-3",
    domain: "Employee",
    category: "Security",
    name: "Signed-in identity snapshot",
    route: "/#/employee/settings",
    probe: {
      type: "goto-text",
      path: "/#/employee/settings",
      text: /Signed-in identity|Account & Security/i,
    },
    intent: "ui",
  },
  {
    id: "ES-4",
    domain: "Employee",
    category: "Security",
    name: "Change password form",
    route: "/#/employee/settings",
    probe: {
      type: "goto-role",
      path: "/#/employee/settings",
      role: "button",
      name: /Update password/i,
    },
    intent: "ui",
  },
  {
    id: "ES-5",
    domain: "Employee",
    category: "Security",
    name: "Two-factor authentication status",
    route: "/#/employee/settings",
    probe: {
      type: "goto-text",
      path: "/#/employee/settings",
      text: /Two-factor authentication|Not enabled/i,
    },
    intent: "ui",
  },
  {
    id: "ES-6",
    domain: "Employee",
    category: "Security",
    name: "Active sessions — Revoke others",
    route: "/#/employee/settings",
    probe: {
      type: "goto-role",
      path: "/#/employee/settings",
      role: "button",
      name: /Revoke others/i,
    },
    intent: "ui",
  },
  {
    id: "ES-7",
    domain: "Employee",
    category: "Settings",
    name: "Settings tab — Work & Payout",
    route: "/#/employee/settings",
    probe: {
      type: "goto-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Work & Payout/i,
    },
    intent: "ui",
  },
  {
    id: "ES-8",
    domain: "Employee",
    category: "Preferences",
    name: "Work search radius",
    route: "/#/employee/settings",
    probe: {
      type: "click-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Work & Payout/i,
      afterText: /Work search radius/i,
    },
    intent: "ui",
  },
  {
    id: "ES-9",
    domain: "Employee",
    category: "Preferences",
    name: "Preferred hourly min/max",
    route: "/#/employee/settings",
    probe: {
      type: "click-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Work & Payout/i,
      afterText: /Preferred hourly min|Preferred hourly max/i,
    },
    intent: "ui",
  },
  {
    id: "ES-10",
    domain: "Employee",
    category: "Preferences",
    name: "Instant payout rails status",
    route: "/#/employee/settings",
    probe: {
      type: "click-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Work & Payout/i,
      afterText: /Instant payout rails|Bank|UPI/i,
    },
    intent: "ui",
  },
  {
    id: "ES-11",
    domain: "Employee",
    category: "Settings",
    name: "Settings tab — Privacy & Compliance",
    route: "/#/employee/settings",
    probe: {
      type: "goto-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Privacy & Compliance/i,
    },
    intent: "ui",
  },
  {
    id: "ES-12",
    domain: "Employee",
    category: "Preferences",
    name: "Open to Work toggle",
    route: "/#/employee/settings",
    probe: {
      type: "click-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Privacy & Compliance/i,
      afterText: /Open to Work/i,
    },
    intent: "ui",
  },
  {
    id: "ES-13",
    domain: "Employee",
    category: "Documents",
    name: "Document visibility select",
    route: "/#/employee/settings",
    probe: {
      type: "click-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Privacy & Compliance/i,
      afterText: /Document visibility|Private \(vault only\)|Verified employers/i,
    },
    intent: "ui",
  },
  {
    id: "ES-14",
    domain: "Employee",
    category: "Settings",
    name: "Settings tab — Notifications",
    route: "/#/employee/settings",
    probe: {
      type: "goto-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Notifications/i,
    },
    intent: "ui",
  },
  {
    id: "ES-15",
    domain: "Employee",
    category: "Notifications",
    name: "Push notifications toggle",
    route: "/#/employee/settings",
    probe: {
      type: "click-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Notifications/i,
      afterText: /Push notifications/i,
    },
    intent: "ui",
  },
  {
    id: "ES-16",
    domain: "Employee",
    category: "Notifications",
    name: "Real-time shift alerts",
    route: "/#/employee/settings",
    probe: {
      type: "click-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Notifications/i,
      afterText: /Real-time shift alerts/i,
    },
    intent: "ui",
  },
  {
    id: "ES-17",
    domain: "Employee",
    category: "Notifications",
    name: "Escrow credit notifications",
    route: "/#/employee/settings",
    probe: {
      type: "click-role",
      path: "/#/employee/settings",
      role: "tab",
      name: /Notifications/i,
      afterText: /Escrow credit notifications/i,
    },
    intent: "ui",
  },
  {
    id: "ES-X1",
    domain: "Employee",
    category: "Preferences",
    name: "Theme / language / quick apply preferences",
    probe: {
      type: "skip",
      reason:
        "EmployeeSettingsPreferencesSection exists but not mounted on EmployeeSettingsPage (Module B)",
    },
    intent: "flag",
  },
  {
    id: "ES-X2",
    domain: "Employee",
    category: "Danger",
    name: "Logout / delete account in settings",
    probe: {
      type: "skip",
      reason:
        "EmployeeSettingsSecuritySection (logout/delete) not mounted — use shell AccountMenuSheet Log Out",
    },
    intent: "flag",
  },
  {
    id: "ES-X3",
    domain: "Employee",
    category: "Settings",
    name: "App version / about footer",
    probe: {
      type: "skip",
      reason: "EmployeeSettingsAboutSection not mounted on live settings page",
    },
    intent: "flag",
  },
  {
    id: "ES-X4",
    domain: "Employee",
    category: "Notifications",
    name: "Pulse navigation (employee legacy)",
    probe: {
      type: "skip",
      reason:
        "EmployeeSettingsNotificationsSection (pulse/quiet hours) not mounted — employer settings has Pulse Navigation",
    },
    intent: "flag",
  },

  // —— Employer Profile ——
  {
    id: "RP-1",
    domain: "Employer",
    category: "Profile",
    name: "Company profile hero",
    route: "/#/employer/profile",
    probe: {
      type: "goto-text",
      path: "/#/employer/profile",
      text: /Company profile|Industry|Edit/i,
    },
    intent: "ui",
  },
  {
    id: "RP-2",
    domain: "Employer",
    category: "Profile",
    name: "Edit company profile CTA",
    route: "/#/employer/profile",
    probe: {
      type: "goto-role",
      path: "/#/employer/profile",
      role: "button",
      name: /^Edit$/,
    },
    intent: "ui",
  },
  {
    id: "RP-3",
    domain: "Employer",
    category: "Profile",
    name: "Your personal account section",
    route: "/#/employer/profile",
    probe: {
      type: "goto-testid",
      path: "/#/employer/profile",
      testId: "employer-your-account-section",
    },
    intent: "ui",
  },
  {
    id: "RP-4",
    domain: "Employer",
    category: "Profile",
    name: "Business profile section",
    route: "/#/employer/profile",
    probe: {
      type: "goto-testid",
      path: "/#/employer/profile",
      testId: "employer-business-profile-section",
    },
    intent: "ui",
  },
  {
    id: "RP-5",
    domain: "Employer",
    category: "Profile",
    name: "Company logo picker",
    route: "/#/employer/profile",
    probe: {
      type: "goto-testid",
      path: "/#/employer/profile",
      testId: "employer-company-logo-picker",
    },
    intent: "ui",
  },
  {
    id: "RP-6",
    domain: "Employer",
    category: "Profile",
    name: "Verification status section",
    route: "/#/employer/profile",
    probe: {
      type: "goto-testid",
      path: "/#/employer/profile",
      testId: "employer-verification-section",
    },
    intent: "ui",
  },
  {
    id: "RP-7",
    domain: "Employer",
    category: "Profile",
    name: "Dual-track verification panel",
    route: "/#/employer/profile",
    probe: {
      type: "goto-testid",
      path: "/#/employer/profile",
      testId: "dual-track-verification",
    },
    intent: "ui",
  },
  {
    id: "RP-8",
    domain: "Employer",
    category: "Security",
    name: "Contact OTP verification",
    route: "/#/employer/profile",
    probe: {
      type: "goto-text",
      path: "/#/employer/profile",
      text: /Verify phone or email|Send code|6-digit code/i,
    },
    intent: "ui",
  },
  {
    id: "RP-9",
    domain: "Employer",
    category: "Profile",
    name: "Business Compliance Hub (from profile)",
    route: "/#/employer/profile",
    probe: {
      type: "goto-testid",
      path: "/#/employer/profile",
      testId: "open-business-compliance-hub",
    },
    intent: "ui",
  },
  {
    id: "RP-10",
    domain: "Employer",
    category: "Profile",
    name: "Ownership & access section",
    route: "/#/employer/profile",
    probe: {
      type: "goto-testid",
      path: "/#/employer/profile",
      testId: "employer-ownership-section",
    },
    intent: "ui",
  },
  {
    id: "RP-11",
    domain: "Employer",
    category: "Profile",
    name: "Public profile preview",
    route: "/#/employer/profile",
    probe: {
      type: "goto-testid",
      path: "/#/employer/profile",
      testId: "employer-public-profile-preview",
    },
    intent: "ui",
  },
  {
    id: "RP-12",
    domain: "Employer",
    category: "Profile",
    name: "Save employer profile",
    route: "/#/employer/profile",
    probe: {
      type: "click-role",
      path: "/#/employer/profile",
      role: "button",
      name: /^Edit$/,
      afterText: /Save profile/i,
    },
    intent: "ui",
  },

  // —— Employer Settings ——
  {
    id: "RS-1",
    domain: "Employer",
    category: "Settings",
    name: "Employer Settings hero",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Employer Settings|Identity, security/i,
    },
    intent: "ui",
  },
  {
    id: "RS-2",
    domain: "Employer",
    category: "Settings",
    name: "Edit prefs control",
    route: "/#/employer/settings",
    probe: {
      type: "goto-role",
      path: "/#/employer/settings",
      role: "button",
      name: /Edit prefs/i,
    },
    intent: "ui",
  },
  {
    id: "RS-3",
    domain: "Employer",
    category: "Profile",
    name: "Account snapshot card",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Account snapshot|Owner:|KYC:/i,
    },
    intent: "ui",
  },
  {
    id: "RS-4",
    domain: "Employer",
    category: "Profile",
    name: "Open company profile link",
    route: "/#/employer/settings",
    probe: {
      type: "goto-role",
      path: "/#/employer/settings",
      role: "button",
      name: /Open company profile/i,
    },
    intent: "ui",
  },
  {
    id: "RS-5",
    domain: "Employer",
    category: "Settings",
    name: "Business Compliance Hub card",
    route: "/#/employer/settings",
    probe: {
      type: "goto-testid",
      path: "/#/employer/settings",
      testId: "settings-open-compliance-hub",
    },
    intent: "ui",
  },
  {
    id: "RS-6",
    domain: "Employer",
    category: "Preferences",
    name: "Favourites-first shift invites default",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Favourites-first shift invites/i,
    },
    intent: "ui",
  },
  {
    id: "RS-7",
    domain: "Employer",
    category: "Preferences",
    name: "Escrow hold by default",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Escrow hold by default/i,
    },
    intent: "ui",
  },
  {
    id: "RS-8",
    domain: "Employer",
    category: "Security",
    name: "Account & Security panel",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Account & Security|Signed-in identity/i,
    },
    intent: "ui",
  },
  {
    id: "RS-9",
    domain: "Employer",
    category: "Security",
    name: "Update password (employer)",
    route: "/#/employer/settings",
    probe: {
      type: "goto-role",
      path: "/#/employer/settings",
      role: "button",
      name: /Update password/i,
    },
    intent: "ui",
  },
  {
    id: "RS-10",
    domain: "Employer",
    category: "Notifications",
    name: "Notifications & Navigation section",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Notifications & Navigation/i,
    },
    intent: "ui",
  },
  {
    id: "RS-11",
    domain: "Employer",
    category: "Notifications",
    name: "Pulse Navigation toggle",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Pulse Navigation|Navigation lights are OFF/i,
    },
    intent: "ui",
  },
  {
    id: "RS-12",
    domain: "Employer",
    category: "Notifications",
    name: "Employer notifications toggle",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Receive alerts for applications/i,
    },
    intent: "ui",
  },
  {
    id: "RS-13",
    domain: "Employer",
    category: "Notifications",
    name: "Global mute",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Global mute|Silences all in-app notification sounds/i,
    },
    intent: "ui",
  },
  {
    id: "RS-14",
    domain: "Employer",
    category: "Notifications",
    name: "Quiet hours (DND)",
    route: "/#/employer/settings",
    probe: {
      type: "goto-text",
      path: "/#/employer/settings",
      text: /Quiet hours|Do Not Disturb/i,
    },
    intent: "ui",
  },
  {
    id: "RS-X1",
    domain: "Employer",
    category: "Danger",
    name: "Delete account",
    probe: {
      type: "skip",
      reason:
        "DangerZoneSection + DeleteAccountModal exist but not mounted on EmployerSettingsPage",
    },
    intent: "flag",
  },
  {
    id: "RS-X2",
    domain: "Employer",
    category: "Preferences",
    name: "Language preference",
    probe: {
      type: "skip",
      reason:
        "PreferencesSection (language) in SettingsActionSections.tsx — not mounted on live page",
    },
    intent: "flag",
  },
  {
    id: "RS-X3",
    domain: "Employer",
    category: "Settings",
    name: "Help & legal links",
    probe: {
      type: "skip",
      reason: "EmployerSettingsHelpLegalSection not mounted on EmployerSettingsPage",
    },
    intent: "flag",
  },

  // —— Shared danger / admin ——
  {
    id: "SH-1",
    domain: "Shared",
    category: "Danger",
    name: "Log Out confirmation (shell account menu)",
    route: "/#/employee/settings",
    probe: {
      type: "shell-logout",
      path: "/#/employee/settings",
      afterText: /Log Out|Cancel|Are you sure/i,
    },
    intent: "ui",
  },
  {
    id: "AD-X1",
    domain: "Shared",
    category: "Settings",
    name: "Admin settings version card",
    probe: {
      type: "skip",
      reason:
        "Admin settings at /#/admin/settings — out of primary audit scope; AdminSettingsAboutCard has version only",
    },
    intent: "flag",
  },
];

export const PROFILE_INVENTORY_TOTAL = PROFILE_FEATURE_INVENTORY.length;
