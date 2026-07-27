// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShiftCreateWorkersSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftCreateWorkersSection.tsx

import type { CSSProperties } from "react";
import type { ExperienceLabel } from "../../shiftJobs/storage/employerShift.storage";
import { SectionHead, IconWorkers } from "./ShiftCreateIcons";

type ExperienceOption = { value: ExperienceLabel; label: string };

type Props = {
  vacanciesStr: string;
  onVacancies: (v: string) => void;
  backupSlotsStr: string;
  onBackupSlots: (v: string) => void;
  experience: ExperienceLabel;
  onExperience: (v: ExperienceLabel) => void;
  category: string;
};

const CARD_STYLE: CSSProperties = {
  marginTop: 12,
  borderRadius: "var(--wm-radius-employee-card)",
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
  boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
};

const GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const INFO_BOX_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(22,163,74,0.06)",
  border: "1px solid rgba(22,163,74,0.16)",
  fontSize: 11,
  color: "var(--wm-er-muted)",
  lineHeight: 1.5,
};

function getExperienceOptions(category: string): ExperienceOption[] {
  const cat = category.toLowerCase();

  if (cat.includes("construction") || cat.includes("manufacturing")) {
    return [
      { value: "fresher_ok", label: "No experience needed" },
      { value: "helper", label: "General labourer / helper" },
      { value: "experienced", label: "Skilled tradesperson" },
    ];
  }

  if (cat.includes("kitchen") || cat.includes("restaurant") || cat.includes("catering")) {
    return [
      { value: "fresher_ok", label: "No kitchen experience needed" },
      { value: "helper", label: "Kitchen helper / prep cook" },
      { value: "experienced", label: "Cook / Chef experience required" },
    ];
  }

  if (cat.includes("driving") || cat.includes("delivery")) {
    return [
      { value: "fresher_ok", label: "Valid license only" },
      { value: "helper", label: "Some driving experience" },
      { value: "experienced", label: "Professional driver" },
    ];
  }

  if (cat.includes("cleaning")) {
    return [
      { value: "fresher_ok", label: "No experience needed" },
      { value: "helper", label: "Basic cleaning experience" },
      { value: "experienced", label: "Professional cleaning required" },
    ];
  }

  if (cat.includes("security")) {
    return [
      { value: "fresher_ok", label: "License only, no experience needed" },
      { value: "helper", label: "Some security experience" },
      { value: "experienced", label: "Experienced security professional" },
    ];
  }

  if (cat.includes("warehouse") || cat.includes("logistics")) {
    return [
      { value: "fresher_ok", label: "No warehouse experience needed" },
      { value: "helper", label: "Basic warehouse experience" },
      { value: "experienced", label: "Forklift / experienced required" },
    ];
  }

  if (cat.includes("events")) {
    return [
      { value: "fresher_ok", label: "No experience needed" },
      { value: "helper", label: "Some events experience" },
      { value: "experienced", label: "Experienced events staff" },
    ];
  }

  if (cat.includes("retail")) {
    return [
      { value: "fresher_ok", label: "No retail experience needed" },
      { value: "helper", label: "Basic customer service" },
      { value: "experienced", label: "Experienced retail / sales" },
    ];
  }

  if (cat.includes("office") || cat.includes("admin")) {
    return [
      { value: "fresher_ok", label: "No office experience needed" },
      { value: "helper", label: "Basic admin skills" },
      { value: "experienced", label: "Experienced office / admin" },
    ];
  }

  if (cat.includes("healthcare") || cat.includes("medical")) {
    return [
      { value: "fresher_ok", label: "No medical experience needed" },
      { value: "helper", label: "Healthcare support experience" },
      { value: "experienced", label: "Qualified healthcare professional" },
    ];
  }

  return [
    { value: "fresher_ok", label: "No experience needed, fresher OK" },
    { value: "helper", label: "Some experience helpful" },
    { value: "experienced", label: "Experienced only" },
  ];
}

export function ShiftCreateWorkersSection(props: Props) {
  const expOptions = getExperienceOptions(props.category);
  const validValues = expOptions.map((option) => option.value);
  const effectiveExp = validValues.includes(props.experience)
    ? props.experience
    : expOptions[0].value;

  return (
    <section className="wm-er-card" style={CARD_STYLE}>
      <SectionHead
        icon={<IconWorkers />}
        title="Workers Needed"
        sub="Set worker count, backup buffer, and experience level"
      />

      <div style={GRID_STYLE}>
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

      <div style={INFO_BOX_STYLE}>
        Backup candidates stay on standby if a confirmed worker drops out. This keeps short-term
        shifts safer to manage.
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Experience Required</div>
        <select
          className="wm-input"
          value={effectiveExp}
          onChange={(e) => props.onExperience(e.target.value as ExperienceLabel)}
        >
          {expOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          Options shown for:{" "}
          <b style={{ color: "var(--wm-er-text)" }}>{props.category || "General"}</b>
        </div>
      </div>
    </section>
  );
}
