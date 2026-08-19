/** Issued pass preview — branded event badge + share actions. */

import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";
import { JobMitraBrandMark } from "../../../shared/components/brand/BrandMark";
import { DigitalInviteIssuedCardActions } from "./DigitalInviteIssuedCardActions";
import {
  formatPassValidityInstant,
  resolvePassEventLabel,
} from "../helpers/digitalInviteShare.helpers";
import type { DigitalPassRecord } from "../storage/mitraLabs.storage";

type Palette = {
  readonly accent: string;
  readonly bg: string;
  readonly fg: string;
};

type Props = {
  readonly record: DigitalPassRecord;
  readonly companyName: string;
  readonly verifyUrl: string;
  readonly palette: Palette;
  readonly onRevoke: () => void;
  readonly onClose: () => void;
};

export function DigitalInviteIssuedCard({
  record,
  companyName,
  verifyUrl,
  palette,
  onRevoke,
  onClose,
}: Props) {
  const issuer = companyName.trim() || "Employer";
  const eventLabel = resolvePassEventLabel(record.eventName, record.purpose);
  const validFrom = formatPassValidityInstant(record.validFrom);
  const validUntil = formatPassValidityInstant(record.validUntil);

  return (
    <section
      className="wm-dashWidget wm-mlIssued"
      data-testid="mitra-pass-card"
      data-ui-state="active"
    >
      <div className="wm-mlIssued__bar">
        <span className="wm-mlIssued__barLabel">Last issued pass</span>
        <button
          type="button"
          className="wm-outlineBtn wm-mlIssued__close"
          data-testid="mitra-pass-card-close"
          aria-label="Close last issued pass"
          onClick={onClose}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="wm-mlPassBadge" id="mitra-pass-card" data-testid="mitra-pass-badge">
        <header className="wm-mlPassBadge__header">
          <p className="wm-mlPassBadge__kicker">Event entry pass</p>
          <h2 className="wm-mlPassBadge__company">{issuer}</h2>
        </header>

        <dl className="wm-mlPassBadge__meta">
          <div>
            <dt>Guest / staff</dt>
            <dd>{record.guestName}</dd>
          </div>
          <div>
            <dt>Event</dt>
            <dd>{eventLabel}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{record.venue.name}</dd>
          </div>
          <div>
            <dt>Valid from</dt>
            <dd>{validFrom}</dd>
          </div>
          <div>
            <dt>Valid until</dt>
            <dd>{validUntil}</dd>
          </div>
        </dl>

        <div className="wm-mlPassBadge__qr" style={{ borderColor: palette.accent }}>
          <QRCodeSVG
            id="mitra-pass-qr-svg"
            value={verifyUrl}
            size={200}
            level={record.style?.eccLevel ?? "H"}
            bgColor={palette.bg}
            fgColor={palette.fg}
            imageSettings={{
              src: "/wm-icon.svg",
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
        </div>

        <footer className="wm-mlPassBadge__footer">
          <span className="wm-mlPassBadge__powered">Powered by </span>
          <JobMitraBrandMark as="span" className="wm-mlPassBadge__mark" />
        </footer>
      </div>

      <DigitalInviteIssuedCardActions
        record={record}
        companyName={issuer}
        verifyUrl={verifyUrl}
        onRevoke={onRevoke}
      />
    </section>
  );
}
