// src/features/employer/hrManagement/components/HRPageSections.tsx

import { useNavigate } from "react-router-dom";
import type { TabKey } from "../helpers/hrPageHelpers";
import { TABS } from "../helpers/hrPageHelpers";

/* ------------------------------------------------ */
/* First Visit Guide                                */
/* ------------------------------------------------ */
export function FirstVisitGuide({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid rgba(124, 58, 237, 0.15)",
        background: "rgba(124, 58, 237, 0.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 12, color: "var(--wm-er-accent-hr, #7c3aed)" }}>
          New to Staff Lifecycle?
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted, #64748b)", marginTop: 2 }}>
          Manage your team from hiring to exit – all in one place.
        </div>
      </div>
      <button
        className="wm-primarybtn"
        type="button"
        onClick={onDismiss}
        style={{ fontSize: 11, padding: "5px 14px", flexShrink: 0 }}
      >
        Got it
      </button>
    </div>
  );
}

/* ------------------------------------------------ */
/* Header Section                                   */
/* ------------------------------------------------ */
export function HRHeaderSection() {
  const nav = useNavigate();
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 900, fontSize: 18, color: "var(--wm-er-text, #0f172a)" }}>
        Staff Lifecycle
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 2 }}>
        Manage your team from hiring to exit.
      </div>
      <button
        className="wm-primarybtn"
        type="button"
        onClick={() => nav("/employer/console/attendance")}
        style={{ marginTop: 10, fontSize: 12, padding: "8px 16px" }}
      >
        Daily Attendance
      </button>
      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => nav("/employer/console/bulk-task")}
        style={{ marginTop: 6, fontSize: 12, padding: "8px 16px" }}
      >
        Bulk Task Assign
      </button>
      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => nav("/employer/console/notices")}
        style={{ marginTop: 6, fontSize: 12, padding: "8px 16px" }}
      >
        Company Notices
      </button>
      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => nav("/employer/console/availability")}
        style={{ marginTop: 6, fontSize: 12, padding: "8px 16px" }}
      >
        Staff Availability
      </button>
      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => nav("/employer/console/roster")}
        style={{ marginTop: 6, fontSize: 12, padding: "8px 16px" }}
      >
        Team Calendar
      </button>
    </div>
  );
}

/* ------------------------------------------------ */
/* Tab Bar                                          */
/* ------------------------------------------------ */
type HRTabBarProps = {
  activeTab: TabKey;
  tabCounts: Record<string, number>;
  showFilters: boolean;
  onTabChange: (tab: TabKey) => void;
};

export function HRTabBar({ activeTab, tabCounts, showFilters, onTabChange }: HRTabBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        overflowX: "auto",
        borderBottom: "2px solid var(--wm-er-border, #e5e7eb)",
        marginBottom: showFilters ? 8 : 12,
        WebkitOverflowScrolling: "touch",
      }}
      className="wm-hideScrollbar"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = tabCounts[tab.key] ?? 0;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: "0 0 auto",
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: isActive ? 900 : 600,
              color: isActive
                ? "var(--wm-er-accent-hr, #7c3aed)"
                : "var(--wm-er-muted, #b0b5bf)",
              background: isActive
                ? "rgba(124, 58, 237, 0.06)"
                : "transparent",
              border: "none",
              borderBottom: isActive
                ? "3px solid var(--wm-er-accent-hr, #7c3aed)"
                : "3px solid transparent",
              borderRadius: isActive ? "6px 6px 0 0" : "0",
              marginBottom: -2,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
            {count > 0 && (
              <span
                style={{
                  marginLeft: 5,
                  fontSize: 9,
                  fontWeight: 900,
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: isActive
                    ? "rgba(124, 58, 237, 0.1)"
                    : "rgba(107, 114, 128, 0.08)",
                  color: isActive
                    ? "var(--wm-er-accent-hr, #7c3aed)"
                    : "var(--wm-er-muted, #94a3b8)",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------ */
/* No Search Results                                */
/* ------------------------------------------------ */
export function NoSearchResults() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 20px",
        borderRadius: 12,
        border: "1.5px dashed var(--wm-er-border, #e5e7eb)",
        background: "rgba(15, 23, 42, 0.01)",
      }}
    >
      <div
        style={{
          width: 60, height: 60, borderRadius: 16,
          background: "rgba(15, 23, 42, 0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#94a3b8" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </div>
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text, #0f172a)" }}>
        No results found
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 6 }}>
        Try a different search term or clear the search.
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* No Team Members                                  */
/* ------------------------------------------------ */
export function NoTeamMembers() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 20px",
        borderRadius: 12,
        border: "1.5px dashed var(--wm-er-border, #e5e7eb)",
        background: "rgba(15, 23, 42, 0.01)",
      }}
    >
      <div
        style={{
          width: 60, height: 60, borderRadius: 16,
          background: "rgba(124, 58, 237, 0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#7c3aed" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      </div>
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text, #0f172a)" }}>
        No team members yet
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 6 }}>
        Candidates who clear interviews will appear here for offer review.
      </div>
    </div>
  );
}
