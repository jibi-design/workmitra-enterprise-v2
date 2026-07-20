// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnounceShiftBreakSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnounceShiftBreakSection.tsx

import type { AnnouncementShift } from "../../../../shared/domains/workforce/types/workforceTypes";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  shift: AnnouncementShift;
  timeInputStyle: React.CSSProperties;
  onUpdate: (shiftId: string, field: keyof AnnouncementShift, value: string | boolean) => void;
};

const breakSectionStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px dashed ${AMBER}`,
  background: AMBER_BG,
  display: "grid",
  gap: 8,
  marginTop: 4,
};

export function AnnounceShiftBreakSection({ shift, timeInputStyle, onUpdate }: Props) {
  return (
    <div style={breakSectionStyle}>
      <div style={{ fontSize: 12, fontWeight: 800, color: AMBER }}>Break Period</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>
            Break Start
          </label>

          <input
            type="time"
            value={shift.breakStartTime}
            onChange={(event) => onUpdate(shift.id, "breakStartTime", event.target.value)}
            style={{ ...timeInputStyle, marginTop: 2 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>
            Break End
          </label>

          <input
            type="time"
            value={shift.breakEndTime}
            onChange={(event) => onUpdate(shift.id, "breakEndTime", event.target.value)}
            style={{ ...timeInputStyle, marginTop: 2 }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>
            Duty 2 Start
          </label>

          <input
            type="time"
            value={shift.breakEndTime}
            disabled
            style={{ ...timeInputStyle, marginTop: 2, opacity: 0.6 }}
          />

          <div style={{ fontSize: 9, color: "var(--wm-er-muted)", marginTop: 2 }}>
            Same as Break End
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-text)" }}>
            Duty 2 End
          </label>

          <input
            type="time"
            value={shift.endTime}
            onChange={(event) => onUpdate(shift.id, "endTime", event.target.value)}
            style={{ ...timeInputStyle, marginTop: 2 }}
          />
        </div>
      </div>

      <div style={{ fontSize: 10, color: "var(--wm-er-muted)", lineHeight: 1.4 }}>
        Duty 1: {shift.startTime || "—"} to {shift.breakStartTime || "—"} · Break:{" "}
        {shift.breakStartTime || "—"} to {shift.breakEndTime || "—"} · Duty 2:{" "}
        {shift.breakEndTime || "—"} to {shift.endTime || "—"}
      </div>
    </div>
  );
}
