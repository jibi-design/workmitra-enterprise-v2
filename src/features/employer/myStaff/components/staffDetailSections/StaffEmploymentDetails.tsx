// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffEmploymentDetails.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\StaffEmploymentDetails.tsx

import type { StatusMeta } from "../../helpers/staffDetailHelpers";
import { formatDate } from "../../helpers/staffDetailHelpers";
import type { StaffRecord } from "../../storage/myStaff.storage";
import { FieldRow } from "../staffDetailComponents";

type EmploymentDetailsProps = {
  record: StaffRecord;
  sm: StatusMeta;
  duration: string;
};

export function EmploymentDetails({ record, sm, duration }: EmploymentDetailsProps) {
  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div className="wm-er-card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 4 }}>
          Employment Details
        </div>

        <FieldRow label="Employee Name" value={record.employeeName} />
        <FieldRow label="Unique ID" value={record.employeeUniqueId || "–"} />
        <FieldRow label="Job Title" value={record.jobTitle} />

        {record.departmentName && <FieldRow label="Department" value={record.departmentName} />}
        {!record.departmentName && record.category && (
          <FieldRow label="Job Category" value={record.category} />
        )}

        <FieldRow
          label="Employment Type"
          value={record.employmentType
            .replace("_", " ")
            .replace(/\b\w/g, (character) => character.toUpperCase())}
        />

        <FieldRow
          label={record.status === "joining_pending" ? "Join Status" : "Joined"}
          value={
            record.status === "joining_pending"
              ? "Waiting for employer confirmation"
              : formatDate(record.joinedAt)
          }
        />
        {record.status !== "joining_pending" && <FieldRow label="Duration" value={duration} />}
        <FieldRow label="Status" value={sm.label} />
        <FieldRow
          label="Added Via"
          value={record.addMethod === "via_app" ? "Job Mitra App" : "Manually Added"}
        />
      </div>
    </div>
  );
}
