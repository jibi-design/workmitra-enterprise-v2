// src/shared/components/notifications/NotificationFilterTabs.tsx
//
// Shared filter tabs for notification pages.
// Horizontal scroll, single row, never wraps.

import { type CSSProperties } from "react";
import { type NotificationDomainStyle, type NotificationTab } from "./notificationTypes";

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
/* CSS variables                                    */
/* ------------------------------------------------ */
type NotificationFilterTabStyle = CSSProperties &
  Partial<{
    "--wm-notification-tab-accent": string;
    "--wm-notification-tab-bg": string;
  }>;

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function NotificationFilterTabs({
  tabs,
  activeTab,
  onTabChange,
  domainCounts,
  domainStyles,
}: Props) {
  return (
    <div className="wm-notificationFilterTabs" role="tablist" aria-label="Notification filters">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const isAll = tab.key === "all";
        const count = isAll ? 0 : (domainCounts[tab.key] ?? 0);
        const domainStyle = domainStyles[tab.key];
        const hasItems = count > 0;

        const style: NotificationFilterTabStyle =
          hasItems && domainStyle
            ? {
                "--wm-notification-tab-accent": domainStyle.color,
                "--wm-notification-tab-bg": domainStyle.bgTab,
              }
            : {};

        const className = [
          "wm-notificationFilterTab",
          isActive ? "isActive" : "",
          hasItems ? "hasItems" : "isZero",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={className}
            style={style}
          >
            <span className="wm-notificationFilterLabel">{tab.label}</span>

            {!isAll && hasItems && <span className="wm-notificationFilterCount">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
