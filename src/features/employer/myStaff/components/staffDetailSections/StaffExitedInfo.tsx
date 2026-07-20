// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffExitedInfo.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\StaffExitedInfo.tsx

import { formatDate } from "../../helpers/staffDetailHelpers";
import type { StaffRecord } from "../../storage/myStaff.storage";
import { FieldRow } from "../staffDetailComponents";

type ExitedInfoProps = {
  record: StaffRecord;
};

export function ExitedInfo({ record }: ExitedInfoProps) {
  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div className="wm-er-card" style={{ borderLeft: "4px solid #6b7280", padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
          Employment Ended
        </div>

        {record.exitedAt && <FieldRow label="Exit Date" value={formatDate(record.exitedAt)} />}

        {record.exitReason && (
          <FieldRow
            label="Reason"
            value={record.exitReason
              .replace("_", " ")
              .replace(/\b\w/g, (character) => character.toUpperCase())}
          />
        )}

        {typeof record.employerRating === "number" && (
          <FieldRow label="Your Rating" value={`${record.employerRating}/5`} />
        )}

        {record.employerComment && <FieldRow label="Your Comment" value={record.employerComment} />}
      </div>
    </div>
  );
}
