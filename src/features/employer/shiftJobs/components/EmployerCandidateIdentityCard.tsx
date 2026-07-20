// App name: Job Mitra
// File name: EmployerCandidateIdentityCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerCandidateIdentityCard.tsx

import {
  formatCandidateDateTime,
  getCandidateStatusColor,
} from "../helpers/employerCandidateDetail.helpers";
import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";

type EmployerCandidateIdentityCardProps = {
  app: EmployeeShiftApplication;
  displayId: string;
};

export function EmployerCandidateIdentityCard({
  app,
  displayId,
}: EmployerCandidateIdentityCardProps) {
  const statusColor = getCandidateStatusColor(app.status);

  return (
    <div
      style={{
        marginTop: 12,
        padding: "16px",
        borderRadius: 14,
        background: "rgba(15,118,110,0.06)",
        border: "1px solid rgba(15,118,110,0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: "var(--wm-er-muted)",
            letterSpacing: 0.5,
          }}
        >
          CANDIDATE ID
        </div>

        <div
          style={{
            fontSize: 26,
            fontWeight: 1000,
            color: "var(--wm-er-accent-shift)",
            letterSpacing: 2,
            marginTop: 2,
          }}
        >
          {displayId}
        </div>

        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 4 }}>
          Applied: {formatCandidateDateTime(app.createdAt)}
        </div>
      </div>

      <span
        style={{
          fontSize: 11,
          fontWeight: 900,
          padding: "4px 12px",
          borderRadius: 999,
          background: `${statusColor}18`,
          color: statusColor,
          border: `1px solid ${statusColor}33`,
          whiteSpace: "nowrap",
          textTransform: "capitalize",
        }}
      >
        {app.status}
      </span>
    </div>
  );
}
