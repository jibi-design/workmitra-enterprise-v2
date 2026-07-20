// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminAlertsHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminAlertsHeader.tsx

type Props = {
  totalEvents: number;
};

export function AdminAlertsHeader({ totalEvents }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{ fontSize: 18, fontWeight: 1000, color: "var(--wm-ad-text)", letterSpacing: -0.3 }}
      >
        Audit Log
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-ad-dim)", marginTop: 4 }}>
        Complete activity trail across all domains. {totalEvents} total events.
      </div>
    </div>
  );
}
