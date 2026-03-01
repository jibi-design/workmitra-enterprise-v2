// src/features/employee/shiftJobs/pages/ShiftControlCenterPage.tsx
export function ShiftControlCenterPage() {
  return (
    <div>
      <div style={{ fontWeight: 1000, fontSize: 16 }}>Shift Control Center</div>
      <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)" }}>
        Enterprise layout (Phase-0 demo). Layers are separated and never mixed.
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <section className="wm-er-panel" style={{ borderRadius: "16px" }}>
          <div style={{ fontSize: 14, fontWeight: 1000 }}>Layer 1 — Shift Overview</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)" }}>
            Summary only: today’s shift, active assignments, pending applications, urgent alerts, reliability score.
          </div>
        </section>

        <section className="wm-er-panel" style={{ borderRadius: "16px" }}>
          <div style={{ fontSize: 14, fontWeight: 1000 }}>Layer 2 — Opportunity Engine</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)" }}>
            Available shifts + search + filters + recommended. Shift details open as a slide-up panel (next step).
          </div>
        </section>

        <section className="wm-er-panel" style={{ borderRadius: "16px" }}>
          <div style={{ fontSize: 14, fontWeight: 1000 }}>Layer 3 — Application Pipeline</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)" }}>
            Applied → Shortlisted → Confirmed → Rejected. Confirmed becomes Assignment (Layer 4).
          </div>
        </section>

        <section className="wm-er-panel" style={{ borderRadius: "16px" }}>
          <div style={{ fontSize: 14, fontWeight: 1000 }}>Layer 4 — Active Assignments</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)" }}>
            Each assignment is isolated by assignmentId. Tapping opens Assignment Workspace tabs (next step).
          </div>
        </section>

        <section className="wm-er-panel" style={{ borderRadius: "16px" }}>
          <div style={{ fontSize: 14, fontWeight: 1000 }}>Layer 5 — Archive</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)" }}>
            Completed shifts: earnings summary, ratings, feedback, performance stats.
          </div>
        </section>
      </div>
    </div>
  );
}