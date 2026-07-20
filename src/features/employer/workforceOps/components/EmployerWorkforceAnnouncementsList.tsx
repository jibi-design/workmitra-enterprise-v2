// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnouncementsList.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceAnnouncementsList.tsx

import type {
  AnnouncementStatus,
  WorkforceAnnouncement,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  IconArrowRight,
  IconEmpty,
  IconPlus,
} from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, statusBadgeStyle } from "../../../../shared/domains/workforce/ui/workforceStyles";
import type { EmployerWorkforceAnnouncementsTabKey } from "./EmployerWorkforceAnnouncementsTabs";

export type EmployerWorkforceAnnouncementListItem = {
  announcement: WorkforceAnnouncement;
  totalVacancy: number;
};

type Props = {
  activeTab: EmployerWorkforceAnnouncementsTabKey;
  items: EmployerWorkforceAnnouncementListItem[];
  onNewAnnouncement: () => void;
  onOpenDashboard: (announcementId: string) => void;
};

const listCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-10, 10px)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
};

function statusColor(status: AnnouncementStatus): string {
  switch (status) {
    case "open":
      return AMBER;
    case "analyzing":
      return "var(--wm-warning)";
    case "confirmed":
      return "var(--wm-success)";
    case "completed":
      return "var(--wm-er-muted)";
    case "cancelled":
      return "var(--wm-error)";
  }
}

function statusLabel(status: AnnouncementStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");

  if (Number.isNaN(d.getTime())) {
    return dateStr;
  }

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function emptyMessage(activeTab: EmployerWorkforceAnnouncementsTabKey): string {
  if (activeTab === "open") {
    return "Create a new announcement to assign work to your staff.";
  }

  if (activeTab === "confirmed") {
    return "Confirmed announcements with active work groups will appear here.";
  }

  return "Completed and cancelled announcements will appear here.";
}

export function EmployerWorkforceAnnouncementsList({
  activeTab,
  items,
  onNewAnnouncement,
  onOpenDashboard,
}: Props) {
  return (
    <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
      {items.length === 0 ? (
        <div className="wm-er-card" style={{ padding: 32, textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <IconEmpty />

            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "var(--wm-er-text)",
              }}
            >
              No {activeTab} announcements
            </div>

            <div
              style={{
                fontSize: 13,
                color: "var(--wm-er-muted)",
                maxWidth: 260,
                lineHeight: 1.5,
              }}
            >
              {emptyMessage(activeTab)}
            </div>

            {activeTab === "open" && (
              <button
                className="wm-primarybtn"
                type="button"
                onClick={onNewAnnouncement}
                style={{
                  marginTop: 4,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: AMBER,
                }}
              >
                <IconPlus /> New Announcement
              </button>
            )}
          </div>
        </div>
      ) : (
        items.map(({ announcement, totalVacancy }) => (
          <button
            key={announcement.id}
            type="button"
            style={listCardStyle}
            onClick={() => onOpenDashboard(announcement.id)}
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

              <div
                style={{
                  fontSize: 11,
                  color: "var(--wm-er-muted)",
                  marginTop: 3,
                }}
              >
                {formatDate(announcement.date)} · {announcement.shifts.length} shift
                {announcement.shifts.length !== 1 ? "s" : ""} · {totalVacancy}{" "}
                {totalVacancy === 1 ? "vacancy" : "vacancies"} ·{" "}
                {announcement.targetCategories.length}{" "}
                {announcement.targetCategories.length === 1 ? "category" : "categories"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  ...statusBadgeStyle,
                  color: statusColor(announcement.status),
                }}
              >
                {statusLabel(announcement.status)}
              </span>

              <span style={{ color: "var(--wm-er-muted)" }}>
                <IconArrowRight />
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
