// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceHomeAnnouncementsSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceHomeAnnouncementsSection.tsx

import type { WorkforceAnnouncement } from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  IconArrowRight,
  IconEmpty,
  IconPlus,
} from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  AMBER,
  emptyStateStyle,
  listRowBtnStyle,
  sectionTitleStyle,
  statusBadgeStyle,
} from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  recentAnnouncements: WorkforceAnnouncement[];
  hasData: boolean;
  getTotalVacancy: (announcementId: string) => number;
  statusColor: (status: WorkforceAnnouncement["status"]) => string;
  statusLabel: (status: WorkforceAnnouncement["status"]) => string;
  onOpenStaff: () => void;
  onOpenAnnouncementDash: (announcementId: string) => void;
};

export function EmployerWorkforceHomeAnnouncementsSection({
  recentAnnouncements,
  hasData,
  getTotalVacancy,
  statusColor,
  statusLabel,
  onOpenStaff,
  onOpenAnnouncementDash,
}: Props) {
  if (recentAnnouncements.length > 0) {
    return (
      <div style={{ marginTop: 14 }}>
        <div style={sectionTitleStyle}>Recent Announcements</div>

        <div style={{ display: "grid", gap: 8 }}>
          {recentAnnouncements.map((announcement) => {
            const totalVacancy = getTotalVacancy(announcement.id);

            return (
              <button
                key={announcement.id}
                type="button"
                style={listRowBtnStyle}
                onClick={() => onOpenAnnouncementDash(announcement.id)}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--wm-er-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {announcement.title}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                    {new Date(announcement.date + "T00:00:00").toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · {announcement.shifts.length} shift
                    {announcement.shifts.length !== 1 ? "s" : ""} · {totalVacancy}{" "}
                    {totalVacancy === 1 ? "vacancy" : "vacancies"} ·{" "}
                    {announcement.targetCategories.length}{" "}
                    {announcement.targetCategories.length === 1 ? "category" : "categories"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ ...statusBadgeStyle, color: statusColor(announcement.status) }}>
                    {statusLabel(announcement.status)}
                  </span>
                  <span style={{ color: "var(--wm-er-muted)" }}>
                    <IconArrowRight />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
        <div style={emptyStateStyle}>
          <IconEmpty />

          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
            No announcements yet
          </div>

          <div
            style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 280, lineHeight: 1.5 }}
          >
            Start by adding your staff, then create your first announcement to assign work.
          </div>

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onOpenStaff}
            style={{
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: AMBER,
            }}
          >
            <IconPlus /> Add Staff
          </button>
        </div>
      </div>
    );
  }

  return null;
}
