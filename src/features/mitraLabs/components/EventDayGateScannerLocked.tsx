/** Scanner: pick event folder, then enter that folder's shift PIN. */

import { EventDayGatePinFolderList } from "./EventDayGatePinFolderList";
import { EventDayGateScannerUnlock } from "./EventDayGateScannerUnlock";
import type { GatePinFolderCard } from "../helpers/eventDayGatePinFolders.helpers";

type Props = {
  readonly folders: readonly GatePinFolderCard[];
  readonly folder: GatePinFolderCard | null;
  readonly pin: string;
  readonly error: string | null;
  readonly busy: boolean;
  readonly onPick: (folder: GatePinFolderCard) => void;
  readonly onBack: () => void;
  readonly onPinChange: (value: string) => void;
  readonly onUnlock: () => void;
};

export function EventDayGateScannerLocked({
  folders,
  folder,
  pin,
  error,
  busy,
  onPick,
  onBack,
  onPinChange,
  onUnlock,
}: Props) {
  if (!folder) {
    return (
      <div data-testid="scanner-event-pick">
        <p className="wm-mlEntModal__inputHelp">
          Open the event folder for this door. Tiles show venue, event name, and date.
        </p>
        <EventDayGatePinFolderList folders={folders} onOpen={onPick} />
      </div>
    );
  }
  return (
    <>
      <button type="button" className="wm-outlineBtn wm-mlEntModal__btnFull" onClick={onBack}>
        Back to event folders
      </button>
      <EventDayGateScannerUnlock
        pin={pin}
        error={error}
        busy={busy}
        onPinChange={onPinChange}
        onUnlock={onUnlock}
      />
    </>
  );
}
