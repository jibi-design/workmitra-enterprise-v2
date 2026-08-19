/** Mark matching inbox rows read when a pulse destination is reached. */

import { employeeNotificationsStorage } from "../employee/notifications/storage/employeeNotifications.storage";
import { employerNotificationsStorage } from "../employer/notifications/storage/employerNotifications.storage";

function routeMatches(itemRoute: string | undefined, targetPath: string): boolean {
  if (!itemRoute || !targetPath) return false;
  const route = itemRoute.replace(/^#/, "");
  const target = targetPath.replace(/^#/, "");
  return route === target || route.startsWith(`${target}/`) || route.includes(target);
}

function markStore(
  getAll: () => readonly { id: string; isRead: boolean; route?: string }[],
  markRead: (id: string) => void,
  targetPath: string,
): void {
  for (const item of getAll()) {
    if (item.isRead) continue;
    if (!routeMatches(item.route, targetPath)) continue;
    markRead(item.id);
  }
}

export function markInboxHandledForTargetPath(targetPath: string | undefined): void {
  if (!targetPath) return;
  markStore(
    employeeNotificationsStorage.getAll,
    (id) => employeeNotificationsStorage.markRead(id),
    targetPath,
  );
  markStore(
    employerNotificationsStorage.getAll,
    (id) => employerNotificationsStorage.markRead(id),
    targetPath,
  );
}
