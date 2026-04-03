// src/features/employer/shiftJobs/components/ShiftCreateWorkersSection.tsx
//
// Workers section — experience dropdown is category-aware.
// Labels change per industry while underlying value stays typed.

import type { ExperienceLabel } from "../storage/employerShift.storage";
import { SectionHead, IconWorkers } from "./ShiftCreateIcons";

/* ------------------------------------------------ */
/* Category-aware experience labels                 */
/* ------------------------------------------------ */
type ExperienceOption = { value: ExperienceLabel; label: string };

function getExperienceOptions(category: string): ExperienceOption[] {
  const cat = category.toLowerCase();

  if (cat.includes("construction") || cat.includes("manufacturing")) {
    return [
      { value: "fresher_ok", label: "No experience needed" },
      { value: "helper",     label: "General labourer / helper" },
      { value: "experienced", label: "Skilled tradesperson" },
    ];
  }
  if (cat.includes("kitchen") || cat.includes("restaurant") || cat.includes("catering")) {
    return [
      { value: "fresher_ok", label: "No kitchen experience needed" },
      { value: "helper",     label: "Kitchen helper / prep cook" },
      { value: "experienced", label: "Cook / Chef experience required" },
    ];
  }
  if (cat.includes("driving") || cat.includes("delivery")) {
    return [
      { value: "fresher_ok", label: "Valid license only" },
      { value: "helper",     label: "Some driving experience" },
      { value: "experienced", label: "Professional driver" },
    ];
  }
  if (cat.includes("cleaning")) {
    return [
      { value: "fresher_ok", label: "No experience needed" },
      { value: "helper",     label: "Basic cleaning experience" },
      { value: "experienced", label: "Professional cleaning required" },
    ];
  }
  if (cat.includes("security")) {
    return [
      { value: "fresher_ok", label: "License only (no experience needed)" },
      { value: "helper",     label: "Some security experience" },
      { value: "experienced", label: "Experienced security professional" },
    ];
  }
  if (cat.includes("warehouse") || cat.includes("logistics")) {
    return [
      { value: "fresher_ok", label: "No warehouse experience needed" },
      { value: "helper",     label: "Basic warehouse experience" },
      { value: "experienced", label: "Forklift / experienced required" },
    ];
  }
  if (cat.includes("events")) {
    return [
      { value: "fresher_ok", label: "No experience needed" },
      { value: "helper",     label: "Some events experience" },
      { value: "experienced", label: "Experienced events staff" },
    ];
  }
  if (cat.includes("retail")) {
    return [
      { value: "fresher_ok", label: "No retail experience needed" },
      { value: "helper",     label: "Basic customer service" },
      { value: "experienced", label: "Experienced retail / sales" },
    ];
  }
  if (cat.includes("office") || cat.includes("admin")) {
    return [
      { value: "fresher_ok", label: "No office experience needed" },
      { value: "helper",     label: "Basic admin skills" },
      { value: "experienced", label: "Experienced office / admin" },
    ];
  }
  if (cat.includes("healthcare") || cat.includes("medical")) {
    return [
      { value: "fresher_ok", label: "No medical experience needed" },
      { value: "helper",     label: "Healthcare support experience" },
      { value: "experienced", label: "Qualified healthcare professional" },
    ];
  }

  /* Default */
  return [
    { value: "fresher_ok",  label: "No experience needed (fresher OK)" },
    { value: "helper",      label: "Some experience helpful" },
    { value: "experienced", label: "Experienced only" },
  ];
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  vacanciesStr: string;  onVacancies: (v: string) => void;
  backupSlotsStr: string; onBackupSlots: (v: string) => void;
  experience: ExperienceLabel; onExperience: (v: ExperienceLabel) => void;
  category: string;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ShiftCreateWorkersSection(props: Props) {
  const expOptions = getExperienceOptions(props.category);

  /* If current value not in category options, reset to first option */
  const validValues = expOptions.map((o) => o.value);
  const effectiveExp = validValues.includes(props.experience) ? props.experience : expOptions[0].value;

  return (
    <section className="wm-er-card" style={{ marginTop: 12 }}>
      <SectionHead
        icon={<IconWorkers />}
        title="Workers Needed"
        sub="How many workers and what experience level"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="wm-field">
          <div className="wm-label">
            Workers needed <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <input
            className="wm-input"
            value={props.vacanciesStr}
            onChange={(e) => props.onVacancies(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="Enter number"
            maxLength={4}
          />
        </div>
        <div className="wm-field">
          <div className="wm-label">Backup candidates</div>
          <input
            className="wm-input"
            value={props.backupSlotsStr}
            onChange={(e) => props.onBackupSlots(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="2"
            maxLength={2}
          />
        </div>
      </div>

      <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
        Backup candidates stay on standby if a confirmed worker drops out. Default: 2
      </div>

      {/* Category-aware experience dropdown */}
      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Experience Required</div>
        <select
          className="wm-input"
          value={effectiveExp}
          onChange={(e) => props.onExperience(e.target.value as ExperienceLabel)}
        >
          {expOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {props.category && (
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
            Options shown for: <b style={{ color: "var(--wm-er-text)" }}>{props.category || "General"}</b>
          </div>
        )}
      </div>
    </section>
  );
}