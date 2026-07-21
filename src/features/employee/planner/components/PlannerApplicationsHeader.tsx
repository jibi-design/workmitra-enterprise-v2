/** Job Mitra | PlannerApplicationsHeader.tsx | Native planner applications header */

type Props = {
  onBrowseProjects: () => void;
};

export function PlannerApplicationsHeader({ onBrowseProjects }: Props) {
  return (
    <section
      data-testid="planner-applications-header"
      style={{
        marginTop: 2,
        marginBottom: 14,
        padding: "16px 16px",
        borderRadius: 22,
        border: "1px solid rgba(8,145,178,0.18)",
        background:
          "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(255,255,255,0.98) 48%, rgba(236,254,255,0.86))",
        boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="wm-pageTitle">My Project Applications</div>
          <div className="wm-pageSub">Multi-day Gig project bundles only</div>
        </div>

        <button
          type="button"
          onClick={onBrowseProjects}
          data-testid="planner-applications-browse"
          style={{
            padding: "8px 13px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            cursor: "pointer",
            border: "1px solid rgba(8,145,178,0.22)",
            color: "#0891b2",
            background: "rgba(8,145,178,0.08)",
            whiteSpace: "nowrap",
          }}
        >
          Browse Projects
        </button>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          lineHeight: 1.55,
          color: "var(--wm-er-muted)",
          maxWidth: 390,
        }}
      >
        Track plan bundle status and per-day breakdown — never mixed with green shift applications.
      </div>
    </section>
  );
}
