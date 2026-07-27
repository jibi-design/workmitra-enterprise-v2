// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffDepartmentSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\StaffDepartmentSection.tsx

import { useMemo, useState } from "react";
import {
  canManageDepartment,
  getDepartmentHelperText,
  getDepartmentOptions,
  getDisplayDepartment,
  getLatestDepartmentMoveLabel,
} from "../../helpers/staffDepartmentHelpers";
import {
  CARD_STYLE,
  HEADER_ROW_STYLE,
  EYEBROW_STYLE,
  TITLE_STYLE,
  SUBTITLE_STYLE,
  STATUS_BADGE_STYLE,
  INFO_GRID_STYLE,
  INFO_BOX_STYLE,
  INFO_LABEL_STYLE,
  INFO_VALUE_STYLE,
  HISTORY_NOTE_STYLE,
  ACTION_PANEL_STYLE,
  ACTION_TITLE_STYLE,
  INPUT_STYLE,
  PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE,
  DIVIDER_STYLE,
  MESSAGE_STYLE,
  LOCKED_NOTE_STYLE,
} from "./StaffDepartmentSection.styles";
import {
  myStaffStorage,
  type StaffDepartment,
  type StaffRecord,
} from "../../storage/myStaff.storage";

type Props = {
  record: StaffRecord;
  departments: StaffDepartment[];
};

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
