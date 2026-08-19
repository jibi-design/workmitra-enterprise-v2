/** Event-name tiles for Security Gate PIN. */

import { Folder } from "lucide-react";
import type { GatePinFolderCard } from "../helpers/eventDayGatePinFolders.helpers";

type Props = {
  readonly folders: readonly GatePinFolderCard[];
  readonly onOpen: (folder: GatePinFolderCard) => void;
};

export function EventDayGatePinFolderList({ folders, onOpen }: Props) {
  if (folders.length === 0) {
    return (
      <div className="wm-ent-empty" data-testid="gate-pin-folders-empty">
        <div className="wm-ent-empty__title">No folders yet</div>
        <p className="wm-ent-empty__subtitle">
          Generate a QR or issue a pass. A folder is created for that venue, event, and date —
          same labels as your QR folders. A new venue name creates a new PIN folder.
        </p>
      </div>
    );
  }

  return (
    <div className="wm-mlInPageFolderGrid" data-testid="gate-pin-folder-grid">
      {folders.map((folder) => (
        <button
          key={folder.folderId}
          type="button"
          className="wm-mlInPageFolder wm-mlInPageFolder--button"
          data-testid={`gate-pin-folder-${folder.folderId}`}
          onClick={() => onOpen(folder)}
        >
          <Folder className="wm-mlInPageFolder__icon" size={32} aria-hidden="true" />
          <span className="wm-mlInPageFolder__copy">
            <span className="wm-mlInPageFolder__title">{folder.venueName}</span>
            <span className="wm-mlInPageFolder__event">{folder.eventName}</span>
            <span className="wm-mlInPageFolder__meta">
              {folder.dateLabel} · {folder.passCount} passes
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
