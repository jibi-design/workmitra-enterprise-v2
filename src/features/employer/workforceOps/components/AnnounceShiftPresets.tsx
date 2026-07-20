// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnounceShiftPresets.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnounceShiftPresets.tsx

import type { AnnouncementShift } from "../../../../shared/domains/workforce/types/workforceTypes";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

export type ShiftPreset = {
  name: string;
  startTime: string;
  endTime: string;
};

const SHIFT_PRESETS: ShiftPreset[] = [
  { name: "Morning", startTime: "06:00", endTime: "14:00" },
  { name: "Evening", startTime: "14:00", endTime: "22:00" },
  { name: "Night", startTime: "22:00", endTime: "06:00" },
  { name: "Full Day", startTime: "08:00", endTime: "18:00" },
];

const presetBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-bg)",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-text)",
  textAlign: "center",
};

type Props = {
  shifts: AnnouncementShift[];
  onAddPreset: (preset: ShiftPreset) => void;
};

export function AnnounceShiftPresets({ shifts, onAddPreset }: Props) {
  return (
    <div className="wm-er-card">
      <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 6 }}>
        Quick Add
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 10 }}>
        Tap to add common shift types, or create a custom one below.
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SHIFT_PRESETS.map((preset) => {
          const exists = shifts.some(
            (shift) => shift.name.toLowerCase() === preset.name.toLowerCase(),
          );

          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onAddPreset(preset)}
              disabled={exists}
              style={{
                ...presetBtnStyle,
                background: exists ? AMBER_BG : "var(--wm-er-bg)",
                color: exists ? AMBER : "var(--wm-er-text)",
                opacity: exists ? 0.7 : 1,
                cursor: exists ? "default" : "pointer",
              }}
            >
              {exists ? "✓ " : ""}
              {preset.name}

              <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                {preset.startTime} — {preset.endTime}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
