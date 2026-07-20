// App: Job Mitra / WorkMitra_Enterprise_v2
// File: HRCandidateIdentity.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\hrCandidateCard\HRCandidateIdentity.tsx

import type { HRCandidateRecord } from "../../types/hrManagement.types";
import { HRStatusBadge } from "../HRStatusBadge";
import { HRCandidateContextLine } from "./HRCandidateContextLine";

type Props = {
  record: HRCandidateRecord;
};

export function HRCandidateIdentity({ record }: Props) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: "var(--wm-er-text, #0f172a)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {record.employeeName}
        </span>

        <HRStatusBadge status={record.status} />
      </div>

      <div
        style={{
          fontSize: 11,
          color: "var(--wm-er-muted, #64748b)",
          marginTop: 2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {record.jobTitle}
        {record.department ? ` — ${record.department}` : ""}
      </div>

      <HRCandidateContextLine record={record} />
    </div>
  );
}
