/** Event report — folder card with long-press and overflow menu. */

import { Folder, MoreVertical } from "lucide-react";
import type { EventFolderCard } from "../helpers/eventDayFolders.helpers";
import { useEventFolderLongPress } from "../hooks/useEventFolderLongPress";

type Props = {
  readonly folder: EventFolderCard;
  readonly onOpen: () => void;
  readonly onMenu: () => void;
};

export function EventDayFolderCard({ folder, onOpen, onMenu }: Props) {
  const press = useEventFolderLongPress(onMenu);

  return (
    <article className="wm-mlFolderCard" data-testid="event-day-folder-card">
      <button
        type="button"
        className="wm-mlFolderCard__main"
        data-testid={`event-day-folder-open-${folder.folderId}`}
        {...press.pointerProps}
        onClick={() => {
          if (press.consumeLongPress()) return;
          onOpen();
        }}
      >
        <Folder size={22} aria-hidden="true" />
        <span className="wm-mlFolderCard__copy">
          <span className="wm-mlFolderCard__title">{folder.eventName}</span>
          <span className="wm-mlFolderCard__meta">
            {folder.venueName} · {folder.dateLabel}
            <br />
            {folder.passCount} passes · {folder.checkInCount} PIN entries
          </span>
        </span>
      </button>
      <button
        type="button"
        className="wm-mlFolderCard__menu"
        aria-label={`Folder actions for ${folder.eventName}`}
        data-testid={`event-day-folder-menu-${folder.folderId}`}
        onClick={(event) => {
          event.stopPropagation();
          onMenu();
        }}
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>
    </article>
  );
}
