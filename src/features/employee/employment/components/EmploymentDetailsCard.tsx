// src/features/employee/employment/components/EmploymentDetailsCard.tsx
//
// Employment details card — company, title, department, joined, duration, status.

import { useState } from "react";
import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { formatDate, durationText, statusMeta, exitReasonLabel } from "../helpers/employmentDetailHelpers";
import { FieldRow } from "./EmploymentSharedUI";

type Props = {
  record: EmploymentRecord;
};

export function EmploymentDetailsCard({ record }: Props) {
  const [nowMs] = useState(() => Date.now());
  const sm = statusMeta(record.status);
  const duration = durationText(record.joinedAt, record.exitedAt ?? nowMs);
  const isExited = record.status === "exited";

  return (
    <div className="wm-ee-card">
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))", marginBottom: 4 }}>Employment Details</div>
      <FieldRow label="Company" value={record.companyName} />
      <FieldRow label="Job Title" value={record.jobTitle} />
      {record.department && <FieldRow label="Department" value={record.department} />}
      {record.location && <FieldRow label="Location" value={record.location} />}
      <FieldRow label="Joined" value={formatDate(record.joinedAt)} />
      {record.exitedAt && <FieldRow label="Exited" value={formatDate(record.exitedAt)} />}
      <FieldRow label="Duration" value={duration} />
      <FieldRow label="Status" value={sm.label} />
      {isExited && record.exitReason && <FieldRow label="Exit Reason" value={exitReasonLabel(record.exitReason)} />}
      <FieldRow label="Hired Via" value={record.hireMethod === "via_app" ? "WorkMitra App" : "Manually Added"} />
    </div>
  );
}