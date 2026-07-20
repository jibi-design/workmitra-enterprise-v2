// App name: Job Mitra
// File name: CareerCreateRequirementSectionHead.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreateRequirementSectionHead.tsx

import type { ReactNode } from "react";

type CareerCreateRequirementSectionHeadProps = {
  icon: ReactNode;
  title: string;
  sub?: string;
};

export function CareerCreateRequirementSectionHead({
  icon,
  title,
  sub,
}: CareerCreateRequirementSectionHeadProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(55, 48, 163, 0.08)",
            color: "var(--wm-er-accent-career)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>{title}</div>
      </div>

      {sub && (
        <div style={{ marginTop: 4, marginLeft: 42, fontSize: 12, color: "var(--wm-er-muted)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function IconSalary() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4Z"
      />
    </svg>
  );
}

export function IconRequirements() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM9.5 16.5 6 13l1.41-1.41L9.5 13.67l5.09-5.09L16 10l-6.5 6.5ZM13 9V3.5L18.5 9H13Z"
      />
    </svg>
  );
}

export function IconDescription() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5 9H13Z"
      />
    </svg>
  );
}
