// App: Job Mitra / WorkMitra_Enterprise_v2
// File: VaultProfileSharedUi.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\VaultProfileSharedUi.tsx

export function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 999,
        background: bg,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        background: "var(--wm-emp-bg)",
        border: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))",
      }}
    >
      {children}
    </div>
  );
}
