/** Job Mitra | HomeInboxTicker.tsx | Home unread notification preview */

import type { InboxTickerItem } from "../helpers/latestUnreadInboxPreview";

type Props = {
  readonly item: InboxTickerItem | null;
  readonly onOpen: () => void;
  readonly testId: string;
};

function TickerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h20v-1l-2-2Z"
      />
    </svg>
  );
}

export function HomeInboxTicker({ item, onOpen, testId }: Props) {
  if (!item) return null;

  const line = item.body ? `${item.title} · ${item.body}` : item.title;

  return (
    <button
      type="button"
      className="wm-homeInboxTicker"
      data-testid={testId}
      data-inbox-domain={item.domain}
      data-ui-state="active"
      onClick={onOpen}
      aria-label={`Latest notification: ${line}. Open inbox or related action.`}
    >
      <span className="wm-homeInboxTicker__icon" data-domain={item.domain}>
        <TickerIcon />
      </span>
      <span className="wm-homeInboxTicker__copy">
        <span className="wm-homeInboxTicker__kicker">New update</span>
        <span className="wm-homeInboxTicker__line">{line}</span>
      </span>
      <span className="wm-homeInboxTicker__go" aria-hidden="true">
        View
      </span>
    </button>
  );
}
