/** Job Mitra | HomeInboxTicker.tsx | Unified home pending-action banner */

import { useEffect, useSyncExternalStore } from "react";
import { HomeStatusStripFrame } from "../../../shared/home/HomeStatusStripFrame";
import { HomeStatusStripBellIcon } from "../../../shared/home/HomeStatusStripIcons";
import { HomeTickerLayoutLine } from "./HomeTickerLayoutLine";
import { buildHomeTickerLayout } from "../helpers/homeTickerLayout";
import { formatHomeStripRowLine } from "../helpers/homeStripRowCopy";
import {
  getHomeStatusStripDismissRevision,
  isHomeStatusStripDismissed,
  subscribeHomeStatusStripDismiss,
} from "../../../shared/home/homeStatusStripDismiss";
import {
  buildHomeTickerFingerprint,
  clearHomeTickerAllClearDismiss,
  dismissHomeTicker,
  getHomeTickerAllClearRevision,
  isHomeTickerAllClearDismissed,
  isHomeTickerHidden,
  isStaleTickerDismiss,
  subscribeHomeTickerAllClear,
} from "../helpers/homeTickerAllClearSession";
import { buildHomeTickerStatus, listActionableTickerItems } from "../helpers/homeTickerStatus";
import type { InboxTickerItem } from "../helpers/latestUnreadInboxPreview";

type Props = {
  readonly item: InboxTickerItem | null;
  readonly items: readonly InboxTickerItem[];
  readonly onOpenItem: (item: InboxTickerItem) => void;
  readonly testId: string;
  readonly role: "employee" | "employer";
  readonly extraPendingCount?: number;
  readonly onFallbackPendingOpen?: () => void;
};

export function HomeInboxTicker({
  item,
  items,
  onOpenItem,
  testId,
  role,
  extraPendingCount = 0,
  onFallbackPendingOpen,
}: Props) {
  useSyncExternalStore(subscribeHomeTickerAllClear, getHomeTickerAllClearRevision, () => "");
  useSyncExternalStore(
    subscribeHomeStatusStripDismiss,
    getHomeStatusStripDismissRevision,
    () => "",
  );
  const sourceRows = items.length > 0 ? items : item ? [item] : [];
  const rows = sourceRows.filter((row) => !isHomeStatusStripDismissed(`row:${role}:${row.id}`));
  const view = buildHomeTickerStatus(rows, extraPendingCount);
  const fingerprint = buildHomeTickerFingerprint(
    rows.map((row) => `${row.id}:${row.createdAt}`),
    extraPendingCount,
    role,
  );
  const actionableTop = listActionableTickerItems(rows)[0] ?? null;
  const extraLayout = {
    badge: "Action Required",
    headline: "Shift: Shortlist",
    context: "Confirm shortlisted workers",
  };
  const topLayout = actionableTop ? buildHomeTickerLayout(actionableTop) : extraLayout;
  const extraPendingRow =
    extraPendingCount > 0 && onFallbackPendingOpen
      ? {
          id: `${role}-shortlist-confirm`,
          line: extraLayout.context,
          content: <HomeTickerLayoutLine layout={extraLayout} />,
          onOpen: () => onFallbackPendingOpen(),
        }
      : null;
  const details = [
    ...rows.map((row) => {
      const layout = buildHomeTickerLayout(row);
      return {
        id: `${role}:${row.id}`,
        line: formatHomeStripRowLine(row.title, row.body),
        content: <HomeTickerLayoutLine layout={layout} />,
        onOpen: () => onOpenItem(row),
      };
    }),
    ...(extraPendingRow ? [extraPendingRow] : []),
  ];

  useEffect(() => {
    if (view.status !== "pending") return;
    const stored = getHomeTickerAllClearRevision();
    if (stored && isStaleTickerDismiss(stored, fingerprint)) {
      clearHomeTickerAllClearDismiss();
    }
  }, [fingerprint, view.status]);

  if (isHomeTickerHidden(fingerprint)) return null;
  if (view.status === "clear" && isHomeTickerAllClearDismissed(fingerprint)) return null;

  const showClear = view.status === "clear";
  const clearView = buildHomeTickerStatus([], 0);

  return (
    <HomeStatusStripFrame
      testId={testId}
      domain={showClear ? clearView.domain : view.domain}
      line={showClear ? clearView.badge : view.badge}
      subtext={showClear ? clearView.subtext : view.subtext}
      subContent={
        showClear || view.status !== "pending" ? undefined : (
          <HomeTickerLayoutLine layout={topLayout} />
        )
      }
      status={showClear ? "clear" : view.status}
      ariaLabel={`${showClear ? clearView.badge : view.badge}. ${showClear ? clearView.subtext : view.subtext}`}
      dismissId={`inbox:ticker:${role}:${showClear ? "clear" : view.status}`}
      persistDismiss={false}
      hideDismiss={false}
      onDismiss={() => dismissHomeTicker(fingerprint, showClear)}
      icon={<HomeStatusStripBellIcon />}
      details={showClear ? [] : details}
      onPrimaryAction={
        showClear
          ? undefined
          : () => {
              if (actionableTop) onOpenItem(actionableTop);
              else onFallbackPendingOpen?.();
            }
      }
    />
  );
}
