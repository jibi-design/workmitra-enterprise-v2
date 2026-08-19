/** Event folder overflow — delete action sheet. */

import { CenterModal } from "../../../shared/components/CenterModal";

type Props = {
  readonly open: boolean;
  readonly eventName: string;
  readonly onDelete: () => void;
  readonly onClose: () => void;
};

export function EventDayFolderActionSheet({ open, eventName, onDelete, onClose }: Props) {
  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Event folder actions" maxWidth={400}>
      <div className="wm-mlFolderSheet" data-testid="event-day-folder-action-sheet">
        <h2 className="wm-dashWidget__title">{eventName}</h2>
        <p className="wm-dashWidget__sub">Folder actions</p>
        <button
          type="button"
          className="wm-mlFolderSheet__danger"
          data-testid="event-day-folder-delete"
          onClick={onDelete}
        >
          Delete Event Folder
        </button>
        <button type="button" className="wm-outlineBtn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </CenterModal>
  );
}
