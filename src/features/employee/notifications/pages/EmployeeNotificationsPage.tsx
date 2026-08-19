// App name: Job Mitra
// File name: EmployeeNotificationsPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\notifications\pages\EmployeeNotificationsPage.tsx

// Employee notifications — premium redesign matching employer quality.
// Domains: shift, career, workforce, employment.
// Launch guard hides future/internal domains from production UI.

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  employeeNotificationsStorage,
  type EmployeeNotification,
} from "../storage/employeeNotifications.storage";
import { NotificationCard } from "../../../../shared/components/notifications/NotificationCard";
import { NotificationFilterTabs } from "../../../../shared/components/notifications/NotificationFilterTabs";
import { NotificationEmptyState } from "../../../notifications/components/NotificationEmptyState";
import {
  EMPLOYEE_DOMAINS,
  EMPLOYEE_TABS,
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
  filterLaunchVisibleEmployeeNotifications,
  getLaunchVisibleEmployeeNotificationTabs,
} from "../../../../shared/components/notifications/notificationLaunchFilters";

const FALLBACK_DOMAIN = EMPLOYEE_DOMAINS["shift"];

const DOMAIN_ROUTES: Record<string, string> = {
  shift: ROUTE_PATHS.employeeShiftCenter ?? "/employee/shift",
  career: ROUTE_PATHS.employeeCareerHome ?? "/employee/career",
  workforce: ROUTE_PATHS.employeeWorkforceHome ?? "/employee/workforce",
  employment: ROUTE_PATHS.employeeEmploymentDetail ?? "/employee/employment",
};

const GROUP_HEADER: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: TEXT_TERTIARY,
  letterSpacing: 0.06,
  textTransform: "uppercase",
  marginTop: 0,
  marginBottom: 0,
};

export function EmployeeNotificationsPage() {
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const all = useSyncExternalStore(
    employeeNotificationsStorage.subscribe,
    employeeNotificationsStorage.getAll,
    employeeNotificationsStorage.getAll,
  );

  useEffect(() => {
    employeeNotificationsStorage.autoCleanup();
    void employeeNotificationsStorage.hydrateFromDb();
  }, []);

  const visibleTabs = useMemo(() => getLaunchVisibleEmployeeNotificationTabs(EMPLOYEE_TABS), []);

  const visibleAll = useMemo(() => filterLaunchVisibleEmployeeNotifications(all), [all]);

  const safeActiveTab = visibleTabs.some((tab) => tab.key === activeTab) ? activeTab : "all";

  const filtered = useMemo(
    () =>
      safeActiveTab === "all" ? visibleAll : visibleAll.filter((n) => n.domain === safeActiveTab),
    [safeActiveTab, visibleAll],
  );

  const unread = useMemo(() => {
    let count = 0;

    for (const note of visibleAll) {
      if (!note.isRead) count++;
    }

    return count;
  }, [visibleAll]);

  const domainCounts = useMemo(() => countByDomain(visibleAll), [visibleAll]);
  const groups: TimeGrouped<EmployeeNotification>[] = useMemo(
    () => groupByTime(filtered),
    [filtered],
  );

  function handleTap(noteId: string) {
    const note = visibleAll.find((n) => n.id === noteId);
    if (!note) return;

    employeeNotificationsStorage.markRead(noteId);

    const target = note.route ?? DOMAIN_ROUTES[note.domain];
    if (target) nav(target);
  }

  function handleDelete(noteId: string) {
    employeeNotificationsStorage.deleteOne(noteId);
  }

  const isEmpty = filtered.length === 0;

  return (
    <div className="pb-safe-nav">
      <div className="wm-notifPageHeader">
        <div>
          <div className="wm-notifPageHeader__title">
            Notifications
            {unread > 0 ? <span className="wm-notifUnreadBadge">{unread} unread</span> : null}
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {unread > 0 ? (
              <span style={{ color: NOTIFICATION_CYAN, fontWeight: 600 }}>
                {visibleAll.length} total
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
            onClick={() => employeeNotificationsStorage.markAllRead()}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {visibleAll.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => employeeNotificationsStorage.clearAll()}
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
        domainStyles={EMPLOYEE_DOMAINS}
      />

      {isEmpty && unread > 0 ? (
        <NotificationEmptyState
          title="Unread items are in another filter"
          text="Switch tabs to see action-required notifications. This filter is empty."
        />
      ) : null}
      {isEmpty && unread === 0 && <NotificationEmptyState />}

      {!isEmpty &&
        groups.map((group) => (
          <div key={group.key}>
            <div
              className="wm-notifDateHeader"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
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
                domainStyle={EMPLOYEE_DOMAINS[note.domain] ?? FALLBACK_DOMAIN}
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
