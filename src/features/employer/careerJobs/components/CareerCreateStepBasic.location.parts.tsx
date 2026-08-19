import {
  normalizeTextInput,
  PREMIUM_INPUT_STYLE,
  PREMIUM_LABEL_STYLE,
  type StepBasicData,
  CAREER_MUTED,
} from "./CareerCreateStepBasic.helpers";
import { IconLocation, PremiumCard, SectionHead } from "./CareerCreateStepBasic.shared.parts";
import { CareerCreateCandidatesRadarCard } from "./CareerCreateCandidatesRadarCard";
import { sanitizePincodeInput } from "../../../shared/location/pincode";

type LocationCardProps = {
  data: StepBasicData;
  onChange: (updates: Partial<StepBasicData>) => void;
};

export function LocationCard({ data, onChange }: LocationCardProps) {
  return (
    <PremiumCard marginTop={16}>
      <SectionHead
        icon={<IconLocation />}
        title="Work area"
        sub="Matching uses work area code only. No live GPS."
      />

      <div>
        <label style={PREMIUM_LABEL_STYLE}>
          Work area code <span style={{ color: "var(--wm-error)" }}>*</span>
        </label>
        <input
          style={PREMIUM_INPUT_STYLE}
          value={data.locationPincode}
          onChange={(event) =>
            onChange({ locationPincode: sanitizePincodeInput(event.target.value) })
          }
          placeholder="Work area code"
          inputMode="numeric"
          maxLength={6}
          autoComplete="off"
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={PREMIUM_LABEL_STYLE}>
          Reporting area {data.workMode !== "remote" && <span style={{ color: "var(--wm-error)" }}>*</span>}
        </label>
        <input
          style={PREMIUM_INPUT_STYLE}
          value={data.workMode === "remote" ? "Remote / Anywhere" : data.location}
          onChange={(event) =>
            onChange({ location: normalizeTextInput(data.location, event.target.value) })
          }
          placeholder="Reporting area"
          maxLength={100}
          disabled={data.workMode === "remote"}
          autoComplete="off"
          spellCheck={false}
        />
        <div style={{ marginTop: 6, fontSize: 11.5, color: CAREER_MUTED, lineHeight: 1.4, fontWeight: 500 }}>
          Used on the job post. Matching cards never show this text.
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <CareerCreateCandidatesRadarCard locationPincode={data.locationPincode} />
      </div>
    </PremiumCard>
  );
}
