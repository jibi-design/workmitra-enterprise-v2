import type { CareerJobType, CareerWorkMode } from "../types/careerTypes";
import {
  jobTypeLabel,
  normalizeTextInput,
  PREMIUM_INPUT_STYLE,
  PREMIUM_LABEL_STYLE,
  type StepBasicData,
  workModeLabel,
} from "./CareerCreateStepBasic.helpers";
import { IconBriefcase, PremiumCard, SectionHead } from "./CareerCreateStepBasic.shared.parts";

type JobDetailsCardProps = {
  data: StepBasicData;
  onChange: (updates: Partial<StepBasicData>) => void;
};

export function JobDetailsCard({ data, onChange }: JobDetailsCardProps) {
  return (
    <PremiumCard>
      <SectionHead
        icon={<IconBriefcase />}
        title="Job details"
        sub="Basic information about the position."
      />

      <div style={{ marginBottom: 16 }}>
        <label style={PREMIUM_LABEL_STYLE}>
          Company Name <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          style={PREMIUM_INPUT_STYLE}
          value={data.companyName}
          onChange={(event) =>
            onChange({ companyName: normalizeTextInput(data.companyName, event.target.value) })
          }
          placeholder="e.g. Greenfield Corp"
          maxLength={100}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={PREMIUM_LABEL_STYLE}>
          Job Title <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          style={PREMIUM_INPUT_STYLE}
          value={data.jobTitle}
          onChange={(event) =>
            onChange({ jobTitle: normalizeTextInput(data.jobTitle, event.target.value) })
          }
          placeholder="e.g. Senior Accountant, Marketing Executive"
          maxLength={100}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={PREMIUM_LABEL_STYLE}>Department</label>
        <input
          style={PREMIUM_INPUT_STYLE}
          value={data.department}
          onChange={(event) =>
            onChange({ department: normalizeTextInput(data.department, event.target.value) })
          }
          placeholder="e.g. Finance, Marketing, Operations"
          maxLength={60}
          list="wm-dept-suggestions"
          autoComplete="off"
          spellCheck={false}
        />
        <datalist id="wm-dept-suggestions">
          <option value="Finance" />
          <option value="Marketing" />
          <option value="Operations" />
          <option value="Human Resources" />
          <option value="Sales" />
          <option value="Engineering" />
        </datalist>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={PREMIUM_LABEL_STYLE}>
            Job Type <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            style={PREMIUM_INPUT_STYLE}
            value={data.jobType}
            onChange={(event) => onChange({ jobType: event.target.value as CareerJobType })}
          >
            <option value="full-time">{jobTypeLabel("full-time")}</option>
            <option value="part-time">{jobTypeLabel("part-time")}</option>
            <option value="contract">{jobTypeLabel("contract")}</option>
          </select>
        </div>

        <div>
          <label style={PREMIUM_LABEL_STYLE}>
            No. of Vacancies <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            style={PREMIUM_INPUT_STYLE}
            type="number"
            min="1"
            max="500"
            step="1"
            inputMode="numeric"
            value={data.vacancies}
            onChange={(event) => onChange({ vacancies: event.target.value })}
            placeholder="e.g. 1, 5, 10"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={PREMIUM_LABEL_STYLE}>
            Work Mode <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            style={PREMIUM_INPUT_STYLE}
            value={data.workMode}
            onChange={(event) => {
              const newMode = event.target.value as CareerWorkMode;
              onChange({
                workMode: newMode,
                location: newMode === "remote" ? "" : data.location,
              });
            }}
          >
            <option value="on-site">{workModeLabel("on-site")}</option>
            <option value="remote">{workModeLabel("remote")}</option>
            <option value="hybrid">{workModeLabel("hybrid")}</option>
          </select>
        </div>

        <div>
          <label style={PREMIUM_LABEL_STYLE}>Probation Period</label>
          <select
            style={PREMIUM_INPUT_STYLE}
            value={data.probationPeriod}
            onChange={(event) => onChange({ probationPeriod: event.target.value })}
          >
            <option value="none">No Probation</option>
            <option value="1_month">1 Month</option>
            <option value="3_months">3 Months</option>
            <option value="6_months">6 Months</option>
          </select>
        </div>
      </div>
    </PremiumCard>
  );
}
