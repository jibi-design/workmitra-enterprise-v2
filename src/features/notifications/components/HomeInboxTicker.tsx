/** Job Mitra | HomeInboxTicker.tsx | Home unread notification preview */

import { HomeStatusStripFrame } from "../../../shared/home/HomeStatusStripFrame";
import { HomeStatusStripBellIcon } from "../../../shared/home/HomeStatusStripIcons";
import type { InboxTickerItem } from "../helpers/latestUnreadInboxPreview";

type Props = {
  readonly item: InboxTickerItem | null;
  readonly onOpen: () => void;
  readonly testId: string;
};

export function HomeInboxTicker({ item, onOpen, testId }: Props) {
  if (!item) return null;

  const line = item.title.trim();
  if (!line) return null;

  return (
    <HomeStatusStripFrame
      testId={testId}
      domain={item.domain}
      line={line}
      ariaLabel={line}
      dismissId={`inbox:${item.id}`}
      icon={<HomeStatusStripBellIcon />}
      onOpen={onOpen}
    />
  );
}
