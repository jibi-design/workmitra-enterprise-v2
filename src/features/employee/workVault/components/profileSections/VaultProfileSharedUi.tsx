// App: Job Mitra / WorkMitra_Enterprise_v2
// File: VaultProfileSharedUi.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\VaultProfileSharedUi.tsx

export function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="wm-vault-chip" style={{ background: bg, color }}>
      {label}
    </span>
  );
}

export function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="wm-vault-section-card">{children}</div>;
}
