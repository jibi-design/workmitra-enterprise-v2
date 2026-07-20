// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffDepartmentSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\StaffDepartmentSection.tsx

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  canManageDepartment,
  getDepartmentHelperText,
  getDepartmentOptions,
  getDisplayDepartment,
  getLatestDepartmentMoveLabel,
} from "../../helpers/staffDepartmentHelpers";
import {
  myStaffStorage,
  type StaffDepartment,
  type StaffRecord,
} from "../../storage/myStaff.storage";

type Props = {
  record: StaffRecord;
  departments: StaffDepartment[];
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const TEXT = "var(--wm-er-text, #1e293b)";
const MUTED = "var(--wm-er-muted, #64748b)";

export function StaffDepartmentSection({ record, departments }: Props) {
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(record.departmentId ?? "");
  const [message, setMessage] = useState("");

  const sortedDepartments = useMemo(() => getDepartmentOptions(departments), [departments]);
  const canManage = canManageDepartment(record);

  const handleCreateDepartment = () => {
    const name = newDepartmentName.trim();
    if (!name) {
      setMessage("Enter a department name first.");
      return;
    }

    const departmentId = myStaffStorage.addDepartment(name);
    if (!departmentId) {
      setMessage("Department could not be created.");
      return;
    }

    myStaffStorage.assignStaffDepartment(
      record.id,
      departmentId,
      "Assigned after department creation",
    );
    setSelectedDepartmentId(departmentId);
    setNewDepartmentName("");
    setMessage("Department created and assigned.");
  };

  const handleMoveDepartment = () => {
    if (!selectedDepartmentId) {
      setMessage("Select a department first.");
      return;
    }

    const success = myStaffStorage.assignStaffDepartment(
      record.id,
      selectedDepartmentId,
      "Moved from staff detail",
    );
    setMessage(success ? "Department updated." : "Department could not be updated.");
  };

  return (
    <div style={{ padding: "12px 20px 0" }}>
      <section className="wm-er-card" style={CARD_STYLE}>
        <div style={HEADER_ROW_STYLE}>
          <div style={{ minWidth: 0 }}>
            <div style={EYEBROW_STYLE}>Department & role</div>
            <div style={TITLE_STYLE}>Staff Department</div>
            <div style={SUBTITLE_STYLE}>{getDepartmentHelperText(record)}</div>
          </div>

          <span style={STATUS_BADGE_STYLE}>{getDisplayDepartment(record)}</span>
        </div>

        <div style={INFO_GRID_STYLE}>
          <InfoBox label="Current department" value={getDisplayDepartment(record)} />
          <InfoBox label="Current role" value={record.jobTitle || "Not recorded"} />
        </div>

        <div style={HISTORY_NOTE_STYLE}>{getLatestDepartmentMoveLabel(record)}</div>

        {canManage ? (
          <div style={ACTION_PANEL_STYLE}>
            <div style={ACTION_TITLE_STYLE}>Move or assign department</div>

            <select
              value={selectedDepartmentId}
              onChange={(event) => setSelectedDepartmentId(event.target.value)}
              style={INPUT_STYLE}
            >
              <option value="">Select department</option>
              {sortedDepartments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            <button type="button" onClick={handleMoveDepartment} style={SECONDARY_BUTTON_STYLE}>
              Move to Department
            </button>

            <div style={DIVIDER_STYLE} />

            <input
              value={newDepartmentName}
              onChange={(event) => setNewDepartmentName(event.target.value)}
              placeholder="Create custom department"
              style={INPUT_STYLE}
            />

            <button type="button" onClick={handleCreateDepartment} style={PRIMARY_BUTTON_STYLE}>
              Create & Assign
            </button>

            {message && <div style={MESSAGE_STYLE}>{message}</div>}
          </div>
        ) : (
          <div style={LOCKED_NOTE_STYLE}>
            Department changes are locked after employment is completed. Use Completed Career
            Records for lookup and history.
          </div>
        )}
      </section>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={INFO_BOX_STYLE}>
      <div style={INFO_LABEL_STYLE}>{label}</div>
      <div style={INFO_VALUE_STYLE}>{value}</div>
    </div>
  );
}

const CARD_STYLE: CSSProperties = {
  padding: 16,
  borderRadius: 24,
  border: "1px solid rgba(29,78,216,0.14)",
  background:
    "radial-gradient(circle at 94% 0%, rgba(29,78,216,0.08), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
  boxShadow: "0 12px 26px rgba(15,23,42,0.055)",
};

const HEADER_ROW_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
};

const EYEBROW_STYLE: CSSProperties = {
  fontSize: 10,
  fontWeight: 950,
  letterSpacing: 0.55,
  color: CAREER_BLUE,
  textTransform: "uppercase",
};

const TITLE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 14.5,
  fontWeight: 950,
  color: TEXT,
};

const SUBTITLE_STYLE: CSSProperties = {
  marginTop: 5,
  fontSize: 11.7,
  fontWeight: 720,
  lineHeight: 1.45,
  color: MUTED,
};

const STATUS_BADGE_STYLE: CSSProperties = {
  flexShrink: 0,
  maxWidth: 140,
  padding: "5px 9px",
  borderRadius: 999,
  background: "rgba(29,78,216,0.08)",
  color: CAREER_BLUE_DEEP,
  border: "1px solid rgba(29,78,216,0.14)",
  fontSize: 10.5,
  fontWeight: 950,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const INFO_GRID_STYLE: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const INFO_BOX_STYLE: CSSProperties = {
  padding: "9px 10px",
  borderRadius: 15,
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(29,78,216,0.08)",
};

const INFO_LABEL_STYLE: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 900,
  color: MUTED,
};

const INFO_VALUE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 950,
  color: TEXT,
  lineHeight: 1.25,
};

const HISTORY_NOTE_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "9px 10px",
  borderRadius: 14,
  background: "rgba(29,78,216,0.055)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11.2,
  fontWeight: 830,
  lineHeight: 1.4,
};

const ACTION_PANEL_STYLE: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gap: 8,
};

const ACTION_TITLE_STYLE: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 950,
  color: TEXT,
};

const INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 39,
  borderRadius: 13,
  border: "1px solid rgba(148,163,184,0.24)",
  background: "#fff",
  padding: "0 11px",
  color: TEXT,
  fontSize: 12,
  fontWeight: 760,
  outline: "none",
};

const PRIMARY_BUTTON_STYLE: CSSProperties = {
  minHeight: 39,
  borderRadius: 13,
  border: "1px solid rgba(29,78,216,0.16)",
  background: CAREER_BLUE,
  color: "#fff",
  fontSize: 12,
  fontWeight: 950,
  cursor: "pointer",
};

const SECONDARY_BUTTON_STYLE: CSSProperties = {
  ...PRIMARY_BUTTON_STYLE,
  background: "rgba(255,255,255,0.86)",
  color: CAREER_BLUE_DEEP,
};

const DIVIDER_STYLE: CSSProperties = {
  height: 1,
  background: "rgba(148,163,184,0.16)",
  margin: "2px 0",
};

const MESSAGE_STYLE: CSSProperties = {
  padding: "8px 9px",
  borderRadius: 12,
  background: "rgba(29,78,216,0.06)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11,
  fontWeight: 850,
};

const LOCKED_NOTE_STYLE: CSSProperties = {
  marginTop: 12,
  padding: "10px 11px",
  borderRadius: 15,
  background: "rgba(15,23,42,0.045)",
  color: MUTED,
  fontSize: 11.4,
  fontWeight: 760,
  lineHeight: 1.45,
};
