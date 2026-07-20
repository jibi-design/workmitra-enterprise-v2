// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminEmployerCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminEmployerCard.tsx

import type { AdminEmployerRecord } from "../helpers/adminDataHelpers";
import { ActionRow, Stat, StatusBadge, type UserActionHandler } from "./AdminUserSharedParts";

type Props = {
  employer: AdminEmployerRecord;
  onAction: UserActionHandler;
};

export function AdminEmployerCard({ employer, onAction }: Props) {
  return (
    <div className="wm-ad-domainCard" style={{ marginTop: 10, paddingLeft: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-ad-navy)" }}>
            {employer.companyName || "Unnamed Company"}
          </div>

          {employer.fullName && (
            <div style={{ fontSize: 12, color: "var(--wm-ad-navy-500)", marginTop: 2 }}>
              {employer.fullName}
            </div>
          )}

          {employer.location && (
            <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 2 }}>
              {employer.location}
            </div>
          )}
        </div>

        <StatusBadge status={employer.status} />
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <Stat label="Shift Posts" value={employer.totalShiftPosts} />
        <Stat label="Career Posts" value={employer.totalCareerPosts} />
        <Stat label="Total Hires" value={employer.totalHires} />
      </div>

      {employer.industryType && (
        <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 8 }}>
          Industry: {employer.industryType} · Size: {employer.companySize || "N/A"}
        </div>
      )}

      <ActionRow
        id={employer.id}
        role="employer"
        name={employer.companyName}
        status={employer.status}
        onAction={onAction}
      />
    </div>
  );
}
