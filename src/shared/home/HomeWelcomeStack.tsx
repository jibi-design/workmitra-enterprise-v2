/** Job Mitra | HomeWelcomeStack.tsx | Greeting + max two status strips */

import type { ReactNode } from "react";
import { HomeInboxTicker } from "../../features/notifications/components/HomeInboxTicker";
import type { InboxTickerItem } from "../../features/notifications/helpers/latestUnreadInboxPreview";
import { HomeGreetingStrip } from "./HomeGreetingStrip";

type StripProps = {
  readonly tickerTestId: string;
  readonly tickerRole: "employee" | "employer";
  readonly tickerItem: InboxTickerItem | null;
  readonly tickerItems: readonly InboxTickerItem[];
  readonly onOpenTickerItem: (item: InboxTickerItem) => void;
  readonly extraPendingCount?: number;
  readonly onFallbackPendingOpen?: () => void;
  readonly extraStrips?: ReactNode;
};

type Props = {
  readonly displayName: string;
  readonly greetTestId: string;
} & StripProps;

export function HomeStatusStripStack({
  tickerTestId,
  tickerRole,
  tickerItem,
  tickerItems,
  onOpenTickerItem,
  extraPendingCount,
  onFallbackPendingOpen,
  extraStrips,
}: StripProps) {
  return (
    <div className="wm-homeWelcomeStack">
      <HomeInboxTicker
        item={tickerItem}
        items={tickerItems}
        onOpenItem={onOpenTickerItem}
        testId={tickerTestId}
        role={tickerRole}
        extraPendingCount={extraPendingCount}
        onFallbackPendingOpen={onFallbackPendingOpen}
      />
      {extraStrips}
    </div>
  );
}

export function HomeWelcomeStack({ displayName, greetTestId, ...strips }: Props) {
  return (
    <>
      <HomeGreetingStrip displayName={displayName} testId={greetTestId} />
      <HomeStatusStripStack {...strips} />
    </>
  );
}
