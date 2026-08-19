/** Issued pass actions — WhatsApp, native share, PDF, copy, revoke. */

import { useState } from "react";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";
import { exportPassToPdf } from "../helpers/mitraLabs.helpers";
import {
  buildEventPassShareText,
  buildWhatsAppShareHref,
  canUseNativeShare,
  sharePassNatively,
} from "../helpers/digitalInviteShare.helpers";
import type { DigitalPassRecord } from "../storage/mitraLabs.storage";

type Props = {
  readonly record: DigitalPassRecord;
  readonly companyName: string;
  readonly verifyUrl: string;
  readonly onRevoke: () => void;
};

export function DigitalInviteIssuedCardActions({
  record,
  companyName,
  verifyUrl,
  onRevoke,
}: Props) {
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [copyHint, setCopyHint] = useState("Copy Link");
  const shareText = buildEventPassShareText({
    companyName,
    guestName: record.guestName,
    eventName: record.eventName?.trim() || record.purpose,
    venueName: record.venue.name,
    validFrom: record.validFrom,
    validUntil: record.validUntil,
    verifyUrl,
  });
  const whatsappHref = buildWhatsAppShareHref(shareText);
  const revoked = record.status === "revoked";
  const showNativeShare = canUseNativeShare();

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(verifyUrl);
      setCopyHint("Copied");
      window.setTimeout(() => setCopyHint("Copy Link"), 1600);
    } catch {
      setCopyHint("Copy failed");
      window.setTimeout(() => setCopyHint("Copy Link"), 1600);
    }
  }

  return (
    <div className="wm-mlPassActions" data-testid="mitra-pass-actions">
      <a
        className="wm-primarybtn wm-mlPassActions__whatsapp"
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="mitra-pass-whatsapp"
      >
        Share via WhatsApp
      </a>

      {showNativeShare ? (
        <button
          type="button"
          className="wm-outlineBtn wm-mlPassActions__native"
          data-testid="mitra-pass-native-share"
          onClick={() =>
            void sharePassNatively({
              title: `${companyName} event entry pass`,
              text: shareText,
              url: verifyUrl,
            })
          }
        >
          Share
        </button>
      ) : null}

      <div className="wm-mlPassActions__row">
        <button
          type="button"
          className="wm-outlineBtn"
          data-testid="mitra-pass-export-pdf"
          onClick={() => void exportPassToPdf(record, "mitra-pass-card")}
        >
          Export PDF
        </button>
        <button
          type="button"
          className="wm-outlineBtn"
          data-testid="mitra-pass-copy-link"
          onClick={() => void copyLink()}
        >
          {copyHint}
        </button>
      </div>

      <button
        type="button"
        className="wm-outlineBtn wm-mlPassActions__revoke"
        data-testid="mitra-pass-revoke"
        disabled={revoked}
        onClick={() => setRevokeOpen(true)}
      >
        Revoke Pass
      </button>

      <ConfirmModal
        confirm={
          revokeOpen
            ? {
                title: "Revoke this pass?",
                message: `${record.guestName} will no longer be valid at the gate.`,
                warning: "This cannot be undone from the door scanner.",
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
    </div>
  );
}
