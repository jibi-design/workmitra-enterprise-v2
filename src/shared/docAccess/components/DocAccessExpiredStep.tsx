// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessExpiredStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\components\DocAccessExpiredStep.tsx

import { DOC_ACCESS_ACCENT } from "../docAccessConstants";

type DocAccessExpiredStepProps = {
  onClose: () => void;
};

export function DocAccessExpiredStep({ onClose }: DocAccessExpiredStepProps) {
  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>
        Session Expired
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 16 }}>
        The 30-minute access window has ended.
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          padding: "10px 24px",
          borderRadius: 10,
          border: "none",
          background: DOC_ACCESS_ACCENT,
          color: "#fff",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  );
}
