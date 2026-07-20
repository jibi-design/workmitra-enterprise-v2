/** Job Mitra | AccountMenuItems.tsx — Premium menu rows with distinct Switch Role + Log Out */

import type { AccountMenuRole } from "./AccountMenuSheet.types";
import {
  CHEVRON_STYLE,
  DIVIDER_STYLE,
  ICON_BOX_BASE_STYLE,
  MENU_ITEM_STYLE,
  MENU_LIST_STYLE,
  MENU_SUB_STYLE,
  MENU_TEXT_WRAP_STYLE,
  MENU_TITLE_BASE_STYLE,
} from "./AccountMenuSheet.styles";
import { IconLogout, IconProfile, IconSettings, IconSwitchRole } from "./AccountMenuSheetIcons";

type AccountMenuItemsProps = {
  readonly currentRole: AccountMenuRole;
  readonly onOpenProfile: () => void;
  readonly onOpenSettings: () => void;
  readonly onOpenGigProjects?: () => void;
  readonly onOpenWorkforce?: () => void;
  readonly onOpenHrManagement?: () => void;
  readonly onOpenManagerConsole?: () => void;
  readonly onSwitchRole?: () => void;
  readonly onLogout: () => void;
};

const SWITCH_META: Record<
  AccountMenuRole,
  { title: string; sub: string; iconBg: string; iconColor: string }
> = {
  employee: {
    title: "Switch to Employer",
    sub: "Use Job Mitra as an employer",
    iconBg: "rgba(124,58,237,0.09)",
    iconColor: "#7c3aed",
  },
  employer: {
    title: "Switch to Employee",
    sub: "Use Job Mitra as an employee",
    iconBg: "rgba(3,105,161,0.09)",
    iconColor: "#0369a1",
  },
};

