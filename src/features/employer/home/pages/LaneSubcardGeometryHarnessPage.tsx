/** DEV geometry harness — high-volume lane sub-cards. Not a product screen. */

import { EmployerLaneSubSections } from "../components/employerDashboard/EmployerLaneSubSections";
import { HIGH_VOLUME_LANE_PREVIEW } from "../helpers/employerDashboard.lanePreview.mock";
import "../../../../app/theme/components/employer-dash-hero.css";
import "../../../../app/theme/components/employer-dash-lane-preview.css";
import "../../../../app/theme/components/home-premium.css";

const DOMAINS = ["shift", "career", "planner"] as const;

export function LaneSubcardGeometryHarnessPage() {
  return (
    <div
      className="wm-dev-audit-sandbox"
      data-audit-sandbox="dev"
      data-testid="lane-subcard-geometry-harness"
      style={{ padding: 12, maxWidth: 390, margin: "0 auto" }}
    >
      {DOMAINS.map((domain) => (
        <EmployerLaneSubSections
          key={domain}
          domain={domain}
          cards={HIGH_VOLUME_LANE_PREVIEW[domain]}
        />
      ))}
    </div>
  );
}
