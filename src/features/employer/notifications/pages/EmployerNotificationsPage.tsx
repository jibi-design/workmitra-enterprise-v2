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
import { NotificationEmptyState } from "../../../../shared/components/notifications/NotificationEmptyState";
import {
  EMPLOYER_DOMAINS,
  EMPLOYER_TABS,
  NOTIFICATION_CYAN,
  BELL_CIRCLE_BG,
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
  fontWeight: 600,
  color: TEXT_TERTIARY,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  marginTop: 14,
  marginBottom: 8,
};

function BellSvg() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" style={{ display: "block" }}>
      <path
        fill={NOTIFICATION_CYAN}
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h20v-1l-2-2Z"
      />
    </svg>
  );
}

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
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: BELL_CIRCLE_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BellSvg />
        </div>

        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text, #1e293b)" }}>
            Notifications
          </div>

          <div style={{ fontSize: 12, marginTop: 2 }}>
            {unread > 0 ? (
              <span style={{ color: NOTIFICATION_CYAN, fontWeight: 600 }}>
                {unread} unread &middot; {visibleNotes.length} total
              </span>
            ) : (
              <span style={{ color: SUCCESS_GREEN, fontWeight: 600 }}>All caught up</span>
            )}
          </div>
        </div>
      </div>

      {visibleNotes.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => employerNotificationsStorage.clearAll()}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#ef4444",
              background: "none",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "4px 12px",
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={GROUP_HEADER}>{group.key}</span>

              {group.key === "TODAY" && unread > 0 && (
                <button
                  type="button"
                  onClick={() => employerNotificationsStorage.markAllRead()}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: NOTIFICATION_CYAN,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                  }}
                >
                  Mark all read
                </button>
              )}
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
