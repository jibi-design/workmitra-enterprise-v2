// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnounceShiftRow.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnounceShiftRow.tsx

import type { AnnouncementShift } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconDelete } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";
import { AnnounceShiftBreakSection } from "./AnnounceShiftBreakSection";

type Props = {
  shift: AnnouncementShift;
  index: number;
  onUpdate: (shiftId: string, field: keyof AnnouncementShift, value: string | boolean) => void;
  onRemove: (shiftId: string) => void;
  onEnableBreak: (shiftId: string) => void;
};

const shiftRowStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
  display: "grid",
  gap: 8,
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

export function AnnounceShiftRow({ shift, index, onUpdate, onRemove, onEnableBreak }: Props) {
  return (
    <div style={shiftRowStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)" }}>
          Shift {index + 1}
          {shift.hasBreak && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 10,
                fontWeight: 800,
                color: AMBER,
                padding: "1px 6px",
                borderRadius: 999,
                background: AMBER_BG,
              }}
            >
              BREAK
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove(shift.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--wm-error)",
            padding: 2,
          }}
        >
          <IconDelete />
        </button>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>
          Shift Name
        </label>

        <input
          type="text"
          value={shift.name}
          onChange={(event) => onUpdate(shift.id, "name", event.target.value)}
          placeholder="e.g. Morning, Evening, Full Day"
          className="wm-input"
          style={{ width: "100%", fontSize: 13, marginTop: 2 }}
          maxLength={30}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>
            {shift.hasBreak ? "Duty 1 Start" : "Start Time"}
          </label>

          <input
            type="time"
            value={shift.startTime}
            onChange={(event) => onUpdate(shift.id, "startTime", event.target.value)}
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
            onChange={(event) => {
              if (shift.hasBreak) {
                onUpdate(shift.id, "breakStartTime", event.target.value);
                return;
              }

              onUpdate(shift.id, "endTime", event.target.value);
            }}
            style={{ ...timeInputStyle, marginTop: 2 }}
          />
        </div>
      </div>

      <div style={toggleWrapStyle}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>Add Break</div>
          <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 1 }}>
            Split into two duty periods with a break
          </div>
        </div>

        <div
          style={toggleTrackStyle(shift.hasBreak)}
          onClick={() => {
            if (!shift.hasBreak) {
              onEnableBreak(shift.id);
              return;
            }

            onUpdate(shift.id, "hasBreak", false);
          }}
          role="switch"
          aria-checked={shift.hasBreak}
        >
          <div style={toggleKnobStyle(shift.hasBreak)} />
        </div>
      </div>

      {shift.hasBreak && (
        <AnnounceShiftBreakSection
          shift={shift}
          timeInputStyle={timeInputStyle}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
