/** Branded QR poster preview — header, QR center logo/initials, footer tagline. */

import { QRCodeSVG } from "qrcode.react";
import { JobMitraBrandMark } from "../../../shared/components/brand/BrandMark";
import type { EccLevel } from "../validation/mitraLabs.schemas";
import { resolveQrCenterLogo } from "../helpers/qrPoster.helpers";

type Palette = {
  readonly fg: string;
  readonly bg: string;
  readonly accent: string;
};

type Props = {
  readonly posterId: string;
  readonly companyName: string;
  readonly companyLogo?: string;
  readonly payload: string;
  readonly palette: Palette;
  readonly eccLevel: EccLevel;
  readonly logoCover: number;
  readonly includeLogo: boolean;
  readonly qrSize?: number;
  readonly onDownloadSvg: () => void;
  readonly onDownloadPng: () => void;
  readonly onDownloadPdf: () => void;
};

export function ArtisticQrPoster({
  posterId,
  companyName,
  companyLogo,
  payload,
  palette,
  eccLevel,
  logoCover,
  includeLogo,
  qrSize = 220,
  onDownloadSvg,
  onDownloadPng,
  onDownloadPdf,
}: Props) {
  const displayName = companyName.trim() || "Job Mitra partner";
  const centerLogo = resolveQrCenterLogo(displayName, companyLogo, includeLogo);
  const logoPx = Math.round((logoCover / 100) * qrSize);

  return (
    <section className="wm-dashWidget wm-mlPreview" data-ui-state="active">
      <div className="wm-dashWidget__kicker">Poster preview</div>
      <p className="wm-mlPreview__hint">
        Only the framed poster below is included in your export file.
      </p>

      <div className="wm-mlQrPoster" id={posterId} data-testid="qr-poster-preview">
        <header className="wm-mlQrPoster__header">{displayName}</header>
        <div
          className="wm-mlQrPoster__qrFrame"
          style={{ borderColor: palette.accent, background: palette.bg }}
        >
          <QRCodeSVG
            data-qr-poster-code
            value={payload}
            size={qrSize}
            level={eccLevel}
            bgColor={palette.bg}
            fgColor={palette.fg}
            imageSettings={
              centerLogo && logoCover > 0
                ? {
                    src: centerLogo.src,
                    height: Math.max(16, logoPx),
                    width: Math.max(16, logoPx),
                    excavate: true,
                  }
                : undefined
            }
          />
        </div>
        <footer className="wm-mlQrPoster__footer">
          <span className="wm-mlQrPoster__footerLead">Powered by </span>
          <JobMitraBrandMark as="span" className="wm-mlQrPoster__footerMark" />
        </footer>
      </div>

      <div className="wm-mlPreviewExport">
        <div className="wm-dashWidget__kicker">Download export file</div>
        <p className="wm-mlPreview__hint">
          Saves the poster preview above — export buttons and labels are not printed.
        </p>
        <div className="wm-mlPosterExports">
          <button
            type="button"
            className="wm-outlineBtn wm-mlPosterExports__btn"
            data-testid="qr-poster-download-svg"
            onClick={onDownloadSvg}
          >
            Download SVG
          </button>
          <button
            type="button"
            className="wm-outlineBtn wm-mlPosterExports__btn"
            data-testid="qr-poster-download-png"
            onClick={onDownloadPng}
          >
            Download PNG
          </button>
          <button
            type="button"
            className="wm-outlineBtn wm-mlPosterExports__btn"
            data-testid="qr-poster-download-pdf"
            onClick={onDownloadPdf}
          >
            Download PDF
          </button>
        </div>
      </div>
    </section>
  );
}
