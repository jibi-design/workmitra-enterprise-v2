// App name: Job Mitra
// File name: EmployerNotificationsPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\notifications\pages\EmployerNotificationsPage.tsx

// Employer notifications — premium redesign.
// Time-grouped, domain-colored filter tabs, swipe-to-delete, auto-cleanup 30d.
// Launch guard hides future/internal domains from production UI.

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import {
  employerNotificationsStorage,
  type EmployerNotification,
} from "../storage/employerNotifications.storage";
import { NotificationCard } from "../../../../shared/components/notifications/NotificationCard";
import { NotificationFilterTabs } from "../../../../shared/components/notifications/NotificationFilterTabs";
import { NotificationEmptyState } from "../../../notifications/components/NotificationEmptyState";
import {
  EMPLOYER_DOMAINS,
  EMPLOYER_TABS,
  NOTIFICATION_CYAN,
  SUCCESS_GREEN,
  TEXT_TERTIARY,
} from "../../../../shared/components/notifications/notificationTypes";
import {
  groupByTime,
  countByDomain,
  type TimeGrouped,
} from "../../../../shared/components/notifications/notificationHelpers";
import {
  filterLaunchVisibleEmployerNotifications,
  getLaunchVisibleEmployerNotificationTabs,
} from "../../../../shared/components/notifications/notificationLaunchFilters";

const FALLBACK_DOMAIN = EMPLOYER_DOMAINS["shift"];

const GROUP_HEADER: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: TEXT_TERTIARY,
  letterSpacing: 0.06,
  textTransform: "uppercase",
  marginTop: 0,
  marginBottom: 0,
};

export function EmployerNotificationsPage() {
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const notes = useSyncExternalStore(
    employerNotificationsStorage.subscribe,
    employerNotificationsStorage.getAll,
    employerNotificationsStorage.getAll,
  );

  useEffect(() => {
    employerNotificationsStorage.autoCleanup();
  }, []);

  const visibleTabs = useMemo(() => getLaunchVisibleEmployerNotificationTabs(EMPLOYER_TABS), []);

  const visibleNotes = useMemo(() => filterLaunchVisibleEmployerNotifications(notes), [notes]);

  const safeActiveTab = visibleTabs.some((tab) => tab.key === activeTab) ? activeTab : "all";

  const filtered = useMemo(
    () =>
      safeActiveTab === "all"
        ? visibleNotes
        : visibleNotes.filter((n) => n.domain === safeActiveTab),
    [safeActiveTab, visibleNotes],
  );

  const unread = useMemo(() => {
    let count = 0;

    for (const note of visibleNotes) {
      if (!note.isRead) count++;
    }

    return count;
  }, [visibleNotes]);

  const domainCounts = useMemo(() => countByDomain(visibleNotes), [visibleNotes]);
  const groups: TimeGrouped<EmployerNotification>[] = useMemo(
    () => groupByTime(filtered),
    [filtered],
  );

  function handleTap(noteId: string) {
    const note = visibleNotes.find((n) => n.id === noteId);
    if (!note) return;

    employerNotificationsStorage.markRead(noteId);
    if (note.route) nav(note.route);
  }

  function handleDelete(noteId: string) {
    employerNotificationsStorage.deleteOne(noteId);
  }

  const isEmpty = filtered.length === 0;

  return (
    <div className="wm-notifShell--employer">
      <div className="wm-notifPageHeader">
        <div>
          <div className="wm-notifPageHeader__title">
            Notifications
            {unread > 0 ? <span className="wm-notifUnreadBadge">{unread} unread</span> : null}
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {unread > 0 ? (
              <span style={{ color: NOTIFICATION_CYAN, fontWeight: 600 }}>
                {visibleNotes.length} total
              </span>
            ) : (
              <span style={{ color: SUCCESS_GREEN, fontWeight: 600 }}>All caught up</span>
            )}
          </div>
        </div>

        {unread > 0 ? (
          <button
            type="button"
            className="wm-notifMarkAll"
            onClick={() => employerNotificationsStorage.markAllRead()}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {visibleNotes.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => employerNotificationsStorage.clearAll()}
            style={{
              minHeight: 44,
              fontSize: 12,
              fontWeight: 600,
              color: "#ef4444",
              background: "none",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "0 14px",
              cursor: "pointer",
            }}
          >
            Clear All
          </button>
        </div>
      )}

      <NotificationFilterTabs
        tabs={visibleTabs}
        activeTab={safeActiveTab}
        onTabChange={setActiveTab}
        domainCounts={domainCounts}
        domainStyles={EMPLOYER_DOMAINS}
      />

      {isEmpty && <NotificationEmptyState />}

      {!isEmpty &&
        groups.map((group) => (
          <div key={group.key}>
            <div className="wm-notifDateHeader">
              <span style={GROUP_HEADER}>{group.key}</span>
            </div>

            {group.items.map((note) => (
              <NotificationCard
                key={note.id}
                id={note.id}
                title={note.title}
                body={note.body}
                createdAt={note.createdAt}
                isRead={note.isRead}
                domainStyle={EMPLOYER_DOMAINS[note.domain] ?? FALLBACK_DOMAIN}
                onTap={handleTap}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ))}

      <div style={{ height: 32 }} />
    </div>
  );
}
