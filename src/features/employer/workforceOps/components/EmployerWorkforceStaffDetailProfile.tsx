// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffDetailProfile.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffDetailProfile.tsx

import type { WorkforceStaff } from "../../../../shared/domains/workforce/types/workforceTypes";
import { AMBER_BG, timeAgo } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  staff: WorkforceStaff;
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--wm-er-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const fieldValueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--wm-er-text)",
  marginTop: 2,
};

export function EmployerWorkforceStaffDetailProfile({ staff }: Props) {
  return (
    <div className="wm-er-card" style={{ marginTop: 14 }}>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={fieldLabelStyle}>Full Name</div>
            <div style={fieldValueStyle}>{staff.employeeName || "—"}</div>
          </div>

          <div>
            <div style={fieldLabelStyle}>City</div>
            <div style={fieldValueStyle}>{staff.employeeCity || "—"}</div>
          </div>
        </div>

        {staff.employeeSkills.length > 0 && (
          <div>
            <div style={fieldLabelStyle}>Skills</div>

            <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 4 }}>
              {staff.employeeSkills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: AMBER_BG,
                    color: "var(--wm-er-accent-workforce, #b45309)",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <div style={fieldLabelStyle}>Added</div>

          <div style={fieldValueStyle}>
            {new Date(staff.addedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            <span style={{ color: "var(--wm-er-muted)", fontWeight: 400, marginLeft: 6 }}>
              ({timeAgo(staff.addedAt)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
