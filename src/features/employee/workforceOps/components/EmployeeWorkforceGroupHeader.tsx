// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceGroupHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceGroupHeader.tsx

import type { WorkforceGroup } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, statusBadgeStyle } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  group: WorkforceGroup;
  onBack: () => void;
};

export function EmployeeWorkforceGroupHeader({ group, onBack }: Props) {
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="wm-pageTitle"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {group.name}
        </div>

        <div className="wm-pageSub">
          {new Date(group.date + "T00:00:00").toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {group.location ? ` · ${group.location}` : ""}
        </div>
      </div>

      <span
        style={{
          ...statusBadgeStyle,
          color: group.status === "active" ? "var(--wm-success)" : "var(--wm-er-muted)",
          fontSize: 12,
        }}
      >
        {group.status === "active" ? "Active" : "Completed"}
      </span>
    </div>
  );
}
