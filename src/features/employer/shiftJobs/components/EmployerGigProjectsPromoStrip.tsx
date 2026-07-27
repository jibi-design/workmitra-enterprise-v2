// Job Mitra | EmployerGigProjectsPromoStrip.tsx | Compact Gig domain promo for Shift Home

type Props = {
  onOpen: () => void;
};

export function EmployerGigProjectsPromoStrip({ onOpen }: Props) {
  return (
    <section
      className="wm-shiftHomeGigPromo"
      aria-label="Gig Projects Domain"
      data-testid="employer-gig-projects-promo"
    >
      <div className="wm-shiftHomeGigPromoText">
        <div className="wm-shiftHomeGigPromoTitle">Gig Projects Domain</div>
        <div className="wm-shiftHomeGigPromoSubtitle">Multi-day / Milestone projects</div>
      </div>

      <button
        type="button"
        className="wm-shiftHomeGigPromoCta"
        onClick={onOpen}
        data-testid="employer-gig-projects-open"
      >
        Open Gig Projects →
      </button>
    </section>
  );
}
