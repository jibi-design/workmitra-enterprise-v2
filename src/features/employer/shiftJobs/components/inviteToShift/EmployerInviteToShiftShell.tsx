// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerInviteToShiftShell.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\inviteToShift\EmployerInviteToShiftShell.tsx

import type { ReactNode } from "react";

type Props = {
  onClose: () => void;
  children: ReactNode;
};

export function EmployerInviteToShiftShell({ onClose, children }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--wm-er-card, #fff)",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
