// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingExistingWorkspaceBanner.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\auth\components\LandingExistingWorkspaceBanner.tsx

import type { AppRole } from "../../../app/storage/roleStorage";

type Props = {
  existing: AppRole;
  onContinue: () => void;
  onClear: () => void;
};

export function LandingExistingWorkspaceBanner({ existing, onContinue, onClear }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 16,
        border: "1px solid var(--wm-er-divider)",
        background: "rgba(255, 255, 255, 0.96)",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      <button className="wm-primarybtn" type="button" onClick={onContinue}>
        Continue previous workspace
      </button>

      <button
        type="button"
        onClick={onClear}
        style={{
          border: 0,
          background: "transparent",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--wm-er-muted)",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Clear
      </button>

      <span
        style={{
          marginLeft: "auto",
          fontSize: 12,
          color: "var(--wm-er-muted)",
          fontWeight: 700,
        }}
      >
        Current workspace: {existing}
      </span>
    </div>
  );
}
