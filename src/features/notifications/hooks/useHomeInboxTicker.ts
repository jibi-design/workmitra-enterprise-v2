/** Job Mitra | useHomeInboxTicker.ts | Latest unread Shift/Career inbox preview */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { employeeNotificationsStorage } from "../../employee/notifications/storage/employeeNotifications.storage";
import { employerNotificationsStorage } from "../../employer/notifications/storage/employerNotifications.storage";
import {
  pickLatestUnreadShiftCareer,
  resolveInboxTickerHref,
  type InboxTickerItem,
} from "../helpers/latestUnreadInboxPreview";

export type HomeInboxTickerRole = "employee" | "employer";

function subscribeEmployee(onStoreChange: () => void): () => void {
  return employeeNotificationsStorage.subscribe(onStoreChange);
}

function subscribeEmployer(onStoreChange: () => void): () => void {
  return employerNotificationsStorage.subscribe(onStoreChange);
}

export function useHomeInboxTicker(role: HomeInboxTickerRole): {
  item: InboxTickerItem | null;
  onOpen: () => void;
} {
  const nav = useNavigate();
  const inboxPath =
    role === "employee" ? ROUTE_PATHS.employeeNotifications : ROUTE_PATHS.employerNotifications;

  const notes = useSyncExternalStore(
    role === "employee" ? subscribeEmployee : subscribeEmployer,
    role === "employee" ? employeeNotificationsStorage.getAll : employerNotificationsStorage.getAll,
    role === "employee" ? employeeNotificationsStorage.getAll : employerNotificationsStorage.getAll,
  );

  const item = useMemo(() => pickLatestUnreadShiftCareer(notes), [notes]);

  const onOpen = useCallback(() => {
    if (!item) {
      nav(inboxPath);
      return;
    }
    if (role === "employee") employeeNotificationsStorage.markRead(item.id);
    else employerNotificationsStorage.markRead(item.id);
    nav(resolveInboxTickerHref(item, inboxPath));
  }, [inboxPath, item, nav, role]);

  return { item, onOpen };
}
