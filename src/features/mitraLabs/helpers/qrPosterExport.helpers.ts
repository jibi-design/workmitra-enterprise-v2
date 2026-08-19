/** QR poster raster export — PNG + PDF downloads. */

import type { PosterSvgInput } from "./qrPoster.helpers";
import { composePosterSvg } from "./qrPoster.helpers";

async function posterSvgString(input: PosterSvgInput): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const svg = composePosterSvg(input);
  return svg;
}

async function rasterizePosterSvg(svg: string, scale = 2): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width * scale;
        const height = img.height * scale;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas unavailable"));
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("poster rasterize failed"));
      img.src = url;
    });
    return dataUrl;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

export async function exportPosterPngFromDom(
  posterRootId: string,
  companyName: string,
  paletteAccent: string,
): Promise<boolean> {
  const root = document.getElementById(posterRootId);
  const qrSvg = root?.querySelector("svg[data-qr-poster-code]");
  if (!(qrSvg instanceof SVGSVGElement)) return false;
  const svg = await posterSvgString({ companyName, qrSvgElement: qrSvg, paletteAccent });
  if (!svg) return false;
  const png = await rasterizePosterSvg(svg);
  if (!png) return false;
  downloadDataUrl(png, "job-mitra-qr-poster.png");
  return true;
}

export async function exportPosterPdfFromDom(
  posterRootId: string,
  companyName: string,
  paletteAccent: string,
): Promise<boolean> {
  const root = document.getElementById(posterRootId);
  const qrSvg = root?.querySelector("svg[data-qr-poster-code]");
  if (!(qrSvg instanceof SVGSVGElement)) return false;
  const svg = await posterSvgString({ companyName, qrSvgElement: qrSvg, paletteAccent });
  if (!svg) return false;
  const png = await rasterizePosterSvg(svg);
  if (!png) return false;
  const { jsPDF } = await import("jspdf");
  const img = new Image();
  img.src = png;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("pdf image load failed"));
  });
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const imgW = pageW - margin * 2;
  const imgH = (img.height / img.width) * imgW;
  doc.addImage(png, "PNG", margin, margin, imgW, imgH);
  doc.save("job-mitra-qr-poster.pdf");
  return true;
}
