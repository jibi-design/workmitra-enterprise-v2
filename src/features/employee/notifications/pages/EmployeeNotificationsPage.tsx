// src/features/employee/notifications/pages/EmployeeNotificationsPage.tsx
//
// Employee notifications — premium redesign matching employer quality.
// Domains: shift, career, workforce, employment.
// Swipe-to-delete, auto-cleanup 30d.

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  employeeNotificationsStorage,
  type EmployeeNotification,
} from "../storage/employeeNotifications.storage";
import { NotificationCard } from "../../../../shared/components/notifications/NotificationCard";
import { NotificationFilterTabs } from "../../../../shared/components/notifications/NotificationFilterTabs";
import { NotificationEmptyState } from "../../../../shared/components/notifications/NotificationEmptyState";
import {
  EMPLOYEE_DOMAINS,
  EMPLOYEE_TABS,
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

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const FALLBACK_DOMAIN = EMPLOYEE_DOMAINS["shift"];

const DOMAIN_ROUTES: Record<string, string> = {
  shift: ROUTE_PATHS.employeeShiftCenter ?? "/employee/shift",
  career: ROUTE_PATHS.employeeCareerHome ?? "/employee/career",
  workforce: ROUTE_PATHS.employeeWorkforceHome ?? "/employee/workforce",
  employment: ROUTE_PATHS.employeeEmploymentDetail ?? "/employee/employment",
};

const GROUP_HEADER: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: TEXT_TERTIARY,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  marginTop: 14,
  marginBottom: 8,
};

/* ------------------------------------------------ */
/* Bell SVG                                         */
/* ------------------------------------------------ */
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

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployeeNotificationsPage() {
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const all = useSyncExternalStore(
    employeeNotificationsStorage.subscribe,
    employeeNotificationsStorage.getAll,
    employeeNotificationsStorage.getAll,
  );

  /* Auto-cleanup notifications older than 30 days */
  useEffect(() => { employeeNotificationsStorage.autoCleanup(); }, []);

  const filtered = useMemo(
    () => (activeTab === "all" ? all : all.filter((n) => n.domain === activeTab)),
    [all, activeTab],
  );

  const unread = useMemo(() => {
    let c = 0;
    for (const n of all) if (!n.isRead) c++;
    return c;
  }, [all]);

  const domainCounts = useMemo(() => countByDomain(all), [all]);
  const groups: TimeGrouped<EmployeeNotification>[] = useMemo(() => groupByTime(filtered), [filtered]);

  function handleTap(noteId: string) {
    const note = all.find((n) => n.id === noteId);
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
    <div>
      {/* Page Title Section */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: BELL_CIRCLE_BG,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <BellSvg />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text, #1e293b)" }}>
            Notifications
          </div>
          <div style={{ fontSize: 12, marginTop: 2 }}>
            {unread > 0 ? (
              <span style={{ color: NOTIFICATION_CYAN, fontWeight: 600 }}>
                {unread} unread &middot; {all.length} total
              </span>
            ) : (
              <span style={{ color: SUCCESS_GREEN, fontWeight: 600 }}>All caught up</span>
            )}
          </div>
        </div>
      </div>

      {/* Clear All */}
      {all.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => employeeNotificationsStorage.clearAll()}
            style={{
              fontSize: 12, fontWeight: 600, color: "#ef4444",
              background: "none", border: "1px solid #fecaca",
              borderRadius: 8, padding: "4px 12px", cursor: "pointer",
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <NotificationFilterTabs
        tabs={EMPLOYEE_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        domainCounts={domainCounts}
        domainStyles={EMPLOYEE_DOMAINS}
      />

      {/* Empty State */}
      {isEmpty && <NotificationEmptyState />}

      {/* Time-Grouped Notifications */}
      {!isEmpty && groups.map((group) => (
        <div key={group.key}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={GROUP_HEADER}>{group.key}</span>
            {group.key === "TODAY" && unread > 0 && (
              <button
                type="button"
                onClick={() => employeeNotificationsStorage.markAllRead()}
                style={{
                  fontSize: 12, fontWeight: 600, color: NOTIFICATION_CYAN,
                  background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          {group.items.map((n) => (
            <NotificationCard
              key={n.id}
              id={n.id}
              title={n.title}
              body={n.body}
              createdAt={n.createdAt}
              isRead={n.isRead}
              domainStyle={EMPLOYEE_DOMAINS[n.domain] ?? FALLBACK_DOMAIN}
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