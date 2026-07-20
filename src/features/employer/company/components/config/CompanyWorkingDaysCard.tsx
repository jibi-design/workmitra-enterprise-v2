// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CompanyWorkingDaysCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\components\config\CompanyWorkingDaysCard.tsx

import type { CSSProperties } from "react";
import {
  companyConfigStorage,
  DAY_LABELS,
  type CompanyConfig,
  type WeekDay,
  type WorkingDaysPreset,
} from "../../storage/companyConfig.storage";

const PURPLE = "#7c3aed";
const BORDER_COLOR = "#d1d5db";

const sectionTitle: CSSProperties = {
  fontWeight: 900,
  fontSize: 13,
  color: "var(--wm-er-text)",
  marginBottom: 4,
};

const sectionHint: CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted)",
  lineHeight: 1.5,
  marginBottom: 12,
  paddingBottom: 10,
  borderBottom: `1px solid ${BORDER_COLOR}`,
};

const ALL_DAYS: WeekDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

type Props = {
  config: CompanyConfig;
};

export function CompanyWorkingDaysCard({ config }: Props) {
  const handlePresetChange = (preset: WorkingDaysPreset) => {
    companyConfigStorage.setWorkingDays(preset);
  };

  const handleCustomToggle = (day: WeekDay) => {
    const current = config.customWorkingDays;
    const updated = current.includes(day)
      ? current.filter((item) => item !== day)
      : [...current, day];

    companyConfigStorage.setWorkingDays("custom", updated);
  };

  const presets: { value: WorkingDaysPreset; label: string }[] = [
    { value: "mon_fri", label: "Monday to Friday" },
    { value: "mon_sat", label: "Monday to Saturday" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div>
      <div style={sectionTitle}>Working Days</div>

      <div style={sectionHint}>
        Select which days your company operates. Days not selected will be automatically marked as
        &ldquo;Off&rdquo; in attendance for all employees. You won&rsquo;t need to mark weekends
        manually anymore.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {presets.map((preset) => {
          const isSelected = config.workingDaysPreset === preset.value;

          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetChange(preset.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                border: isSelected ? `2px solid ${PURPLE}` : `1.5px solid ${BORDER_COLOR}`,
                borderRadius: 8,
                background: isSelected ? "var(--wm-er-accent-hr-light)" : "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isSelected ? 800 : 600,
                color: "var(--wm-er-text)",
                textAlign: "left",
                width: "100%",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: `2px solid ${isSelected ? PURPLE : BORDER_COLOR}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isSelected && (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: PURPLE }} />
                )}
              </span>

              {preset.label}
            </button>
          );
        })}
      </div>

      {config.workingDaysPreset === "custom" && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 6 }}>
            Tap to select your working days:
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ALL_DAYS.map((day) => {
              const isActive = config.customWorkingDays.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleCustomToggle(day)}
                  style={{
                    padding: "7px 14px",
                    border: isActive ? "2px solid #15803d" : `1.5px solid ${BORDER_COLOR}`,
                    borderRadius: 8,
                    background: isActive ? "#dcfce7" : "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "#15803d" : "var(--wm-er-muted)",
                  }}
                >
                  {DAY_LABELS[day]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {config.weekendDays.length > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 6,
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            fontSize: 12,
            color: "#0369a1",
          }}
        >
          Weekends (auto Off): {config.weekendDays.map((day) => DAY_LABELS[day]).join(", ")}
        </div>
      )}
    </div>
  );
}
