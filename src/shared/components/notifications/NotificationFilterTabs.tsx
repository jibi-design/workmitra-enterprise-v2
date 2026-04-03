// src/shared/components/notifications/NotificationFilterTabs.tsx
//
// Shared filter tabs for notification pages.
// Horizontal scroll, single row, never wraps.
// Active = dark bg. Inactive = domain-colored or muted grey.

import {
  type NotificationTab,
  type NotificationDomainStyle,
  TAB_ACTIVE_BG,
  TAB_ZERO_BORDER,
  TAB_ZERO_TEXT,
} from "./notificationTypes";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  tabs: NotificationTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  /** Count per domain key (excluding "all"). */
  domainCounts: Record<string, number>;
  /** Domain styles map for coloring tabs. */
  domainStyles: Record<string, NotificationDomainStyle>;
};

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const CONTAINER: React.CSSProperties = {
  display: "flex",
  gap: 6,
  overflowX: "auto",
  flexWrap: "nowrap",
  paddingBottom: 12,
  marginBottom: 14,
  borderBottom: "1px solid var(--wm-er-border, #e5e7eb)",
  scrollbarWidth: "none",          // Firefox
  msOverflowStyle: "none",         // IE
};

const SCROLLBAR_HIDE = `
  .wm-notif-tabs::-webkit-scrollbar { display: none; }
`;

const BASE_TAB: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  padding: "5px 12px",
  borderRadius: 20,
  border: "1px solid transparent",
  cursor: "pointer",
  flexShrink: 0,
  whiteSpace: "nowrap",
  lineHeight: 1.4,
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function NotificationFilterTabs({ tabs, activeTab, onTabChange, domainCounts, domainStyles }: Props) {
  return (
    <>
      <style>{SCROLLBAR_HIDE}</style>
      <div className="wm-notif-tabs" style={CONTAINER} role="tablist" aria-label="Notification filters">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isAll = tab.key === "all";
          const count = isAll ? 0 : (domainCounts[tab.key] ?? 0);
          const ds = domainStyles[tab.key];
          const hasItems = count > 0;

          const style: React.CSSProperties = isActive
            ? { ...BASE_TAB, background: TAB_ACTIVE_BG, color: "#fff", borderColor: TAB_ACTIVE_BG }
            : hasItems && ds
              ? { ...BASE_TAB, background: ds.bgTab, color: ds.color, borderColor: ds.color }
              : { ...BASE_TAB, background: "transparent", color: TAB_ZERO_TEXT, borderColor: TAB_ZERO_BORDER };

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.key)}
              style={style}
            >
              {tab.label}{!isAll && hasItems ? ` ${count}` : ""}
            </button>
          );
        })}
      </div>
    </>
  );
}