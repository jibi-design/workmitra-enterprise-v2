// src/features/employer/workforceOps/components/AnnounceStepShifts.tsx
//
// Step 2: Define shifts for the announcement.
// Preset options (Morning/Evening/Full Day) + custom shifts + break shift support.

import { useState, useCallback } from "react";
import type { AnnouncementShift } from "../types/workforceTypes";
import { validateShifts } from "../helpers/workforceValidation";
import { uid } from "../helpers/workforceStorageUtils";
import { IconPlus, IconDelete } from "./workforceIcons";
import { AMBER, AMBER_BG } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Presets                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

const SHIFT_PRESETS: Array<{ name: string; startTime: string; endTime: string }> = [
  { name: "Morning", startTime: "06:00", endTime: "14:00" },
  { name: "Evening", startTime: "14:00", endTime: "22:00" },
  { name: "Night", startTime: "22:00", endTime: "06:00" },
  { name: "Full Day", startTime: "08:00", endTime: "18:00" },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  shifts: AnnouncementShift[];
  onChange: (shifts: AnnouncementShift[]) => void;
  onNext: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const shiftRowStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
  display: "grid",
  gap: 8,
};

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

const timeInputStyle: React.CSSProperties = {
  fontSize: 13,
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid var(--wm-er-border)",
  background: "#fff",
  color: "var(--wm-er-text)",
  width: "100%",
};

const toggleWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 10px",
  borderRadius: 8,
  background: "var(--wm-er-bg)",
  marginTop: 4,
};

const toggleTrackStyle = (on: boolean): React.CSSProperties => ({
  width: 36,
  height: 20,
  borderRadius: 10,
  background: on ? AMBER : "var(--wm-er-border)",
  position: "relative",
  cursor: "pointer",
  transition: "background 0.2s",
  flexShrink: 0,
});

const toggleKnobStyle = (on: boolean): React.CSSProperties => ({
  width: 16,
  height: 16,
  borderRadius: 8,
  background: "#fff",
  position: "absolute",
  top: 2,
  left: on ? 18 : 2,
  transition: "left 0.2s",
  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
});

const breakSectionStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px dashed ${AMBER}`,
  background: AMBER_BG,
  display: "grid",
  gap: 8,
  marginTop: 4,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function AnnounceStepShifts({ shifts, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<string[]>([]);

  const addPreset = useCallback((preset: typeof SHIFT_PRESETS[number]) => {
    const exists = shifts.some((s) => s.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) return;
    const newShift: AnnouncementShift = {
      id: uid("ws"),
      name: preset.name,
      startTime: preset.startTime,
      endTime: preset.endTime,
      hasBreak: false,
      breakStartTime: "",
      breakEndTime: "",
    };
    onChange([...shifts, newShift]);
    setErrors([]);
  }, [shifts, onChange]);

  const addCustom = useCallback(() => {
    const newShift: AnnouncementShift = {
      id: uid("ws"),
      name: "",
      startTime: "09:00",
      endTime: "17:00",
      hasBreak: false,
      breakStartTime: "",
      breakEndTime: "",
    };
    onChange([...shifts, newShift]);
    setErrors([]);
  }, [shifts, onChange]);

  const updateShift = useCallback((shiftId: string, field: keyof AnnouncementShift, value: string | boolean) => {
    onChange(shifts.map((s) => {
      if (s.id !== shiftId) return s;
      const updated = { ...s, [field]: value };
      if (field === "hasBreak" && value === false) {
        updated.breakStartTime = "";
        updated.breakEndTime = "";
      }
      return updated;
    }));
    setErrors([]);
  }, [shifts, onChange]);

  const removeShift = useCallback((shiftId: string) => {
    onChange(shifts.filter((s) => s.id !== shiftId));
    setErrors([]);
  }, [shifts, onChange]);

  function handleNext() {
    const result = validateShifts(shifts);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    onNext();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Presets */}
      <div className="wm-er-card">
        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 6 }}>
          Quick Add
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 10 }}>
          Tap to add common shift types, or create a custom one below.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SHIFT_PRESETS.map((preset) => {
            const exists = shifts.some((s) => s.name.toLowerCase() === preset.name.toLowerCase());
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => addPreset(preset)}
                disabled={exists}
                style={{
                  ...presetBtnStyle,
                  background: exists ? AMBER_BG : "var(--wm-er-bg)",
                  color: exists ? AMBER : "var(--wm-er-text)",
                  opacity: exists ? 0.7 : 1,
                  cursor: exists ? "default" : "pointer",
                }}
              >
                {exists ? "✓ " : ""}{preset.name}
                <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {preset.startTime} — {preset.endTime}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shift List */}
      {shifts.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
            Shifts ({shifts.length})
          </div>
          {shifts.map((shift, index) => (
            <div key={shift.id} style={shiftRowStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)" }}>
                  Shift {index + 1}
                  {shift.hasBreak && (
                    <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, color: AMBER, padding: "1px 6px", borderRadius: 999, background: AMBER_BG }}>
                      BREAK
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeShift(shift.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--wm-error)", padding: 2 }}
                >
                  <IconDelete />
                </button>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>Shift Name</label>
                <input
                  type="text"
                  value={shift.name}
                  onChange={(e) => updateShift(shift.id, "name", e.target.value)}
                  placeholder="e.g. Morning, Evening, Full Day"
                  className="wm-input"
                  style={{ width: "100%", fontSize: 13, marginTop: 2 }}
                  maxLength={30}
                />
              </div>

              {/* Duty 1 Times (or full shift times when no break) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>
                    {shift.hasBreak ? "Duty 1 Start" : "Start Time"}
                  </label>
                  <input
                    type="time"
                    value={shift.startTime}
                    onChange={(e) => updateShift(shift.id, "startTime", e.target.value)}
                    style={{ ...timeInputStyle, marginTop: 2 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>
                    {shift.hasBreak ? "Duty 1 End" : "End Time"}
                  </label>
                  <input
                    type="time"
                    value={shift.hasBreak ? shift.breakStartTime || shift.endTime : shift.endTime}
                    onChange={(e) => {
                      if (shift.hasBreak) {
                        updateShift(shift.id, "breakStartTime", e.target.value);
                      } else {
                        updateShift(shift.id, "endTime", e.target.value);
                      }
                    }}
                    style={{ ...timeInputStyle, marginTop: 2 }}
                  />
                </div>
              </div>

              {/* Break Toggle */}
              <div style={toggleWrapStyle}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>Add Break</div>
                  <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 1 }}>Split into two duty periods with a break</div>
                </div>
                <div
                  style={toggleTrackStyle(shift.hasBreak)}
                  onClick={() => {
                    if (!shift.hasBreak) {
                      onChange(shifts.map((s) => {
                        if (s.id !== shift.id) return s;
                        return { ...s, hasBreak: true, breakStartTime: s.endTime, breakEndTime: s.endTime };
                      }));
                    } else {
                      updateShift(shift.id, "hasBreak", false);
                    }
                  }}
                  role="switch"
                  aria-checked={shift.hasBreak}
                >
                  <div style={toggleKnobStyle(shift.hasBreak)} />
                </div>
              </div>

              {/* Break Section (visible when hasBreak = true) */}
              {shift.hasBreak && (
                <div style={breakSectionStyle}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: AMBER }}>Break Period</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>Break Start</label>
                      <input
                        type="time"
                        value={shift.breakStartTime}
                        onChange={(e) => updateShift(shift.id, "breakStartTime", e.target.value)}
                        style={{ ...timeInputStyle, marginTop: 2 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>Break End</label>
                      <input
                        type="time"
                        value={shift.breakEndTime}
                        onChange={(e) => updateShift(shift.id, "breakEndTime", e.target.value)}
                        style={{ ...timeInputStyle, marginTop: 2 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>Duty 2 Start</label>
                      <input
                        type="time"
                        value={shift.breakEndTime}
                        disabled
                        style={{ ...timeInputStyle, marginTop: 2, opacity: 0.6 }}
                      />
                      <div style={{ fontSize: 9, color: "var(--wm-er-muted)", marginTop: 2 }}>Same as Break End</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>Duty 2 End</label>
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={(e) => updateShift(shift.id, "endTime", e.target.value)}
                        style={{ ...timeInputStyle, marginTop: 2 }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: 10, color: "var(--wm-er-muted)", lineHeight: 1.4 }}>
                    Duty 1: {shift.startTime || "—"} to {shift.breakStartTime || "—"} · Break: {shift.breakStartTime || "—"} to {shift.breakEndTime || "—"} · Duty 2: {shift.breakEndTime || "—"} to {shift.endTime || "—"}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Shift */}
      <button
        type="button"
        onClick={addCustom}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "var(--wm-radius-10)",
          border: "1px dashed var(--wm-er-border)",
          background: "var(--wm-er-bg)",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 700,
          color: AMBER,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <IconPlus /> Add Custom Shift or Break Shift
      </button>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: "var(--wm-error)" }}>{e}</div>
          ))}
        </div>
      )}

      {/* Next */}
      <button
        className="wm-primarybtn"
        type="button"
        onClick={handleNext}
        disabled={shifts.length === 0}
        style={{
          width: "100%",
          background: shifts.length > 0 ? AMBER : "var(--wm-er-muted)",
          fontSize: 14,
          padding: "12px",
        }}
      >
        Next — Set Vacancies
      </button>
    </div>
  );
}