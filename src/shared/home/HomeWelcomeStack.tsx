/** Job Mitra | HomeWelcomeStack.tsx | Greeting + max two status strips */

import type { ReactNode } from "react";
import { HomeInboxTicker } from "../../features/notifications/components/HomeInboxTicker";
import type { InboxTickerItem } from "../../features/notifications/helpers/latestUnreadInboxPreview";
import { HomeGreetingStrip } from "./HomeGreetingStrip";

type Props = {
  readonly displayName: string;
  readonly greetTestId: string;
  readonly tickerTestId: string;
  readonly tickerItem: InboxTickerItem | null;
  readonly onOpenTicker: () => void;
  readonly extraStrips?: ReactNode;
};

export function HomeWelcomeStack({
  displayName,
  greetTestId,
  tickerTestId,
  tickerItem,
  onOpenTicker,
  extraStrips,
}: Props) {
  return (
    <div className="wm-homeWelcomeStack">
      <HomeGreetingStrip displayName={displayName} testId={greetTestId} />
      <HomeInboxTicker item={tickerItem} onOpen={onOpenTicker} testId={tickerTestId} />
      {extraStrips}
    </div>
  );
}
