/** Job Mitra | ArtisticQrStudioControls.tsx | QR payload + style controls */

import {
  LOGO_MAX_COVER_PCT,
  type EccLevel,
} from "../validation/mitraLabs.schemas";
import { QR_PALETTES } from "../helpers/mitraLabs.helpers";
import { JobMitraBrandName } from "../../../shared/components/brand/BrandName";
import { resolveQrCenterLogo } from "../helpers/qrPoster.helpers";

type Props = {
  readonly companyName: string;
  readonly companyLogo?: string;
  readonly mode: "token" | "custom";
  readonly customUrl: string;
  readonly payload: string;
  readonly paletteId: string;
  readonly eccLevel: EccLevel;
  readonly logoCover: number;
  readonly includeLogo: boolean;
  readonly error: string | null;
  readonly onMode: (mode: "token" | "custom") => void;
  readonly onCustomUrl: (value: string) => void;
  readonly onPaletteId: (value: string) => void;
  readonly onEccLevel: (value: EccLevel) => void;
  readonly onLogoCover: (value: number) => void;
  readonly onIncludeLogo: (value: boolean) => void;
  readonly onApply: () => void;
};

export function ArtisticQrStudioControls({
  companyName,
  companyLogo,
  mode,
  customUrl,
  payload,
  paletteId,
  eccLevel,
  logoCover,
  includeLogo,
  error,
  onMode,
  onCustomUrl,
  onPaletteId,
  onEccLevel,
  onLogoCover,
  onIncludeLogo,
  onApply,
}: Props) {
  const centerLogo = resolveQrCenterLogo(
    companyName.trim() || "Job Mitra partner",
    companyLogo,
    includeLogo,
  );
  const showLogoWarning = includeLogo && centerLogo?.isInitialsFallback;
  const showLogoReady = includeLogo && centerLogo && !centerLogo.isInitialsFallback;

  return (
    <section className="wm-dashWidget" data-ui-state={error ? "error" : "active"}>
      <div className="wm-dashWidget__kicker">Payload</div>
      <div className="wm-mlSeg">
        <button
          type="button"
          className={`wm-mlSeg__btn${mode === "token" ? " isOn" : ""}`}
          onClick={() => onMode("token")}
        >
          Verify token URL
        </button>
        <button
          type="button"
          className={`wm-mlSeg__btn${mode === "custom" ? " isOn" : ""}`}
          onClick={() => onMode("custom")}
        >
          Custom <JobMitraBrandName size="sm" /> link
        </button>
      </div>

      {mode === "custom" ? (
        <>
          <label className="wm-label" htmlFor="ml-qr-url">
            URL
          </label>
          <input
            id="ml-qr-url"
            className="wm-input"
            value={customUrl}
            onChange={(event) => onCustomUrl(event.target.value)}
          />
        </>
      ) : (
        <p className="wm-mlMono">{payload}</p>
      )}

      <label className="wm-label" htmlFor="ml-palette">
        Palette
      </label>
      <select
        id="ml-palette"
        className="wm-input"
        value={paletteId}
        onChange={(event) => onPaletteId(event.target.value)}
      >
        {QR_PALETTES.map((palette) => (
          <option key={palette.id} value={palette.id}>
            {palette.label}
          </option>
        ))}
      </select>

      <label className="wm-label" htmlFor="ml-ecc">
        ECC level
      </label>
      <select
        id="ml-ecc"
        className="wm-input"
        value={eccLevel}
        onChange={(event) => onEccLevel(event.target.value as EccLevel)}
      >
        <option value="M">M</option>
        <option value="Q">Q</option>
        <option value="H">H (recommended)</option>
      </select>

      <label className="wm-label" htmlFor="ml-logo">
        Logo cover % (max {LOGO_MAX_COVER_PCT})
      </label>
      <input
        id="ml-logo"
        type="range"
        min={0}
        max={LOGO_MAX_COVER_PCT}
        value={logoCover}
        onChange={(event) => onLogoCover(Number(event.target.value))}
      />
      <div className="wm-mlListItem__meta">{logoCover}%</div>

      <label className="wm-mlCheck">
        <input
          type="checkbox"
          checked={includeLogo}
          onChange={(event) => onIncludeLogo(event.target.checked)}
        />
        Include brand logo inset
      </label>

      {showLogoWarning ? (
        <div className="wm-mlPosterWarn" role="status" data-testid="qr-poster-logo-warning">
          No company logo uploaded. Preview uses auto-generated initials in the QR center only.
        </div>
      ) : null}
      {showLogoReady ? (
        <p className="wm-mlEditorNote" data-testid="qr-poster-logo-ready">
          Company logo inset is enabled for export.
        </p>
      ) : null}

      {error ? (
        <div className="wm-ent-error" data-ui-state="error">
          <div className="wm-ent-error__title">Could not apply style</div>
          <div className="wm-ent-error__subtitle">{error}</div>
        </div>
      ) : null}

      <button type="button" className="wm-primarybtn" id="ml-qr-apply" onClick={onApply}>
        Apply style
      </button>
    </section>
  );
}
