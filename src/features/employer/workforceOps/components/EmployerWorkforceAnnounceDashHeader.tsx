// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnounceDashHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceAnnounceDashHeader.tsx

import type { WorkforceAnnouncement } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, statusBadgeStyle } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  announcement: WorkforceAnnouncement;
  statusColor: string;
  onBack: () => void;
};

export function EmployerWorkforceAnnounceDashHeader({ announcement, statusColor, onBack }: Props) {
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
          {announcement.title}
        </div>
        <div className="wm-pageSub">Announcement Dashboard</div>
      </div>

      <span style={{ ...statusBadgeStyle, color: statusColor, fontSize: 13 }}>
        {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
      </span>
    </div>
  );
}
