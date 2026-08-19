/** Job Mitra | DigitalInvitePassForm.tsx | Issue-pass form fields */

import type { RefObject } from "react";
import type { PassDurationPresetId } from "../helpers/mitraLabsPassWindow.helpers";
import { PASS_PURPOSES } from "../validation/mitraLabs.schemas";
import { DigitalInvitePassWindowPresets } from "./DigitalInvitePassWindowPresets";

type Props = {
  readonly guestName: string;
  readonly guestContact: string;
  readonly candidateRef: string;
  readonly eventName: string;
  readonly venueName: string;
  readonly venueAddress: string;
  readonly purpose: (typeof PASS_PURPOSES)[number];
  readonly validFrom: string;
  readonly validUntil: string;
  readonly durationPreset?: PassDurationPresetId;
  readonly onApplyDurationPreset: (presetId: PassDurationPresetId) => void;
  readonly error: string | null;
  readonly guestNameRef: RefObject<HTMLInputElement | null>;
  readonly onGuestName: (value: string) => void;
  readonly onGuestContact: (value: string) => void;
  readonly onCandidateRef: (value: string) => void;
  readonly onEventName: (value: string) => void;
  readonly onVenueName: (value: string) => void;
  readonly onVenueAddress: (value: string) => void;
  readonly onPurpose: (value: (typeof PASS_PURPOSES)[number]) => void;
  readonly onValidFrom: (value: string) => void;
  readonly onValidUntil: (value: string) => void;
  readonly onSubmit: () => void;
};

export function DigitalInvitePassForm({
  guestName,
  guestContact,
  candidateRef,
  eventName,
  venueName,
  venueAddress,
  purpose,
  validFrom,
  validUntil,
  durationPreset,
  onApplyDurationPreset,
  error,
  guestNameRef,
  onGuestName,
  onGuestContact,
  onCandidateRef,
  onEventName,
  onVenueName,
  onVenueAddress,
  onPurpose,
  onValidFrom,
  onValidUntil,
  onSubmit,
}: Props) {
  return (
    <section className="wm-dashWidget" data-ui-state={error ? "error" : "active"}>
      <label className="wm-label" htmlFor="guest-name-input">
        Guest or staff name
      </label>
      <input
        id="guest-name-input"
        ref={guestNameRef}
        className="wm-input"
        value={guestName}
        onChange={(event) => onGuestName(event.target.value)}
        placeholder="Guest / staff / visitor name"
      />

      <label className="wm-label" htmlFor="ml-contact">
        Contact (optional)
      </label>
      <input
        id="ml-contact"
        className="wm-input"
        value={guestContact}
        onChange={(event) => onGuestContact(event.target.value)}
        placeholder="Email or phone — stored on pass, never in QR"
      />

      <label className="wm-label" htmlFor="ml-ref">
        Candidate ref (optional, opaque)
      </label>
      <input
        id="ml-ref"
        className="wm-input"
        value={candidateRef}
        onChange={(event) => onCandidateRef(event.target.value)}
        placeholder="Opaque reference only"
      />

      <label className="wm-label" htmlFor="ml-event-name">
        Event name
      </label>
      <input
        id="ml-event-name"
        className="wm-input"
        value={eventName}
        onChange={(event) => onEventName(event.target.value)}
        placeholder="Open day, staff shift, guest night"
      />

      <label className="wm-label" htmlFor="ml-venue">
        Venue name
      </label>
      <input
        id="ml-venue"
        className="wm-input"
        value={venueName}
        onChange={(event) => onVenueName(event.target.value)}
      />

      <label className="wm-label" htmlFor="ml-addr">
        Venue address (optional)
      </label>
      <input
        id="ml-addr"
        className="wm-input"
        value={venueAddress}
        onChange={(event) => onVenueAddress(event.target.value)}
      />

      <label className="wm-label" htmlFor="ml-purpose">
        Purpose
      </label>
      <select
        id="ml-purpose"
        className="wm-input"
        value={purpose}
        onChange={(event) => onPurpose(event.target.value as (typeof PASS_PURPOSES)[number])}
      >
        {PASS_PURPOSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <DigitalInvitePassWindowPresets
        activePreset={durationPreset}
        onApply={onApplyDurationPreset}
      />

      <div className="wm-mlFormRow">
        <div>
          <label className="wm-label" htmlFor="ml-from">
            Valid from
          </label>
          <input
            id="ml-from"
            type="datetime-local"
            className="wm-input"
            value={validFrom}
            onChange={(event) => onValidFrom(event.target.value)}
          />
        </div>
        <div>
          <label className="wm-label" htmlFor="ml-until">
            Valid until
          </label>
          <input
            id="ml-until"
            type="datetime-local"
            className="wm-input"
            value={validUntil}
            onChange={(event) => onValidUntil(event.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="wm-ent-error" data-ui-state="error">
          <div className="wm-ent-error__title">Could not issue pass</div>
          <div className="wm-ent-error__subtitle">{error}</div>
        </div>
      ) : null}

      <button type="button" className="wm-primarybtn" onClick={onSubmit}>
        Issue digital pass
      </button>
    </section>
  );
}
