// App name: Job Mitra
// File name: notificationLaunchFilters.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\components\notifications\notificationLaunchFilters.ts

import { LAUNCH_VISIBILITY } from "../../launch/launchVisibility";
import type { NotificationTab } from "./notificationTypes";

type DomainRecord = {
  domain: string;
};

function getEmployeeVisibleDomains(): Set<string> {
  const domains = ["shift", "career", "employment"];

  if (LAUNCH_VISIBILITY.workforceOps) {
    domains.push("workforce");
  }

  return new Set(domains);
}

function getEmployerVisibleDomains(): Set<string> {
  const domains = ["shift", "career"];

  if (LAUNCH_VISIBILITY.workforceOps) {
    domains.push("workforce");
  }

  if (LAUNCH_VISIBILITY.employerHrManagement) {
    domains.push("hr");
  }

  if (LAUNCH_VISIBILITY.employerManagerConsole) {
    domains.push("console");
  }

  return new Set(domains);
}

function filterTabs(tabs: NotificationTab[], visibleDomains: Set<string>): NotificationTab[] {
  return tabs.filter((tab) => tab.key === "all" || visibleDomains.has(tab.key));
}

function filterNotifications<T extends DomainRecord>(items: T[], visibleDomains: Set<string>): T[] {
  return items.filter((item) => visibleDomains.has(item.domain));
}

export function getLaunchVisibleEmployeeNotificationTabs(
  tabs: NotificationTab[],
): NotificationTab[] {
  return filterTabs(tabs, getEmployeeVisibleDomains());
}

export function getLaunchVisibleEmployerNotificationTabs(
  tabs: NotificationTab[],
): NotificationTab[] {
  return filterTabs(tabs, getEmployerVisibleDomains());
}

export function filterLaunchVisibleEmployeeNotifications<T extends DomainRecord>(items: T[]): T[] {
  return filterNotifications(items, getEmployeeVisibleDomains());
}

export function filterLaunchVisibleEmployerNotifications<T extends DomainRecord>(items: T[]): T[] {
  return filterNotifications(items, getEmployerVisibleDomains());
}
