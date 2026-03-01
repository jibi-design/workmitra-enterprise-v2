// src/features/admin/home/pages/AdminHomePage.tsx
export function AdminHomePage() {
  return (
    <div>
      <div style={{ fontWeight: 1000, fontSize: 14 }}>System Overview</div>
      <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-ad-muted)" }}>
        Data-focused control panel (Phase-0 demo).
      </div>

      <div className="wm-admin-cards">
        <div className="wm-admin-card">
          <div className="k">Total Employers</div>
          <div className="v">0</div>
        </div>
        <div className="wm-admin-card">
          <div className="k">Total Employees</div>
          <div className="v">0</div>
        </div>
        <div className="wm-admin-card">
          <div className="k">Active Jobs</div>
          <div className="v">0</div>
        </div>
        <div className="wm-admin-card">
          <div className="k">Reports / Flags</div>
          <div className="v">0</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, color: "var(--wm-ad-muted)" }}>System Health</div>
        <div
          style={{
            marginTop: 6,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid var(--wm-ad-border)",
            borderRadius: "12px",
            padding: "12px",
          }}
        >
          <div style={{ fontWeight: 1000 }}>All services: OK (demo)</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-ad-muted)" }}>
            Recent activity & suspension alerts will appear here.
          </div>
        </div>
      </div>
    </div>
  );
}