/** Job Mitra | Employee work area code + commute radius (no GPS). */

import {
  COMMUTE_RADIUS_OPTIONS,
  parseCommuteRadius,
  type CommuteRadiusKm,
} from "../../../shared/location/commuteRadius";
import {
  CAREER_COMMUTE_RADIUS_OPTIONS,
  parseCareerCommuteRadius,
  type CareerCommuteRadiusKm,
} from "../../../shared/location/careerCommuteRadius";
import { sanitizePincodeInput } from "../../../shared/location/pincode";
import type { ProfileSectionProps } from "../types/profileTypes";
import { SectionHead, IconPin } from "./ProfilePageIcons";

type Props = ProfileSectionProps & {
  sectionRef: React.RefObject<HTMLElement | null>;
};

export function ProfileLocationSection({ draft, disabled, onUpdate, sectionRef }: Props) {
  return (
    <section className="wm-profileSectionCard" style={{ marginTop: 12 }} ref={sectionRef}>
      <SectionHead
        icon={<IconPin />}
        title="Work area"
        sub="Used to match nearby jobs. No live GPS."
      />

      <div className="wm-field">
        <label className="wm-label">
          Work area code <span style={{ color: "var(--wm-error)" }}>*</span>
        </label>
        <input
          className="wm-input"
          value={draft.basePincode}
          disabled={disabled}
          inputMode="numeric"
          maxLength={6}
          placeholder="Work area code"
          onChange={(e) => onUpdate("basePincode", sanitizePincodeInput(e.target.value))}
        />
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <label className="wm-label">Shift commute radius</label>
        <select
          className="wm-input"
          value={draft.commuteRadius}
          disabled={disabled}
          onChange={(e) =>
            onUpdate("commuteRadius", parseCommuteRadius(e.target.value) as CommuteRadiusKm)
          }
        >
          {COMMUTE_RADIUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <label className="wm-label">Career commute radius</label>
        <select
          className="wm-input"
          value={draft.careerCommuteRadius}
          disabled={disabled}
          onChange={(e) =>
            onUpdate(
              "careerCommuteRadius",
              parseCareerCommuteRadius(e.target.value) as CareerCommuteRadiusKm,
            )
          }
        >
          {CAREER_COMMUTE_RADIUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
