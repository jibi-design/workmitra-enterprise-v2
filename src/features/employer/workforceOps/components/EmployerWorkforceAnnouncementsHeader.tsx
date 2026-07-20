// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnouncementsHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceAnnouncementsHeader.tsx

import { IconBack, IconPlus } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  onBack: () => void;
  onNewAnnouncement: () => void;
};

const backBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
};

export function EmployerWorkforceAnnouncementsHeader({ onBack, onNewAnnouncement }: Props) {
  return (
    <div className="wm-pageHead" style={{ gap: 12 }}>
      <button type="button" onClick={onBack} style={backBtnStyle}>
        <IconBack />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="wm-pageTitle">Announcements</div>
        <div className="wm-pageSub">All work announcements</div>
      </div>

      <button
        className="wm-primarybtn"
        type="button"
        onClick={onNewAnnouncement}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
          background: AMBER,
          fontSize: 12,
          padding: "8px 14px",
        }}
      >
        <IconPlus /> New
      </button>
    </div>
  );
}
