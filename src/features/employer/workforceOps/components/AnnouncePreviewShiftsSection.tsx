// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnouncePreviewShiftsSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnouncePreviewShiftsSection.tsx

import type { AnnounceFormData } from "../types/announceForm.types";
import { IconEdit } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  form: AnnounceFormData;
  onEdit: (step: Step) => void;
  sectionStyle: React.CSSProperties;
  sectionHeaderStyle: React.CSSProperties;
  sectionLabelStyle: React.CSSProperties;
  editBtnStyle: React.CSSProperties;
};

export function AnnouncePreviewShiftsSection({
  form,
  onEdit,
  sectionStyle,
  sectionHeaderStyle,
  sectionLabelStyle,
  editBtnStyle,
}: Props) {
  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div style={sectionLabelStyle}>Shifts ({form.shifts.length})</div>
        <button type="button" onClick={() => onEdit(2)} style={editBtnStyle}>
          <IconEdit /> Edit
        </button>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {form.shifts.map((shift) => (
          <div key={shift.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)" }}>
                {shift.name}
                {shift.hasBreak && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 9,
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
              </span>

              <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
                {shift.startTime} — {shift.endTime}
              </span>
            </div>

            {shift.hasBreak && (
              <div
                style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3, paddingLeft: 4 }}
              >
                Duty 1: {shift.startTime} – {shift.breakStartTime} · Break: {shift.breakStartTime} –{" "}
                {shift.breakEndTime} · Duty 2: {shift.breakEndTime} – {shift.endTime}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
