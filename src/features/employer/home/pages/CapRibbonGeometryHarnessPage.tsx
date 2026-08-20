/** DEV geometry harness — high-volume mock ribbon. Not a product screen. */

import { EmployerCapabilityRibbon } from "../components/employerDashboard/EmployerCapabilityRibbon";
import { HIGH_VOLUME_CAP_RIBBON_INPUT } from "../helpers/employerDashboard.capability.mock";
import "../../../../app/theme/components/employer-dash-cap-ribbon.css";

export function CapRibbonGeometryHarnessPage() {
  return (
    <div
      className="wm-dev-audit-sandbox"
      data-audit-sandbox="dev"
      data-testid="cap-ribbon-geometry-harness"
      style={{ padding: 12, maxWidth: 390, margin: "0 auto" }}
    >
      <EmployerCapabilityRibbon {...HIGH_VOLUME_CAP_RIBBON_INPUT} />
    </div>
  );
}
