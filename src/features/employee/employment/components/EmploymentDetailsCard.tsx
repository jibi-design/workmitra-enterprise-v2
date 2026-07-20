// App name: Job Mitra
// File name: EmploymentDetailsCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\EmploymentDetailsCard.tsx

import { useState } from "react";
import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import {
  durationText,
  exitReasonLabel,
  formatDate,
  statusMeta,
} from "../helpers/employmentDetailHelpers";
import { FieldRow } from "./EmploymentSharedUI";

type Props = {
  record: EmploymentRecord;
};

const CONSOLE_BLUE = "var(--wm-er-accent-console, #0369a1)";
const TEXT = "var(--wm-emp-text, var(--wm-er-text, #1e293b))";
const MUTED = "var(--wm-emp-muted, var(--wm-er-muted, #64748b))";

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 11px",
        borderRadius: 16,
        background: "rgba(3,105,161,0.055)",
        border: "1px solid rgba(3,105,161,0.11)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 10.5, fontWeight: 850, color: MUTED, lineHeight: 1.2 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 950, color: TEXT, lineHeight: 1.25 }}>
        {value}
      </div>
    </div>
  );
}

export function EmploymentDetailsCard({ record }: Props) {
  const [nowMs] = useState(() => Date.now());
  const sm = statusMeta(record.status);
  const duration = durationText(record.joinedAt, record.exitedAt ?? nowMs);
  const isExited = record.status === "exited";

  return (
    <div className="wm-ee-card" style={{ border: "1px solid rgba(3,105,161,0.12)" }}>
      <div style={{ fontWeight: 950, fontSize: 14, color: TEXT, marginBottom: 10 }}>
        Employment Details
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}
      >
        <SummaryPill label="Joined" value={formatDate(record.joinedAt)} />
        <SummaryPill label="Duration" value={duration} />
        <SummaryPill label="Status" value={sm.label} />
      </div>

      <div style={{ height: 1, background: "rgba(148,163,184,0.16)", marginBottom: 8 }} />

      <FieldRow label="Company" value={record.companyName} />
      <FieldRow label="Job Title" value={record.jobTitle} />
      {record.department && <FieldRow label="Department" value={record.department} />}
      {record.location && <FieldRow label="Location" value={record.location} />}
      {record.exitedAt && <FieldRow label="Exited" value={formatDate(record.exitedAt)} />}
      {isExited && record.exitReason && (
        <FieldRow label="Exit Reason" value={exitReasonLabel(record.exitReason)} />
      )}
      <FieldRow
        label="Hired Via"
        value={record.hireMethod === "via_app" ? "Job Mitra App" : "Manually Added"}
      />

      <div
        style={{
          marginTop: 10,
          padding: "9px 10px",
          borderRadius: 14,
          background: "rgba(3,105,161,0.055)",
          color: CONSOLE_BLUE,
          fontSize: 11.5,
          fontWeight: 850,
          lineHeight: 1.45,
        }}
      >
        This record is part of your Career Jobs employment lifecycle.
      </div>
    </div>
  );
}
