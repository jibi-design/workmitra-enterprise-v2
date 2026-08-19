/**
 * Event Day branded QR poster designer — /employer/labs/qr
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../../shared/store/authStore";
import { bundleItemsByVenueThenPerson } from "../helpers/eventDayFolders.helpers";
import { useQrPosterStore } from "../storage/qrPoster.storage";
import { QrCode } from "lucide-react";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import { EnterpriseEmpty } from "../../../shared/components/enterprise/EnterpriseEmpty";
import { ArtisticQrPoster } from "../components/ArtisticQrPoster";
import { ArtisticQrSaveBar } from "../components/ArtisticQrSaveBar";
import { ArtisticQrStudioControls } from "../components/ArtisticQrStudioControls";
import { EventDayInPageFolders } from "../components/EventDayInPageFolders";
import { EventDayInPageQrItem } from "../components/EventDayInPageQrItem";
import { EventDayGatePinModal } from "../components/EventDayGatePinModal";
import { EventDayLanScanHint } from "../components/EventDayLanScanHint";
import { EventDayGateScannerModal } from "../components/EventDayGateScannerModal";
import { exportPosterSvgFromDom } from "../helpers/qrPoster.helpers";
import {
  exportPosterPdfFromDom,
  exportPosterPngFromDom,
} from "../helpers/qrPosterExport.helpers";
import {
  buildVerificationUrl,
  generateOpaquePassToken,
  getPalette,
} from "../helpers/mitraLabs.helpers";
import {
  PassStyleConfigSchema,
  type EccLevel,
} from "../validation/mitraLabs.schemas";

const POSTER_ROOT_ID = "mitra-qr-poster-export";

function defaultLabsBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_LABS_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim();
  return "https://mitralabs.app";
}

export function ArtisticQrStudio() {
  const nav = useNavigate();
  const issuerId = useAuthStore((s) => s.user?.id ?? "");
  const posters = useQrPosterStore((s) => s.posters);
  const savePoster = useQrPosterStore((s) => s.savePoster);
  const deletePoster = useQrPosterStore((s) => s.deletePoster);
  const deletePosterFolder = useQrPosterStore((s) => s.deletePosterFolder);
  const deletePosterPersonFolder = useQrPosterStore((s) => s.deletePosterPersonFolder);
  const [searchParams, setSearchParams] = useSearchParams();
  const profile = employerSettingsStorage.get();
  const [started, setStarted] = useState(true);
  const panel = searchParams.get("panel");
  const pinOpen = panel === "pin";
  const scannerOpen = panel === "scanner";
  const [mode, setMode] = useState<"token" | "custom">("token");
  const [customUrl, setCustomUrl] = useState(defaultLabsBaseUrl);
  const [token, setToken] = useState(() => generateOpaquePassToken());
  const [paletteId, setPaletteId] = useState("teal_ink");
  const [eccLevel, setEccLevel] = useState<EccLevel>("H");
  const [logoCover, setLogoCover] = useState(12);
  const [includeLogo, setIncludeLogo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [personName, setPersonName] = useState("");
  const [venueName, setVenueName] = useState("");

  const payload = useMemo(() => {
    if (mode === "token") return buildVerificationUrl(token);
    return customUrl.trim();
  }, [mode, token, customUrl]);

  const folderPosters = useMemo(
    () => posters.filter((row) => (issuerId ? row.issuerId === issuerId : true)),
    [posters, issuerId],
  );
  const folders = useMemo(() => bundleItemsByVenueThenPerson(folderPosters), [folderPosters]);
  const palette = getPalette(paletteId);
  const uiState = error ? "error" : started ? "active" : "empty";

  useEffect(() => {
    if (!started) return;
    document.getElementById("ml-qr-apply")?.focus();
  }, [started]);

  function clearPanelParam() {
    if (!searchParams.get("panel")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("panel");
    setSearchParams(next, { replace: true });
  }

  function validateStyle() {
    const parsed = PassStyleConfigSchema.safeParse({
      eccLevel,
      logoMaxCoverPct: logoCover,
      paletteId,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid style");
      return false;
    }
    if (mode === "custom") {
      try {
        const url = new URL(customUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          setError("Custom payload must be an http(s) URL");
          return false;
        }
      } catch {
        setError("Custom payload must be a valid URL");
        return false;
      }
    }
    setError(null);
    return true;
  }

  function downloadSvg() {
    if (!validateStyle()) return;
    exportPosterSvgFromDom(POSTER_ROOT_ID, profile.companyName, palette.accent);
  }

  async function downloadPng() {
    if (!validateStyle()) return;
    await exportPosterPngFromDom(POSTER_ROOT_ID, profile.companyName, palette.accent);
  }

  async function downloadPdf() {
    if (!validateStyle()) return;
    await exportPosterPdfFromDom(POSTER_ROOT_ID, profile.companyName, palette.accent);
  }

  function generateIntoFolders() {
    setSaveError(null);
    if (!issuerId) {
      setSaveError("Sign in as an employer to generate branded QRs.");
      return;
    }
    if (!eventName.trim() || !personName.trim() || !venueName.trim()) {
      setSaveError("Event name, person name, and venue are required.");
      return;
    }
    if (!validateStyle()) return;
    savePoster({
      issuerId,
      eventName: eventName.trim(),
      guestName: personName.trim(),
      venue: { name: venueName.trim() },
      validFrom: new Date().toISOString(),
      payload,
      paletteId,
      eccLevel,
      logoCover,
      includeLogo,
    });
    setToken(generateOpaquePassToken());
    setPersonName("");
  }

  return (
    <div className="wm-dashPage wm-erDash wm-mlPage" data-testid="artistic-qr-studio" data-ui-state={uiState}>
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() => nav(ROUTE_PATHS.employerDashboardEventDay)}
        >
          ← Dashboard
        </button>
        <div className="wm-dashHero__kicker">
          <QrCode size={12} aria-hidden="true" /> Event day workflow
        </div>
        <h1 className="wm-dashHero__title">Create branded QR &amp; export</h1>
        <p className="wm-dashHero__sub">
          Design a print-ready poster — download SVG, PNG, or PDF for your venue.
        </p>
      </header>
      <EventDayLanScanHint />

      {!started ? (
        <div data-testid="artistic-qr-page-empty">
          <EnterpriseEmpty
            title="Open branded QR designer"
            subtitle="Design a print-ready poster with SVG, PNG, or PDF export."
            primaryLabel="Create branded QR"
            onPrimary={() => setStarted(true)}
          />
        </div>
      ) : (
        <div className="wm-mlStudioGrid">
          <ArtisticQrStudioControls
            companyName={profile.companyName}
            companyLogo={profile.companyLogo}
            mode={mode}
            customUrl={customUrl}
            payload={payload}
            paletteId={paletteId}
            eccLevel={eccLevel}
            logoCover={logoCover}
            includeLogo={includeLogo}
            error={error}
            onMode={setMode}
            onCustomUrl={setCustomUrl}
            onPaletteId={setPaletteId}
            onEccLevel={setEccLevel}
            onLogoCover={setLogoCover}
            onIncludeLogo={setIncludeLogo}
            onApply={() => validateStyle()}
          />
          <ArtisticQrPoster
            posterId={POSTER_ROOT_ID}
            companyName={profile.companyName}
            companyLogo={profile.companyLogo}
            payload={payload}
            palette={palette}
            eccLevel={eccLevel}
            logoCover={logoCover}
            includeLogo={includeLogo}
            onDownloadSvg={downloadSvg}
            onDownloadPng={() => void downloadPng()}
            onDownloadPdf={() => void downloadPdf()}
          />
        </div>
      )}

      {started ? (
        <>
          <ArtisticQrSaveBar
            eventName={eventName}
            personName={personName}
            venueName={venueName}
            error={saveError}
            onEventName={setEventName}
            onPersonName={setPersonName}
            onVenueName={setVenueName}
            onGenerate={generateIntoFolders}
          />
          <EventDayInPageFolders
            bundles={folders}
            testId="qr-in-page-folders"
            emptyTitle="No QR folders yet"
            emptySubtitle="Generate a QR with venue and guest or staff name. Folders are created automatically."
            onDeleteFolder={(folder) => deletePosterFolder(folder.folderId)}
            onDeletePersonFolder={(personFolderId) => deletePosterPersonFolder(personFolderId)}
            getItemKey={(poster) => poster.posterId}
            renderItem={(poster) => (
              <EventDayInPageQrItem
                poster={poster}
                onDelete={() => deletePoster(poster.posterId)}
              />
            )}
          />
        </>
      ) : null}

      <EventDayGatePinModal
        open={pinOpen}
        onClose={() => {
          clearPanelParam();
        }}
      />
      <EventDayGateScannerModal
        open={scannerOpen}
        onClose={() => {
          clearPanelParam();
        }}
      />
    </div>
  );
}

export default ArtisticQrStudio;
