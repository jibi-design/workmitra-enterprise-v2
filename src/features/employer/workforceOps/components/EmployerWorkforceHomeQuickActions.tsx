// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceHomeQuickActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceHomeQuickActions.tsx

import {
  IconAnnounce,
  IconGroup,
  IconStaff,
} from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  actionBtnStyle,
  actionIconWrapStyle,
} from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  activeStaffCount: number;
  openAnnouncementCount: number;
  activeGroupCount: number;
  onOpenStaff: () => void;
  onOpenAnnouncements: () => void;
  onOpenGroups: () => void;
};

export function EmployerWorkforceHomeQuickActions({
  activeStaffCount,
  openAnnouncementCount,
  activeGroupCount,
  onOpenStaff,
  onOpenAnnouncements,
  onOpenGroups,
}: Props) {
  return (
    <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
      <button type="button" style={actionBtnStyle} onClick={onOpenStaff}>
        <div style={actionIconWrapStyle}>
          <IconStaff />
        </div>
        <span>Workforce staff</span>
        {activeStaffCount > 0 && (
          <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            {activeStaffCount} active
          </span>
        )}
      </button>

      <button type="button" style={actionBtnStyle} onClick={onOpenAnnouncements}>
        <div style={actionIconWrapStyle}>
          <IconAnnounce />
        </div>
        <span>Announcements</span>
        {openAnnouncementCount > 0 && (
          <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            {openAnnouncementCount} open
          </span>
        )}
      </button>

      <button type="button" style={actionBtnStyle} onClick={onOpenGroups}>
        <div style={actionIconWrapStyle}>
          <IconGroup />
        </div>
        <span>Groups</span>
        {activeGroupCount > 0 && (
          <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            {activeGroupCount} active
          </span>
        )}
      </button>
    </div>
  );
}
