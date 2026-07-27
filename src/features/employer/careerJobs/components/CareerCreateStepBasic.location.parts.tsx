import {
  normalizeTextInput,
  PREMIUM_INPUT_STYLE,
  PREMIUM_LABEL_STYLE,
  type StepBasicData,
  CAREER_MUTED,
} from "./CareerCreateStepBasic.helpers";
import { IconLocation, PremiumCard, SectionHead } from "./CareerCreateStepBasic.shared.parts";

type LocationCardProps = {
  data: StepBasicData;
  onChange: (updates: Partial<StepBasicData>) => void;
};

export function LocationCard({ data, onChange }: LocationCardProps) {
  return (
    <PremiumCard marginTop={16}>
      <SectionHead
        icon={<IconLocation />}
        title="Work location"
        sub="Where the employee will be based."
      />

      <div>
        <label style={PREMIUM_LABEL_STYLE}>
          Work City {data.workMode !== "remote" && <span style={{ color: "#dc2626" }}>*</span>}
        </label>
        <input
          style={PREMIUM_INPUT_STYLE}
          value={data.workMode === "remote" ? "Remote / Anywhere" : data.location}
          onChange={(event) =>
            onChange({ location: normalizeTextInput(data.location, event.target.value) })
          }
          placeholder="e.g. Berlin, London, New York"
          maxLength={100}
          disabled={data.workMode === "remote"}
          autoComplete="off"
          spellCheck={false}
        />
        <div
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: CAREER_MUTED,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          {data.workMode === "remote"
            ? "Location is optional for remote work mode."
            : "Enter the city or area where the office is located."}
        </div>
      </div>
    </PremiumCard>
  );
}
