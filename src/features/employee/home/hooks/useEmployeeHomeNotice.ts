/** Job Mitra | useEmployeeHomeNotice.ts | Inbox notice with apply-status fallback */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  listEmployeeApplyTicker,
  pickEmployeeApplyTicker,
} from "../../../notifications/helpers/employeeApplyTicker";
import { listEmployeeOfferTicker } from "../../../notifications/helpers/employeeOfferTicker";
import { overlayTickerDetailBodies } from "../../../notifications/helpers/homeStripRowCopy";
import type { InboxTickerItem } from "../../../notifications/helpers/latestUnreadInboxPreview";
import { useHomeInboxTicker } from "../../../notifications/hooks/useHomeInboxTicker";
import { useEmployeeHRRecords } from "../../employment/helpers/employeeHRSubscription";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { shiftApplicationsStorage } from "../../shiftJobs/storage/shiftApplications.storage";

export function useEmployeeHomeNotice() {
  const inbox = useHomeInboxTicker("employee");
  const nav = useNavigate();
  const apps = useSyncExternalStore(
    shiftApplicationsStorage.subscribe,
    shiftApplicationsStorage.getApps,
    shiftApplicationsStorage.getApps,
  );
  const posts = useSyncExternalStore(
    shiftApplicationsStorage.subscribe,
    shiftApplicationsStorage.getPosts,
    shiftApplicationsStorage.getPosts,
  );
  const applyItems = useMemo(() => listEmployeeApplyTicker(apps, posts), [apps, posts]);
  const applyItem = useMemo(() => pickEmployeeApplyTicker(apps), [apps]);
  const hrRecords = useEmployeeHRRecords();
  const offerItems = useMemo(
    () => listEmployeeOfferTicker(hrRecords, employeeProfileStorage.get().uniqueId ?? ""),
    [hrRecords],
  );
  const items = useMemo(() => {
    const inboxRows = overlayTickerDetailBodies(inbox.items, applyItems);
    const seen = new Set(inboxRows.map((row) => row.id));
    const extras = [...offerItems, ...applyItems].filter((row) => !seen.has(row.id));
    return [...inboxRows, ...extras];
  }, [applyItems, inbox.items, offerItems]);
  const item = inbox.item ?? offerItems[0] ?? applyItem ?? items[0] ?? null;

  const onOpenItem = useCallback(
    (target: InboxTickerItem) => {
      if (target.id.startsWith("app:") || target.id.startsWith("offer:")) {
        nav(target.route ?? ROUTE_PATHS.employeeShiftApplications);
        return;
      }
      inbox.onOpenItem(target);
    },
    [inbox, nav],
  );

  return { item, items, onOpenItem };
}
