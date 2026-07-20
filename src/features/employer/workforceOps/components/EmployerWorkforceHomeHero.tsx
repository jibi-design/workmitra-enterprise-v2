// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceHomeHero.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceHomeHero.tsx

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
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Workforce Ops Hub</div>
          <div className="wm-pageSub">Manage your permanent staff and work assignments</div>
        </div>

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
      </div>

      <div className="wm-er-tiles" style={{ marginTop: 14 }}>
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

      {pendingRatingCount > 0 && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 16px",
            borderRadius: "var(--wm-radius-14)",
            background: "rgba(217, 119, 6, 0.06)",
            border: "1px solid rgba(217, 119, 6, 0.18)",
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

          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(217, 119, 6, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 16,
            }}
          >
            ⚠
          </div>
        </div>
      )}
    </>
  );
}
