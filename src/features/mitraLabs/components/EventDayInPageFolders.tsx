/** Nested in-page folders: venue → guest/staff → QR. Stays on the current labs page. */

import { useState, type ReactNode } from "react";
import { Folder, X } from "lucide-react";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";
import { EnterpriseEmpty } from "../../../shared/components/enterprise/EnterpriseEmpty";
import {
  PERSON_FOLDER_DELETE_WARNING,
  VENUE_FOLDER_DELETE_WARNING,
  type EventFolderCard,
  type NestedEventFolderBundle,
  type PersonFolderBundle,
} from "../helpers/eventDayFolders.helpers";

type PendingDelete =
  | { readonly kind: "venue"; readonly folder: EventFolderCard }
  | { readonly kind: "person"; readonly venueName: string; readonly person: PersonFolderBundle<unknown> };

type Props<T> = {
  readonly bundles: readonly NestedEventFolderBundle<T>[];
  readonly emptyTitle: string;
  readonly emptySubtitle: string;
  readonly testId: string;
  readonly onDeleteFolder: (folder: EventFolderCard) => void;
  readonly onDeletePersonFolder: (personFolderId: string) => void;
  readonly getItemKey: (item: T) => string;
  readonly renderItem: (item: T) => ReactNode;
};

function closePersonFolder(event: { currentTarget: HTMLButtonElement }) {
  const folder = event.currentTarget.closest("details");
  if (folder) folder.open = false;
}

export function EventDayInPageFolders<T>({
  bundles,
  emptyTitle,
  emptySubtitle,
  testId,
  onDeleteFolder,
  onDeletePersonFolder,
  getItemKey,
  renderItem,
}: Props<T>) {
  const [pending, setPending] = useState<PendingDelete | null>(null);

  if (bundles.length === 0) {
    return (
      <section className="wm-dashWidget" data-ui-state="empty" data-testid={`${testId}-empty`}>
        <EnterpriseEmpty title={emptyTitle} subtitle={emptySubtitle} testId={`${testId}-empty-copy`} />
      </section>
    );
  }

  return (
    <section className="wm-mlInPageFolders" data-ui-state="active" data-testid={testId}>
      <div className="wm-dashWidget__kicker">Venue folders</div>
      <h2 className="wm-dashWidget__title">On this page</h2>
      <p className="wm-dashWidget__sub">
        Folder tiles, like a computer. Open a venue, then a name — QR stays inside.
      </p>
      <div className="wm-mlInPageFolderGrid">
      {bundles.map((bundle) => (
        <details
          key={bundle.folder.folderId}
          className="wm-mlInPageFolder"
          data-testid={`in-page-folder-${bundle.folder.folderId}`}
        >
          <summary className="wm-mlInPageFolder__summary">
            <Folder className="wm-mlInPageFolder__icon" size={32} aria-hidden="true" />
            <span className="wm-mlInPageFolder__copy">
              <span className="wm-mlInPageFolder__title">{bundle.folder.venueName}</span>
              <span className="wm-mlInPageFolder__event">{bundle.folder.eventName}</span>
              <span className="wm-mlInPageFolder__meta">
                {bundle.folder.dateLabel} · {bundle.people.length} people
              </span>
            </span>
          </summary>
          <div className="wm-mlInPageFolder__body">
            <div className="wm-mlInPageFolder__people">
            {bundle.people.map((person) => (
              <details
                key={person.personFolderId}
                className="wm-mlInPageFolder wm-mlInPageFolder--person"
                data-testid={`in-page-person-${person.personFolderId}`}
              >
                <summary className="wm-mlInPageFolder__summary">
                  <Folder className="wm-mlInPageFolder__icon" size={32} aria-hidden="true" />
                  <span className="wm-mlInPageFolder__copy">
                    <span className="wm-mlInPageFolder__title">{person.personName}</span>
                    <span className="wm-mlInPageFolder__event">{person.eventLabel}</span>
                    <span className="wm-mlInPageFolder__meta">
                      {person.dateLabel} · {person.items.length} QR
                    </span>
                  </span>
                </summary>
                <button
                  type="button"
                  className="wm-outlineBtn wm-mlInPageFolder__close"
                  data-testid={`in-page-person-close-${person.personFolderId}`}
                  aria-label={`Close ${person.personName} folder`}
                  onClick={closePersonFolder}
                >
                  <X size={16} aria-hidden="true" />
                </button>
                <div className="wm-mlInPageFolder__body">
                  {person.items.map((item) => (
                    <div key={getItemKey(item)}>{renderItem(item)}</div>
                  ))}
                  <button
                    type="button"
                    className="wm-outlineBtn wm-mlPassActions__revoke"
                    data-testid={`in-page-person-delete-${person.personFolderId}`}
                    onClick={() => setPending({ kind: "person", venueName: bundle.folder.venueName, person })}
                  >
                    Delete {person.personName}
                  </button>
                </div>
              </details>
            ))}
            </div>
            <button
              type="button"
              className="wm-outlineBtn wm-mlPassActions__revoke"
              data-testid={`in-page-folder-delete-${bundle.folder.folderId}`}
              onClick={() => setPending({ kind: "venue", folder: bundle.folder })}
            >
              Delete {bundle.folder.venueName}
            </button>
          </div>
        </details>
      ))}
      </div>
      <ConfirmModal
        confirm={
          pending?.kind === "venue"
            ? {
                title: `Delete ${pending.folder.venueName}?`,
                message: "All guest and staff folders in this venue",
                warning: VENUE_FOLDER_DELETE_WARNING,
                tone: "danger",
                confirmLabel: "Delete folder",
                cancelLabel: "Keep folder",
              }
            : pending?.kind === "person"
              ? {
                  title: `Delete ${pending.person.personName}?`,
                  message: `Inside ${pending.venueName}`,
                  warning: PERSON_FOLDER_DELETE_WARNING,
                  tone: "danger",
                  confirmLabel: "Delete folder",
                  cancelLabel: "Keep folder",
                }
              : null
        }
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending?.kind === "venue") onDeleteFolder(pending.folder);
          if (pending?.kind === "person") onDeletePersonFolder(pending.person.personFolderId);
          setPending(null);
        }}
      />
    </section>
  );
}
