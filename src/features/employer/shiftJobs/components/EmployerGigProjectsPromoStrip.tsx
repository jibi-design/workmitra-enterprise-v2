// Job Mitra | EmployerGigProjectsPromoStrip.tsx | Green shift-domain promo — links out to Gig only

type Props = {
  onOpen: () => void;
};

export function EmployerGigProjectsPromoStrip({ onOpen }: Props) {
  return (
    <section
      aria-label="Gig Projects"
      style={{
        marginBottom: 14,
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
          Gig Projects (separate domain)
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--wm-neutral-500)",
            marginTop: 4,
            lineHeight: 1.45,
            maxWidth: 300,
          }}
        >
          Multi-day crew plans are managed in teal Gig Projects — not inside green Shift Jobs posts.
        </div>
      </div>
      <button type="button" className="wm-er-btnPrimary" style={{ fontSize: 12 }} onClick={onOpen}>
        Open Gig Projects →
      </button>
    </section>
  );
}