export function AccountMenuItems({
  currentRole,
  onOpenProfile,
  onOpenSettings,
  onOpenGigProjects,
  onOpenWorkforce,
  onOpenHrManagement,
  onOpenManagerConsole,
  onSwitchRole,
  onLogout,
}: AccountMenuItemsProps) {
  const switchMeta = SWITCH_META[currentRole];
  const isEmployer = currentRole === "employer";

  return (
    <div style={MENU_LIST_STYLE}>
      {/* My Profile */}
      <button type="button" style={MENU_ITEM_STYLE} onClick={onOpenProfile}>
        <div
          style={{
            ...ICON_BOX_BASE_STYLE,
            background: isEmployer ? "rgba(124,58,237,0.08)" : "rgba(22,163,74,0.08)",
            color: isEmployer ? "#7c3aed" : "#16a34a",
          }}
        >
          <IconProfile />
        </div>
        <div style={MENU_TEXT_WRAP_STYLE}>
          <div style={MENU_TITLE_BASE_STYLE}>My Profile</div>
          <div style={MENU_SUB_STYLE}>
            {isEmployer ? "Company identity and brand" : "Personal identity and work preferences"}
          </div>
        </div>
        <span style={CHEVRON_STYLE}>›</span>
      </button>

      <div style={DIVIDER_STYLE} />

      {/* App Settings */}
      <button type="button" style={MENU_ITEM_STYLE} onClick={onOpenSettings}>
        <div
          style={{
            ...ICON_BOX_BASE_STYLE,
            background: "rgba(100,116,139,0.08)",
            color: "#64748b",
          }}
        >
          <IconSettings />
        </div>
        <div style={MENU_TEXT_WRAP_STYLE}>
          <div style={MENU_TITLE_BASE_STYLE}>App Settings</div>
          <div style={MENU_SUB_STYLE}>Notifications, security, and preferences</div>
        </div>
        <span style={CHEVRON_STYLE}>›</span>
      </button>

      <div style={DIVIDER_STYLE} />

      {onOpenGigProjects ? (
        <>
          <button type="button" style={MENU_ITEM_STYLE} onClick={onOpenGigProjects}>
            <div
              style={{
                ...ICON_BOX_BASE_STYLE,
                background: "rgba(8,145,178,0.10)",
                color: "#0891b2",
              }}
            >
              📋
            </div>
            <div style={MENU_TEXT_WRAP_STYLE}>
              <div style={{ ...MENU_TITLE_BASE_STYLE, color: "#0891b2" }}>Gig Projects</div>
              <div style={MENU_SUB_STYLE}>
                {isEmployer ? "Agency multi-day planning" : "Browse project plans near you"}
              </div>
            </div>
            <span style={CHEVRON_STYLE}>›</span>
          </button>
          <div style={DIVIDER_STYLE} />
        </>
      ) : null}

      {onOpenWorkforce ? (
        <>
          <button type="button" style={MENU_ITEM_STYLE} onClick={onOpenWorkforce}>
            <div
              style={{
                ...ICON_BOX_BASE_STYLE,
                background: "rgba(180,83,9,0.10)",
                color: "#b45309",
              }}
            >
              👥
            </div>
            <div style={MENU_TEXT_WRAP_STYLE}>
              <div style={{ ...MENU_TITLE_BASE_STYLE, color: "#b45309" }}>Workforce Ops</div>
              <div style={MENU_SUB_STYLE}>Announcements, groups, and staff</div>
            </div>
            <span style={CHEVRON_STYLE}>›</span>
          </button>
          <div style={DIVIDER_STYLE} />
        </>
      ) : null}

      {onOpenHrManagement ? (
        <>
          <button type="button" style={MENU_ITEM_STYLE} onClick={onOpenHrManagement}>
            <div
              style={{
                ...ICON_BOX_BASE_STYLE,
                background: "rgba(124,58,237,0.10)",
                color: "#7c3aed",
              }}
            >
              HR
            </div>
            <div style={MENU_TEXT_WRAP_STYLE}>
              <div style={{ ...MENU_TITLE_BASE_STYLE, color: "#7c3aed" }}>HR Management</div>
              <div style={MENU_SUB_STYLE}>Attendance, tasks, and roster</div>
            </div>
            <span style={CHEVRON_STYLE}>›</span>
          </button>
          <div style={DIVIDER_STYLE} />
        </>
      ) : null}

      {onOpenManagerConsole ? (
        <>
          <button type="button" style={MENU_ITEM_STYLE} onClick={onOpenManagerConsole}>
            <div
              style={{
                ...ICON_BOX_BASE_STYLE,
                background: "rgba(3,105,161,0.10)",
                color: "#0369a1",
              }}
            >
              ⌘
            </div>
            <div style={MENU_TEXT_WRAP_STYLE}>
              <div style={{ ...MENU_TITLE_BASE_STYLE, color: "#0369a1" }}>Manager Console</div>
              <div style={MENU_SUB_STYLE}>Command center and incidents</div>
            </div>
            <span style={CHEVRON_STYLE}>›</span>
          </button>
          <div style={DIVIDER_STYLE} />
        </>
      ) : null}

      {onSwitchRole ? (
        <>
          {/* Switch Role — visually distinct purple/blue */}
          <button type="button" style={MENU_ITEM_STYLE} onClick={onSwitchRole}>
            <div
              style={{
                ...ICON_BOX_BASE_STYLE,
                background: switchMeta.iconBg,
                color: switchMeta.iconColor,
              }}
            >
              <IconSwitchRole />
            </div>
            <div style={MENU_TEXT_WRAP_STYLE}>
              <div style={{ ...MENU_TITLE_BASE_STYLE, color: switchMeta.iconColor }}>
                {switchMeta.title}
              </div>
              <div style={MENU_SUB_STYLE}>{switchMeta.sub}</div>
            </div>
          </button>

          <div style={DIVIDER_STYLE} />
        </>
      ) : null}

      {/* Log Out — classy red with permanent soft red tint row */}
      <button
        type="button"
        style={{
          ...MENU_ITEM_STYLE,
          background: "rgba(220,38,38,0.04)",
          borderRadius: 12,
        }}
        onClick={onLogout}
      >
        <div
          style={{
            ...ICON_BOX_BASE_STYLE,
            background: "rgba(220,38,38,0.08)",
            color: "#dc2626",
          }}
        >
          <IconLogout />
        </div>
        <div style={MENU_TEXT_WRAP_STYLE}>
          <div style={{ ...MENU_TITLE_BASE_STYLE, color: "#dc2626" }}>Log Out</div>
          <div style={{ ...MENU_SUB_STYLE, color: "#fca5a5" }}>Return to landing page</div>
        </div>
      </button>
    </div>
  );
}
