/** Event + person identity used when generating a branded QR into nested folders. */

type Props = {
  readonly eventName: string;
  readonly personName: string;
  readonly venueName: string;
  readonly error: string | null;
  readonly onEventName: (value: string) => void;
  readonly onPersonName: (value: string) => void;
  readonly onVenueName: (value: string) => void;
  readonly onGenerate: () => void;
};

export function ArtisticQrSaveBar({
  eventName,
  personName,
  venueName,
  error,
  onEventName,
  onPersonName,
  onVenueName,
  onGenerate,
}: Props) {
  return (
    <section className="wm-dashWidget" data-ui-state={error ? "error" : "active"} data-testid="qr-save-folder-bar">
      <div className="wm-dashWidget__kicker">Generate into folders</div>
      <h2 className="wm-dashWidget__title">Venue folder, then guest or staff folder</h2>
      <p className="wm-dashWidget__sub">
        The first generate creates the venue folder, then a folder named after the guest or staff, then this QR inside.
      </p>
      <label className="wm-label" htmlFor="ml-qr-event">
        Event name
      </label>
      <input
        id="ml-qr-event"
        className="wm-input"
        value={eventName}
        onChange={(event) => onEventName(event.target.value)}
        placeholder="Open day, guest night"
      />
      <label className="wm-label" htmlFor="ml-qr-person">
        Person name
      </label>
      <input
        id="ml-qr-person"
        className="wm-input"
        value={personName}
        onChange={(event) => onPersonName(event.target.value)}
        placeholder="ASF, guest, or staff name"
      />
      <label className="wm-label" htmlFor="ml-qr-venue">
        Venue
      </label>
      <input
        id="ml-qr-venue"
        className="wm-input"
        value={venueName}
        onChange={(event) => onVenueName(event.target.value)}
        placeholder="Hall name"
      />
      {error ? (
        <div className="wm-ent-error" data-ui-state="error">
          <div className="wm-ent-error__subtitle">{error}</div>
        </div>
      ) : null}
      <button type="button" className="wm-primarybtn" onClick={onGenerate} data-testid="qr-save-to-folder">
        Generate QR
      </button>
    </section>
  );
}
