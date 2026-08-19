/** Compact saved QR row inside an in-page event folder. */

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";
import { getPalette } from "../helpers/mitraLabs.helpers";
import { buildWhatsAppShareHref } from "../helpers/digitalInviteShare.helpers";
import { exportPosterPdfFromDom } from "../helpers/qrPosterExport.helpers";
import type { SavedQrPoster } from "../storage/qrPoster.storage";

type Props = {
  readonly poster: SavedQrPoster;
  readonly onDelete: () => void;
};

export function EventDayInPageQrItem({ poster, onDelete }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copyHint, setCopyHint] = useState("Copy Link");
  const palette = getPalette(poster.paletteId);
  const captureId = `mitra-folder-qr-${poster.posterId}`;
  const shareText = `Branded QR for ${poster.eventName} at ${poster.venue.name}\n${poster.payload}`;

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(poster.payload);
      setCopyHint("Copied");
      window.setTimeout(() => setCopyHint("Copy Link"), 1600);
    } catch {
      setCopyHint("Copy failed");
    }
  }

  return (
    <article className="wm-mlInPageItem" data-testid={`in-page-qr-${poster.posterId}`}>
      <div className="wm-mlInPageItem__qr" id={captureId}>
        <QRCodeSVG
          data-qr-poster-code
          value={poster.payload}
          size={88}
          level={poster.eccLevel}
          bgColor={palette.bg}
          fgColor={palette.fg}
        />
      </div>
      <div className="wm-mlInPageItem__copy">
        <div className="wm-mlListItem__title">Branded QR</div>
        <div className="wm-mlListItem__meta">{poster.venue.name}</div>
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
            onClick={() => void exportPosterPdfFromDom(captureId, poster.eventName, palette.accent)}
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
          onClick={() => setDeleteOpen(true)}
        >
          Delete / Revoke
        </button>
      </div>
      <ConfirmModal
        confirm={
          deleteOpen
            ? {
                title: "Delete this branded QR?",
                message: `${poster.eventName} · ${poster.venue.name}`,
                tone: "danger",
                confirmLabel: "Delete QR",
                cancelLabel: "Keep QR",
              }
            : null
        }
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          onDelete();
        }}
      />
    </article>
  );
}
