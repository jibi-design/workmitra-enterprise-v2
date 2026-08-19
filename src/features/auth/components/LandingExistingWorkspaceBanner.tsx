// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingExistingWorkspaceBanner.tsx
// Compact returning-user strip — does not compete with role bento.

import type { AppRole } from "../../../app/storage/roleStorage";

type Props = {
  existing: AppRole;
  onContinue: () => void;
  onClear: () => void;
};

function labelForRole(role: AppRole): string {
  if (role === "employee") return "Employee";
  if (role === "employer") return "Employer";
  return "Admin";
}

export function LandingExistingWorkspaceBanner({ existing, onContinue, onClear }: Props) {
  const roleLabel = labelForRole(existing);

  return (
    <div
      className="wm-auth-workspace-strip"
      role="status"
      aria-label={`Continue as ${roleLabel}`}
    >
      <p className="wm-auth-workspace-strip__meta">
        <span className="wm-auth-workspace-strip__label">Last used</span>
        <span className="wm-auth-workspace-strip__role">{roleLabel}</span>
      </p>
      <div className="wm-auth-workspace-strip__actions">
        <button
          type="button"
          className="wm-auth-workspace-strip__continue"
          onClick={onContinue}
        >
          Continue as {roleLabel}
        </button>
        <button type="button" className="wm-auth-workspace-strip__clear" onClick={onClear}>
          Choose a different role
        </button>
      </div>
    </div>
  );
}
