// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffNotesSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffNotesSection.tsx

import type { WorkforceStaff } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconEdit } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  staff: WorkforceStaff;
  editingBio: boolean;
  bioVal: string;
  plusVal: string;
  commentVal: string;
  onEditOrSaveBio: () => void;
  onCancelBioEdit: () => void;
  onBioChange: (value: string) => void;
  onPlusChange: (value: string) => void;
  onCommentChange: (value: string) => void;
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--wm-er-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const inlineEditBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: "var(--wm-radius-8)",
  display: "inline-flex",
  alignItems: "center",
};

export function EmployerWorkforceStaffNotesSection({
  staff,
  editingBio,
  bioVal,
  plusVal,
  commentVal,
  onEditOrSaveBio,
  onCancelBioEdit,
  onBioChange,
  onPlusChange,
  onCommentChange,
}: Props) {
  return (
    <div className="wm-er-card" style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)" }}>Notes</div>

        <button
          type="button"
          onClick={onEditOrSaveBio}
          style={{ ...inlineEditBtnStyle, fontSize: 12, fontWeight: 700 }}
        >
          {editingBio ? "Save" : <IconEdit />}
        </button>
      </div>

      {!editingBio ? (
        <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
          <div>
            <div style={fieldLabelStyle}>Bio</div>
            <div
              style={{
                fontSize: 13,
                color: staff.bio ? "var(--wm-er-text)" : "var(--wm-er-muted)",
                marginTop: 2,
              }}
            >
              {staff.bio || "No bio added"}
            </div>
          </div>

          <div>
            <div style={fieldLabelStyle}>Plus Points</div>
            <div
              style={{
                fontSize: 13,
                color: staff.plusPoints ? "var(--wm-er-text)" : "var(--wm-er-muted)",
                marginTop: 2,
              }}
            >
              {staff.plusPoints || "None added"}
            </div>
          </div>

          <div>
            <div style={fieldLabelStyle}>Rating Comment</div>
            <div
              style={{
                fontSize: 13,
                color: staff.ratingComment ? "var(--wm-er-text)" : "var(--wm-er-muted)",
                marginTop: 2,
              }}
            >
              {staff.ratingComment || "No comment"}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
          <div>
            <label style={fieldLabelStyle}>Bio</label>
            <textarea
              className="wm-input"
              value={bioVal}
              onChange={(event) => onBioChange(event.target.value)}
              rows={2}
              style={{ width: "100%", fontSize: 13, marginTop: 4, resize: "vertical" }}
              maxLength={300}
              placeholder="Short description about this staff member"
            />
          </div>

          <div>
            <label style={fieldLabelStyle}>Plus Points</label>
            <textarea
              className="wm-input"
              value={plusVal}
              onChange={(event) => onPlusChange(event.target.value)}
              rows={2}
              style={{ width: "100%", fontSize: 13, marginTop: 4, resize: "vertical" }}
              maxLength={300}
              placeholder="Strengths, positive qualities"
            />
          </div>

          <div>
            <label style={fieldLabelStyle}>Rating Comment</label>
            <textarea
              className="wm-input"
              value={commentVal}
              onChange={(event) => onCommentChange(event.target.value)}
              rows={2}
              style={{ width: "100%", fontSize: 13, marginTop: 4, resize: "vertical" }}
              maxLength={200}
              placeholder="Comment about their work quality"
            />
          </div>

          <button
            type="button"
            onClick={onCancelBioEdit}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--wm-er-muted)",
              fontWeight: 700,
              justifySelf: "start",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
