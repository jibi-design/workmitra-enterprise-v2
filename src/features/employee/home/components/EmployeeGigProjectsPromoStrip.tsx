// Job Mitra | EmployeeGigProjectsPromoStrip.tsx | Green shift-domain promo — links out to Gig only

type Props = {
  onOpen: () => void;
};

/** Shown on Shift Jobs pages only — green chrome, no teal planner classes. */
export function EmployeeGigProjectsPromoStrip({ onOpen }: Props) {
  return (
    <section
      aria-label="Gig Projects"
      style={{
        padding: "14px 16px",
        borderRadius: 16,
        border: "1px solid rgba(39, 174, 96, 0.22)",
        background: "linear-gradient(135deg, rgba(240,253,244,0.95), rgba(255,255,255,0.98))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#15803d" }}>
          Gig Projects (separate app)
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--wm-neutral-500)",
            marginTop: 4,
            lineHeight: 1.45,
            maxWidth: 280,
          }}
        >
          Multi-day agency plans live in their own teal workspace — not mixed with single-day shifts
          here.
        </div>
      </div>
      <button
        type="button"
        className="wm-primarybtn"
        style={{ fontSize: 12, whiteSpace: "nowrap" }}
        onClick={onOpen}
      >
        Open Gig Projects →
      </button>
    </section>
  );
}
