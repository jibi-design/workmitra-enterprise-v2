/** Job Mitra | CareerDashboardStageBanner.tsx | Stage action banner */

import type { CareerTab } from "./CareerPipelineTabs";
import {
  careerStageBannerCopy,
  type CareerPipelineCounts,
} from "../helpers/careerDashboard.smartResume";

type Props = {
  readonly tab: CareerTab;
  readonly counts: CareerPipelineCounts;
};

export function CareerDashboardStageBanner({ tab, counts }: Props) {
  const copy = careerStageBannerCopy(tab, counts);
  if (!copy) return null;

  return (
    <div
      className="wm-er-card"
      data-testid="career-dashboard-stage-banner"
      style={{
        padding: "11px 12px",
        borderRadius: "var(--wm-radius-chip)",
        border: "1px solid color-mix(in srgb, var(--wm-career-accent, #2563eb) 18%, transparent)",
        background:
          "color-mix(in srgb, var(--wm-career-accent, #2563eb) 6%, var(--wm-surface, #fff))",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 950, color: "var(--wm-er-text)" }}>{copy.title}</div>
      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 750, color: "var(--wm-er-muted)" }}>
        {copy.message}
      </div>
    </div>
  );
}
