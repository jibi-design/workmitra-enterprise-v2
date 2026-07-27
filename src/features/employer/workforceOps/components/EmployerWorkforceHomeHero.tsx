// App name: Job Mitra | EmployerWorkforceHomeHero.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { IconPlus } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  activeStaffCount: number;
  categoryCount: number;
  activeGroupCount: number;
  openAnnouncementCount: number;
  confirmedAnnouncementCount: number;
  completedAnnouncementCount: number;
  pendingRatingCount: number;
  onCreateAnnouncement: () => void;
};

export function EmployerWorkforceHomeHero({
  activeStaffCount,
  categoryCount,
  activeGroupCount,
  openAnnouncementCount,
  confirmedAnnouncementCount,
  completedAnnouncementCount,
  pendingRatingCount,
  onCreateAnnouncement,
}: Props) {
  return (
    <>
      <DomainHero
        variant="workforce"
        audience="employer"
        icon={<WorkforceHubIcon />}
        title="Workforce Ops Hub"
        subtitle="Manage your permanent staff and work assignments"
        description="Staff directory, categories, groups, and announcements in one place."
        trailing={
          <button
            className="wm-primarybtn"
            type="button"
            onClick={onCreateAnnouncement}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              background: AMBER,
            }}
          >
            <IconPlus /> New Announcement
          </button>
        }
      >
        <div className="wm-er-tiles">
          <div className="wm-er-tile">
            <div className="wm-er-tileLabel">Staff</div>
            <div
              className="wm-er-tileValue"
              style={{ color: activeStaffCount > 0 ? AMBER : undefined }}
            >
              {activeStaffCount}
            </div>
          </div>
          <div className="wm-er-tile">
            <div className="wm-er-tileLabel">Categories</div>
            <div className="wm-er-tileValue">{categoryCount}</div>
          </div>
          <div className="wm-er-tile">
            <div className="wm-er-tileLabel">Active Groups</div>
            <div
              className="wm-er-tileValue"
              style={{ color: activeGroupCount > 0 ? "var(--wm-success)" : undefined }}
            >
              {activeGroupCount}
            </div>
          </div>
        </div>

        <div className="wm-er-tiles" style={{ marginTop: 8 }}>
          <div className="wm-er-tile">
            <div className="wm-er-tileLabel">Open</div>
            <div
              className="wm-er-tileValue"
              style={{ color: openAnnouncementCount > 0 ? AMBER : undefined }}
            >
              {openAnnouncementCount}
            </div>
          </div>
          <div className="wm-er-tile">
            <div className="wm-er-tileLabel">Confirmed</div>
            <div
              className="wm-er-tileValue"
              style={{ color: confirmedAnnouncementCount > 0 ? "var(--wm-success)" : undefined }}
            >
              {confirmedAnnouncementCount}
            </div>
          </div>
          <div className="wm-er-tile">
            <div className="wm-er-tileLabel">Completed</div>
            <div className="wm-er-tileValue">{completedAnnouncementCount}</div>
          </div>
        </div>
      </DomainHero>

      {pendingRatingCount > 0 ? (
        <div
          className="wm-shift-surface-glass wm-shift-surface-glass--compact"
          style={{
            border: "1px solid rgba(217, 119, 6, 0.18)",
            background: "rgba(217, 119, 6, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#92400e" }}>
              {pendingRatingCount} member{pendingRatingCount !== 1 ? "s" : ""} pending rating
            </div>
            <div style={{ fontSize: 11, color: "#92400e", marginTop: 2, opacity: 0.8 }}>
              Rate your team to help workers build their reputation.
            </div>
          </div>
          <span aria-hidden="true" style={{ fontSize: 16 }}>
            ⚠
          </span>
        </div>
      ) : null}
    </>
  );
}

function WorkforceHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
      />
    </svg>
  );
}
