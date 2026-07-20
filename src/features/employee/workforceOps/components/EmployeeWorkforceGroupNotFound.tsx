// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceGroupNotFound.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceGroupNotFound.tsx

import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  onBack: () => void;
};

export function EmployeeWorkforceGroupNotFound({ onBack }: Props) {
  return (
    <div style={{ padding: "0 16px" }}>
      <div className="wm-pageHead">
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: AMBER,
            padding: 4,
          }}
        >
          <IconBack />
        </button>

        <div className="wm-pageTitle">Group not found</div>
      </div>
    </div>
  );
}
