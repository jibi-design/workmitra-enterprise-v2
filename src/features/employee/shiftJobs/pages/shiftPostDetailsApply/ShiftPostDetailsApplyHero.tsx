// App name: Job Mitra
// File name: ShiftPostDetailsApplyHero.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\pages\shiftPostDetailsApply\ShiftPostDetailsApplyHero.tsx

import { ShiftIcon } from "../../components/ShiftPostDetailSections";
import {
  HERO_BADGE_STYLE,
  HERO_ICON_STYLE,
  HERO_IDENTITY_STYLE,
  HERO_STYLE,
  HERO_TEXT_STYLE,
  HERO_TOP_STYLE,
} from "./shiftPostDetailsApply.styles";

export function ShiftPostDetailsApplyHero({
  employerName,
  locationName,
}: {
  readonly employerName: string;
  readonly locationName: string;
}) {
  return (
    <section style={HERO_STYLE}>
      <div style={HERO_TOP_STYLE}>
        <div style={HERO_IDENTITY_STYLE}>
          <div style={HERO_ICON_STYLE}>
            <ShiftIcon size={22} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="wm-pageTitle">Shift details</div>
            <div className="wm-pageSub">
              {employerName} · {locationName}
            </div>
          </div>
        </div>

        <div style={HERO_BADGE_STYLE}>Apply safely</div>
      </div>

      <div style={HERO_TEXT_STYLE}>
        Review pay, location, dates, requirements, questions, and employer details before submitting
        your application.
      </div>
    </section>
  );
}
