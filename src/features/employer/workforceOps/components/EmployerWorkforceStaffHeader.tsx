// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffHeader.tsx

import { IconBack, IconPlus } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  staffCount: number;
  onBack: () => void;
  onAddStaff: () => void;
};

export function EmployerWorkforceStaffHeader({ staffCount, onBack, onAddStaff }: Props) {
  return (
    <div className="wm-pageHead" style={{ gap: 12 }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: AMBER,
          padding: 4,
          borderRadius: 6,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <IconBack />
      </button>

      <div style={{ flex: 1 }}>
        <div className="wm-pageTitle">Staff Directory</div>
        <div className="wm-pageSub">
          {staffCount} staff member{staffCount !== 1 ? "s" : ""}
        </div>
      </div>

      <button
        className="wm-primarybtn"
        type="button"
        onClick={onAddStaff}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
          background: AMBER,
        }}
      >
        <IconPlus /> Add Staff
      </button>
    </div>
  );
}
