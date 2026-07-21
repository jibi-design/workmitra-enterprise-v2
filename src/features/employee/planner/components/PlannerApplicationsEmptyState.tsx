/** Job Mitra | PlannerApplicationsEmptyState.tsx */

type Props = {
  onBrowseProjects: () => void;
};

export function PlannerApplicationsEmptyState({ onBrowseProjects }: Props) {
  return (
    <section
      data-testid="planner-applications-empty"
      className="wm-ee-card"
      style={{
        marginTop: 12,
        padding: "34px 18px",
        borderRadius: 24,
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 14px 32px rgba(15,23,42,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 950, color: "#0f172a" }}>No applications yet</div>
      <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, maxWidth: 290 }}>
        Browse Gig Projects and apply to multi-day plans to track bundle status here.
      </div>
      <button
        type="button"
        onClick={onBrowseProjects}
        className="wm-planner-btnPrimary"
        data-testid="planner-applications-empty-cta"
        style={{
          marginTop: 4,
          padding: "10px 20px",
          fontSize: 13,
          fontWeight: 950,
          cursor: "pointer",
        }}
      >
        Browse Projects
      </button>
    </section>
  );
}
