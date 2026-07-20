// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomeHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\components\AdminHomeHeader.tsx

export function AdminHomeHeader() {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: -0.7,
          color: "var(--wm-ad-navy)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        System Overview
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--wm-ad-green-dim)",
            border: "1px solid var(--wm-ad-green-border)",
            padding: "4px 12px 4px 9px",
            borderRadius: 999,
          }}
        >
          <span className="wm-ad-healthDot" style={{ width: 7, height: 7, marginTop: 0 }} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "var(--wm-ad-green)",
              letterSpacing: 0.8,
            }}
          >
            LIVE
          </span>
        </span>
      </div>

      <div style={{ fontSize: 13.5, color: "var(--wm-ad-navy-400)", marginTop: 5 }}>
        Real-time monitoring across all domains
      </div>
    </div>
  );
}
