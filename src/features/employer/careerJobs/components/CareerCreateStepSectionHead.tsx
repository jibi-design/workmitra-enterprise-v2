// App name: Job Mitra
// File name: CareerCreateStepSectionHead.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreateStepSectionHead.tsx

import type { ReactNode } from "react";

type CareerCreateStepSectionHeadProps = {
  icon: ReactNode;
  title: string;
  sub?: string;
};

export function CareerCreateStepSectionHead({
  icon,
  title,
  sub,
}: CareerCreateStepSectionHeadProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--wm-radius-10)",
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

export function IconInterview() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
      />
    </svg>
  );
}

export function IconReview() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2ZM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"
      />
    </svg>
  );
}

export function IconRemove() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13H5v-2h14v2Z" />
    </svg>
  );
}

export function IconAdd() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
    </svg>
  );
}
