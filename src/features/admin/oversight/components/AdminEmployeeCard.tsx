// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminEmployeeCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminEmployeeCard.tsx

import type { AdminEmployeeRecord } from "../helpers/adminDataHelpers";
import { ActionRow, Stat, StatusBadge, type UserActionHandler } from "./AdminUserSharedParts";

type Props = {
  employee: AdminEmployeeRecord;
  onAction: UserActionHandler;
};

export function AdminEmployeeCard({ employee, onAction }: Props) {
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
            {employee.fullName || "Unnamed Employee"}
          </div>

          <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 2 }}>
            ID: {employee.uniqueId}
            {employee.city ? ` · ${employee.city}` : ""}
          </div>
        </div>

        <StatusBadge status={employee.status} />
      </div>

      <div style={{ marginTop: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--wm-ad-navy-400)",
            marginBottom: 4,
          }}
        >
          <span>Profile completion</span>

          <span
            style={{
              color:
                employee.profileCompletion >= 80
                  ? "var(--wm-ad-green)"
                  : employee.profileCompletion >= 50
                    ? "#d97706"
                    : "var(--wm-ad-danger)",
            }}
          >
            {employee.profileCompletion}%
          </span>
        </div>

        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "var(--wm-ad-divider)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              width: `${employee.profileCompletion}%`,
              background:
                employee.profileCompletion >= 80
                  ? "var(--wm-ad-green)"
                  : employee.profileCompletion >= 50
                    ? "#d97706"
                    : "var(--wm-ad-danger)",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <Stat label="Shift Apps" value={employee.shiftApplications} />
        <Stat label="Career Apps" value={employee.careerApplications} />
        <Stat label="Total" value={employee.totalApplications} />
      </div>

      {employee.skills.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 8 }}>
          Skills: {employee.skills.slice(0, 5).join(", ")}
          {employee.skills.length > 5 ? ` +${employee.skills.length - 5}` : ""}
        </div>
      )}

      <ActionRow
        id={employee.id}
        role="employee"
        name={employee.fullName}
        status={employee.status}
        onAction={onAction}
      />
    </div>
  );
}
