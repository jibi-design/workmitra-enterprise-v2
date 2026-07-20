// App: Job Mitra / WorkMitra_Enterprise_v2
// File: acceptResignationUi.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\acceptResignation\acceptResignationUi.tsx

export function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)", marginBottom: 12 }}>
      Step {step} of 3
    </div>
  );
}
