// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffDetailHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffDetailHeader.tsx

import type { WorkforceStaff } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  staff: WorkforceStaff;
  onBack: () => void;
};

const backButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
};

export function EmployerWorkforceStaffDetailHeader({ staff, onBack }: Props) {
  return (
    <div className="wm-pageHead" style={{ gap: 12 }}>
      <button type="button" onClick={onBack} style={backButtonStyle}>
        <IconBack />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="wm-pageTitle"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {staff.employeeName}
        </div>

        <div className="wm-pageSub">ID: {staff.employeeUniqueId}</div>
      </div>
    </div>
  );
}
