/** Job Mitra | AccountMenuItems.tsx — Premium menu rows with distinct Switch Role + Log Out */

import type { AccountMenuRole } from "./AccountMenuSheet.types";
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
  { title: string; sub: string; iconClass: string; titleClass: string }
> = {
  employee: {
    title: "Switch to Employer",
    sub: "Use Job Mitra as an employer",
    iconClass: "wm-accountSheet__iconBox--switchToEmployer",
    titleClass: "wm-accountSheet__title--switchToEmployer",
  },
  employer: {
    title: "Switch to Employee",
    sub: "Use Job Mitra as an employee",
    iconClass: "wm-accountSheet__iconBox--switchToEmployee",
    titleClass: "wm-accountSheet__title--switchToEmployee",
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
  const profileIconClass = isEmployer
    ? "wm-accountSheet__iconBox--profileEmployer"
    : "wm-accountSheet__iconBox--profileEmployee";

  return (
    <div className="wm-accountSheet__menu">
      <button type="button" className="wm-accountSheet__item" onClick={onOpenProfile}>
        <div className={`wm-accountSheet__iconBox ${profileIconClass}`}>
          <IconProfile />
        </div>
        <div className="wm-accountSheet__text">
          <div className="wm-accountSheet__title">My Profile</div>
          <div className="wm-accountSheet__sub">
            {isEmployer ? "Company identity and brand" : "Personal identity and work preferences"}
          </div>
        </div>
        <span className="wm-accountSheet__chevron">›</span>
      </button>

      <div className="wm-accountSheet__divider" />

      <button type="button" className="wm-accountSheet__item" onClick={onOpenSettings}>
        <div className="wm-accountSheet__iconBox wm-accountSheet__iconBox--settings">
          <IconSettings />
        </div>
        <div className="wm-accountSheet__text">
          <div className="wm-accountSheet__title">App Settings</div>
          <div className="wm-accountSheet__sub">Notifications, security, and preferences</div>
        </div>
        <span className="wm-accountSheet__chevron">›</span>
      </button>

      {onOpenGigProjects ? (
        <>
          <div className="wm-accountSheet__divider" />
          <button type="button" className="wm-accountSheet__item" onClick={onOpenGigProjects}>
            <div className="wm-accountSheet__iconBox wm-accountSheet__iconBox--gig">📋</div>
            <div className="wm-accountSheet__text">
              <div className="wm-accountSheet__title wm-accountSheet__title--gig">Gig Projects</div>
              <div className="wm-accountSheet__sub">
                {isEmployer ? "Agency multi-day planning" : "Browse project plans near you"}
              </div>
            </div>
            <span className="wm-accountSheet__chevron">›</span>
          </button>
        </>
      ) : null}

      {onOpenWorkforce ? (
        <>
          <div className="wm-accountSheet__divider" />
          <button type="button" className="wm-accountSheet__item" onClick={onOpenWorkforce}>
            <div className="wm-accountSheet__iconBox wm-accountSheet__iconBox--workforce">👥</div>
            <div className="wm-accountSheet__text">
              <div className="wm-accountSheet__title wm-accountSheet__title--workforce">
                Workforce Ops
              </div>
              <div className="wm-accountSheet__sub">Announcements, groups, and staff</div>
            </div>
            <span className="wm-accountSheet__chevron">›</span>
          </button>
        </>
      ) : null}

      {onOpenHrManagement ? (
        <>
          <div className="wm-accountSheet__divider" />
          <button type="button" className="wm-accountSheet__item" onClick={onOpenHrManagement}>
            <div className="wm-accountSheet__iconBox wm-accountSheet__iconBox--hr">HR</div>
            <div className="wm-accountSheet__text">
              <div className="wm-accountSheet__title wm-accountSheet__title--hr">HR Management</div>
              <div className="wm-accountSheet__sub">Attendance, tasks, and roster</div>
            </div>
            <span className="wm-accountSheet__chevron">›</span>
          </button>
        </>
      ) : null}

      {onOpenManagerConsole ? (
        <>
          <div className="wm-accountSheet__divider" />
          <button type="button" className="wm-accountSheet__item" onClick={onOpenManagerConsole}>
            <div className="wm-accountSheet__iconBox wm-accountSheet__iconBox--manager">⌘</div>
            <div className="wm-accountSheet__text">
              <div className="wm-accountSheet__title wm-accountSheet__title--manager">
                Manager Console
              </div>
              <div className="wm-accountSheet__sub">Command center and incidents</div>
            </div>
            <span className="wm-accountSheet__chevron">›</span>
          </button>
        </>
      ) : null}

      {onSwitchRole ? (
        <>
          <div className="wm-accountSheet__divider" />
          <button type="button" className="wm-accountSheet__item" onClick={onSwitchRole}>
            <div className={`wm-accountSheet__iconBox ${switchMeta.iconClass}`}>
              <IconSwitchRole />
            </div>
            <div className="wm-accountSheet__text">
              <div className={`wm-accountSheet__title ${switchMeta.titleClass}`}>
                {switchMeta.title}
              </div>
              <div className="wm-accountSheet__sub">{switchMeta.sub}</div>
            </div>
          </button>
        </>
      ) : null}

      <div className="wm-accountSheet__divider" />

      <button
        type="button"
        className="wm-accountSheet__item wm-accountSheet__item--logout"
        onClick={onLogout}
      >
        <div className="wm-accountSheet__iconBox wm-accountSheet__iconBox--logout">
          <IconLogout />
        </div>
        <div className="wm-accountSheet__text">
          <div className="wm-accountSheet__title wm-accountSheet__title--logout">Log Out</div>
          <div className="wm-accountSheet__sub wm-accountSheet__sub--logout">
            Return to landing page
          </div>
        </div>
      </button>
    </div>
  );
}
