/** Compact pass row inside an in-page event folder. */

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";
import { buildVerificationUrl, exportPassToPdf, getPalette } from "../helpers/mitraLabs.helpers";
import {
  buildEventPassShareText,
  buildWhatsAppShareHref,
} from "../helpers/digitalInviteShare.helpers";
import type { DigitalPassRecord } from "../storage/mitraLabs.storage";

type Props = {
  readonly record: DigitalPassRecord;
  readonly companyName: string;
  readonly onRevoke: () => void;
};

export function EventDayInPagePassItem({ record, companyName, onRevoke }: Props) {
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [copyHint, setCopyHint] = useState("Copy Link");
  const verifyUrl = buildVerificationUrl(record.passToken);
  const palette = getPalette(record.style?.paletteId ?? "teal_ink");
  const captureId = `mitra-folder-pass-${record.passId}`;
  const shareText = buildEventPassShareText({
    companyName,
    guestName: record.guestName,
    eventName: record.eventName?.trim() || record.purpose,
    venueName: record.venue.name,
    validFrom: record.validFrom,
    validUntil: record.validUntil,
    verifyUrl,
  });

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(verifyUrl);
      setCopyHint("Copied");
      window.setTimeout(() => setCopyHint("Copy Link"), 1600);
    } catch {
      setCopyHint("Copy failed");
    }
  }

  return (
    <article className="wm-mlInPageItem" data-testid={`in-page-pass-${record.passId}`}>
      <div className="wm-mlInPageItem__qr" id={captureId}>
        <QRCodeSVG
          value={verifyUrl}
          size={88}
          level={record.style?.eccLevel ?? "H"}
          bgColor={palette.bg}
          fgColor={palette.fg}
        />
      </div>
      <div className="wm-mlInPageItem__copy">
        <div className="wm-mlListItem__title">Door pass QR</div>
        <div className="wm-mlListItem__meta">{record.purpose} · {record.status}</div>
      </div>
      <div className="wm-mlInPageItem__actions">
        <a
          className="wm-primarybtn wm-mlPassActions__whatsapp"
          href={buildWhatsAppShareHref(shareText)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share via WhatsApp
        </a>
        <div className="wm-mlPassActions__row">
          <button
            type="button"
            className="wm-outlineBtn"
            onClick={() => void exportPassToPdf(record, captureId)}
          >
            Export PDF
          </button>
          <button type="button" className="wm-outlineBtn" onClick={() => void copyLink()}>
            {copyHint}
          </button>
        </div>
        <button
          type="button"
          className="wm-outlineBtn wm-mlPassActions__revoke"
          onClick={() => setRevokeOpen(true)}
        >
          Delete / Revoke
        </button>
      </div>
      <ConfirmModal
        confirm={
          revokeOpen
            ? {
                title: "Revoke this pass?",
                message: `${record.guestName} will no longer be valid at the gate.`,
                tone: "danger",
                confirmLabel: "Revoke pass",
                cancelLabel: "Keep pass",
              }
            : null
        }
        onCancel={() => setRevokeOpen(false)}
        onConfirm={() => {
          setRevokeOpen(false);
          onRevoke();
        }}
      />
    </article>
  );
}
