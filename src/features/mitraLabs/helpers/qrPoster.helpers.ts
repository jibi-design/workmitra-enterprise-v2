/** QR poster — company initials, center badge, full SVG export. */

export type QrCenterLogo = {
  readonly src: string;
  readonly isInitialsFallback: boolean;
  readonly initials: string;
};

const BRAND_JOB = "#059669";
const BRAND_MITRA = "#0f172a";
const MUTED = "#64748b";

/** Derive 2-letter initials from company name (e.g. "Acme Corp" → "AC"). */
export function deriveCompanyInitials(companyName: string): string {
  const words = companyName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "CO";
  if (words.length === 1) {
    const word = words[0]!;
    return word.slice(0, 2).toUpperCase().padEnd(2, word[0]!.toUpperCase());
  }
  return `${words[0]![0]!}${words[1]![0]!}`.toUpperCase();
}

/** High-contrast initials badge as SVG data URL for QR center inset. */
export function buildInitialsBadgeDataUrl(initials: string, accent = BRAND_MITRA): string {
  const safe = initials.slice(0, 3).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="${accent}"/>
  <text x="32" y="40" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif"
    font-size="22" font-weight="800" fill="#ffffff">${safe}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function resolveQrCenterLogo(
  companyName: string,
  companyLogo: string | undefined,
  includeLogo: boolean,
): QrCenterLogo | null {
  if (!includeLogo) return null;
  const initials = deriveCompanyInitials(companyName);
  if (companyLogo?.trim()) {
    return { src: companyLogo.trim(), isInitialsFallback: false, initials };
  }
  return {
    src: buildInitialsBadgeDataUrl(initials),
    isInitialsFallback: true,
    initials,
  };
}

export type PosterSvgInput = {
  readonly companyName: string;
  readonly qrSvgElement: SVGSVGElement;
  readonly paletteAccent: string;
  readonly posterWidth?: number;
};

/** Compose print-ready poster SVG with header, embedded QR, and footer tagline. */
export function composePosterSvg(input: PosterSvgInput): string {
  const posterWidth = input.posterWidth ?? 320;
  const qrSvg = input.qrSvgElement;
  const qrSize = Number(qrSvg.getAttribute("width")) || 220;
  const headerH = 56;
  const footerH = 48;
  const qrPad = 14;
  const qrX = (posterWidth - qrSize) / 2;
  const qrY = headerH + qrPad;
  const frameSize = qrSize + qrPad * 2;
  const posterHeight = headerH + frameSize + 28 + footerH;
  const footerY = qrY + qrSize + qrPad + 36;
  const title = escapeXml(input.companyName.trim() || "Job Mitra partner");
  const innerQr = qrSvg.innerHTML;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${posterWidth}" height="${posterHeight}" viewBox="0 0 ${posterWidth} ${posterHeight}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${posterWidth / 2}" y="38" text-anchor="middle"
    font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="20" font-weight="700"
    fill="${BRAND_MITRA}">${title}</text>
  <rect x="${qrX - qrPad}" y="${qrY - qrPad}" width="${frameSize}" height="${frameSize}"
    rx="14" fill="#ffffff" stroke="${input.paletteAccent}" stroke-width="2"/>
  <svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" viewBox="0 0 ${qrSize} ${qrSize}">
    ${innerQr}
  </svg>
  <text x="${posterWidth / 2}" y="${footerY}" text-anchor="middle"
    font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11">
    <tspan fill="${MUTED}">Powered by </tspan>
    <tspan fill="${BRAND_JOB}" font-weight="700">Job </tspan>
    <tspan fill="${BRAND_MITRA}" font-weight="700">Mitra</tspan>
  </text>
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadPosterSvg(svg: string, filename = "job-mitra-qr-poster.svg"): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportPosterSvgFromDom(
  posterRootId: string,
  companyName: string,
  paletteAccent: string,
): boolean {
  if (typeof document === "undefined") return false;
  const root = document.getElementById(posterRootId);
  const qrSvg = root?.querySelector("svg[data-qr-poster-code]");
  if (!(qrSvg instanceof SVGSVGElement)) return false;
  const svg = composePosterSvg({ companyName, qrSvgElement: qrSvg, paletteAccent });
  downloadPosterSvg(svg);
  return true;
}
