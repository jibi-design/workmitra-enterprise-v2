/** Public pass verify — status + guest details card. */

import type { PassVerifyBadge } from "../helpers/mitraLabs.helpers";
import type { PublicVerifyPassFields } from "../hooks/usePublicPassVerify";
import { formatGatePortalDateTime } from "../helpers/digitalInviteShare.helpers";
import {
  OUTSIDE_PASS_WINDOW_COPY,
  formatPassVerifyHeadline,
  passVerifyBadgeTone,
} from "../helpers/mitraLabsGate.helpers";
import { isOutsidePassWindow } from "../helpers/mitraLabsPassWindow.helpers";

type Props = {
  readonly badge: PassVerifyBadge;
  readonly pass?: PublicVerifyPassFields;
  readonly checkedInAt?: string;
  readonly onOpenCheckIn: () => void;
};

export function PublicPassVerifyCard({ badge, pass, checkedInAt, onOpenCheckIn }: Props) {
  const tone = passVerifyBadgeTone(badge);
  const headline = formatPassVerifyHeadline(badge, pass);
  const canCheckIn = badge === "VALID" && pass && !checkedInAt;

  return (
    <div className="wm-dashWidget wm-mlVerifyCard" data-testid="public-pass-verify-card">
      <div
        className={`wm-mlBadge wm-mlBadge--${tone}`}
        data-testid="pass-verify-badge"
        role="status"
      >
        {headline}
      </div>
      <p className="wm-dashWidget__sub wm-mlVerifyCard__lead">
        App-less scan — no download or login required. Entry stays locked until the gate PIN is
        verified.
      </p>

      {pass ? (
        <div className="wm-mlVerifyCard__panel" data-testid="pass-verify-details">
          <dl className="wm-mlVerifyCard__meta">
            <div>
              <dt>Staff</dt>
              <dd>{pass.guestName}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>
                {pass.venue.name}
                {pass.venue.address ? ` · ${pass.venue.address}` : ""}
              </dd>
            </div>
            <div>
              <dt>Purpose</dt>
              <dd>{pass.purpose}</dd>
            </div>
            <div>
              <dt>Valid from</dt>
              <dd>{formatGatePortalDateTime(pass.validFrom)}</dd>
            </div>
            <div>
              <dt>Valid until</dt>
              <dd>{formatGatePortalDateTime(pass.validUntil)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="wm-dashWidget__sub">No matching pass for this scan token.</p>
      )}

      {badge !== "VALID" && pass ? (
        <p className="wm-mlVerifyCard__readonly" data-testid="pass-verify-readonly-note">
          {badge === "REVOKED"
            ? "This pass was revoked by the issuer."
            : isOutsidePassWindow(pass)
              ? OUTSIDE_PASS_WINDOW_COPY
              : "This pass is inactive or outside its validity window."}
        </p>
      ) : null}

      {checkedInAt ? (
        <div className="wm-mlVerifyCard__success" role="status" data-testid="pass-checkin-success">
          Entry recorded at {formatGatePortalDateTime(checkedInAt)}.
        </div>
      ) : null}

      {canCheckIn ? (
        <button
          type="button"
          className="wm-primarybtn wm-mlVerifyCard__checkIn"
          onClick={onOpenCheckIn}
          data-testid="pass-checkin-open"
        >
          Mark Entry / Check-In
        </button>
      ) : null}
    </div>
  );
}
