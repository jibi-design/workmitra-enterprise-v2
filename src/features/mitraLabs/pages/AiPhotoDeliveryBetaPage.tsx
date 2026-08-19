/**
 * Mitra Labs — AI Photo Delivery beta scaffold (flag-gated).
 * Day-1: empty / beta state only — no selfie capture, matching, or download APIs.
 * Enable with VITE_MITRA_LABS_AI_PHOTO=1.
 */

import { useNavigate } from "react-router-dom";
import { Camera, Download, ScanLine, Sparkles } from "lucide-react";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { MitraLabsBrandName } from "../../../shared/components/brand/BrandName";

const PIPELINE = [
  {
    id: "qr",
    title: "1. Scan event QR",
    detail: "Guest opens the opaque verify/scan link from the invite pass.",
    Icon: ScanLine,
  },
  {
    id: "selfie",
    title: "2. Capture selfie",
    detail: "Camera consent + capture modal — not wired for Day-1.",
    Icon: Camera,
  },
  {
    id: "match",
    title: "3. Face match",
    detail: "Recognition / matching service — not implemented.",
    Icon: Sparkles,
  },
  {
    id: "delivery",
    title: "4. Photo delivery",
    detail: "Matched album download — not implemented.",
    Icon: Download,
  },
] as const;

export function AiPhotoDeliveryBetaPage() {
  const nav = useNavigate();

  return (
    <div className="wm-dashPage wm-erDash wm-mlPage" data-testid="mitra-labs-ai-photo-beta">
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() => nav(ROUTE_PATHS.employerDashboardEventDay)}
        >
          ← Dashboard
        </button>
        <div className="wm-dashHero__kicker">
          <MitraLabsBrandName as="span" /> · Beta
        </div>
        <h1 className="wm-dashHero__title">AI Photo Delivery</h1>
        <p className="wm-dashHero__sub">
          Planned flow: QR → selfie → recognition → download. This Day-1 scaffold is gated and does
          not capture images or call matching APIs.
        </p>
      </header>

      <div className="wm-dashWidget wm-mlAiPhotoBeta" role="status">
        <div className="wm-dashWidget__kicker">Status</div>
        <p className="wm-mlAiPhotoBeta__status" data-testid="mitra-labs-ai-photo-status">
          Coming after Day-1 — UI scaffold only
        </p>
        <p className="wm-dashWidget__sub">
          Digital Invites and Artistic QR remain the supported <MitraLabsBrandName size="sm" />{" "}
          utilities. Enable this route only in lab builds via VITE_MITRA_LABS_AI_PHOTO=1.
        </p>
      </div>

      <ol className="wm-mlAiPhotoPipeline">
        {PIPELINE.map(({ id, title, detail, Icon }) => (
          <li key={id} className="wm-dashWidget wm-mlAiPhotoStep">
            <Icon size={18} aria-hidden="true" />
            <div>
              <div className="wm-mlAiPhotoStep__title">{title}</div>
              <div className="wm-mlAiPhotoStep__detail">{detail}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default AiPhotoDeliveryBetaPage;
