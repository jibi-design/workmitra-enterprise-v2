// Job Mitra | PlannerTeaserStrip.tsx

type Props = {
  onOpen: () => void;
};

export function PlannerTeaserStrip({ onOpen }: Props) {
  return (
    <section className="wm-planner-teaser" aria-label="Demand Planner">
      <div>
        <div className="wm-planner-teaserTitle">Gig Projects</div>
        <div className="wm-planner-teaserSub">
          Plan your week or month ahead — one Mega Project for workers, crew broadcast for your
          agency.
        </div>
      </div>
      <button type="button" className="wm-planner-btnPrimary" onClick={onOpen}>
        Open Gig Projects
      </button>
    </section>
  );
}
