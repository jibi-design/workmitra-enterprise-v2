/** Job Mitra | useHomeInboxTicker.ts | Latest live Shift/Career/Employment inbox notice */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { employeeNotificationsStorage } from "../../employee/notifications/storage/employeeNotifications.storage";
import { employerNotificationsStorage } from "../../employer/notifications/storage/employerNotifications.storage";
import {
  listLiveShiftCareer,
  pickLatestLiveShiftCareer,
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
  items: InboxTickerItem[];
  onOpen: () => void;
  onOpenItem: (item: InboxTickerItem) => void;
} {
  const nav = useNavigate();
  const inboxPath =
    role === "employee" ? ROUTE_PATHS.employeeNotifications : ROUTE_PATHS.employerNotifications;

  const notes = useSyncExternalStore(
    role === "employee" ? subscribeEmployee : subscribeEmployer,
    role === "employee" ? employeeNotificationsStorage.getAll : employerNotificationsStorage.getAll,
    role === "employee" ? employeeNotificationsStorage.getAll : employerNotificationsStorage.getAll,
  );

  const items = useMemo(() => listLiveShiftCareer(notes), [notes]);
  const item = useMemo(() => pickLatestLiveShiftCareer(notes), [notes]);

  const onOpenItem = useCallback(
    (target: InboxTickerItem) => {
      if (role === "employee") employeeNotificationsStorage.markRead(target.id);
      else employerNotificationsStorage.markRead(target.id);
      nav(resolveInboxTickerHref(target, inboxPath));
    },
    [inboxPath, nav, role],
  );

  const onOpen = useCallback(() => {
    if (!item) {
      nav(inboxPath);
      return;
    }
    onOpenItem(item);
  }, [inboxPath, item, nav, onOpenItem]);

  return { item, items, onOpen, onOpenItem };
}
