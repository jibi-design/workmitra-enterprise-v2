/**
 * Mitra Labs — pure helpers (tokens, verify URLs, validity, PDF export).
 */

import type { PassStatus, PassStyleConfig } from "../validation/mitraLabs.schemas";

export type PassValidityFields = {
  readonly status: PassStatus;
  readonly validFrom: string;
  readonly validUntil: string;
};

export type PassExportFields = PassValidityFields & {
  readonly passId: string;
  readonly guestName: string;
  readonly purpose: string;
  readonly passToken: string;
  readonly venue: { readonly name: string; readonly address?: string };
};

export const MITRA_LABS_VERIFY_PATH = "/labs/pass/verify";

export const QR_PALETTES: ReadonlyArray<{
  id: string;
  label: string;
  fg: string;
  bg: string;
  accent: string;
}> = [
  { id: "teal_ink", label: "Teal Ink", fg: "#0f766e", bg: "#ffffff", accent: "#0891b2" },
  { id: "slate_clean", label: "Slate Clean", fg: "#0f172a", bg: "#ffffff", accent: "#334155" },
  { id: "royal_frame", label: "Royal Frame", fg: "#1e3a8a", bg: "#f8fafc", accent: "#2563eb" },
  { id: "forest", label: "Forest", fg: "#14532d", bg: "#ffffff", accent: "#15803d" },
];

export function defaultPassStyle(): PassStyleConfig {
  return { eccLevel: "H", logoMaxCoverPct: 12, paletteId: "teal_ink" };
}

/** Cryptographically strong opaque token (URL-safe). */
export function generateOpaquePassToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  if (typeof btoa !== "function") {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function generatePassId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `pass_${crypto.randomUUID()}`;
  }
  return `pass_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Absolute verify URL. QR payload must be this URL only (no PII).
 * Path style (no hash) so phone cameras do not drop the route.
 */
export function buildVerificationUrl(token: string): string {
  const safe = encodeURIComponent(token);
  const path = `${MITRA_LABS_VERIFY_PATH}/${safe}`;
  const origin = resolveVerifyOrigin();
  return origin ? `${origin}${path}` : path;
}

function resolveVerifyOrigin(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_APP_ORIGIN;
  if (typeof fromEnv === "string") {
    const trimmed = fromEnv.trim().replace(/\/+$/, "");
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
  }
  const labs = import.meta.env.VITE_LABS_BASE_URL;
  if (typeof labs === "string") {
    const trimmed = labs.trim().replace(/\/+$/, "");
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
  }
  return "https://mitralabs.app";
}

/** Active + within validity window. */
export function isPassValid(pass: PassValidityFields): boolean {
  if (pass.status !== "active") return false;
  const now = Date.now();
  const fromMs = Date.parse(pass.validFrom);
  const untilMs = Date.parse(pass.validUntil);
  if (!Number.isFinite(fromMs) || !Number.isFinite(untilMs)) return false;
  return now >= fromMs && now <= untilMs;
}

export type PassVerifyBadge = "VALID" | "INVALID" | "REVOKED" | "EXPIRED" | "USED";

export function resolvePassVerifyBadge(
  pass: PassValidityFields | undefined,
  entered = false,
): PassVerifyBadge {
  if (entered) return "USED";
  if (!pass) return "INVALID";
  if (pass.status === "revoked") return "REVOKED";
  if (pass.status === "expired") return "EXPIRED";
  if (pass.status === "draft") return "INVALID";
  const untilMs = Date.parse(pass.validUntil);
  const fromMs = Date.parse(pass.validFrom);
  const now = Date.now();
  if (Number.isFinite(untilMs) && now > untilMs) return "EXPIRED";
  if (Number.isFinite(fromMs) && now < fromMs) return "INVALID";
  if (pass.status === "active" && isPassValid(pass)) return "VALID";
  return "INVALID";
}

export function getPalette(paletteId: string) {
  return QR_PALETTES.find((p) => p.id === paletteId) ?? QR_PALETTES[0]!;
}

async function loadJsPDF() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}

/** Capture an element’s first SVG (or the element itself if SVG) to PNG data URL. */
async function captureElementPng(elementId: string): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const root = document.getElementById(elementId);
  if (!root) return null;
  const svg =
    root instanceof SVGElement ? root : root.querySelector("svg");
  if (!svg) return null;

  const clone = svg.cloneNode(true) as SVGElement;
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  const width = Number(clone.getAttribute("width")) || 240;
  const height = Number(clone.getAttribute("height")) || 240;
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
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
      img.onerror = () => reject(new Error("svg rasterize failed"));
      img.src = url;
    });
    return dataUrl;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Client-side PDF export via jsPDF (+ optional canvas raster of QR SVG).
 */
export async function exportPassToPdf(
  pass: PassExportFields,
  elementId: string,
): Promise<void> {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 16;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(8, 145, 178);
  doc.text("Mitra Labs Digital Pass", margin, y);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Guest: ${pass.guestName}`, margin, y);
  y += 6;
  doc.text(`Venue: ${pass.venue.name}`, margin, y);
  y += 6;
  doc.text(`Purpose: ${pass.purpose}`, margin, y);
  y += 6;
  doc.text(`Valid from: ${new Date(pass.validFrom).toLocaleString()}`, margin, y);
  y += 6;
  doc.text(`Valid until: ${new Date(pass.validUntil).toLocaleString()}`, margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Pass ID: ${pass.passId}`, margin, y);
  y += 5;
  doc.text(`Status: ${pass.status}`, margin, y);
  y += 8;

  const verifyUrl = buildVerificationUrl(pass.passToken);
  doc.setFontSize(8);
  const lines = doc.splitTextToSize(`Verify: ${verifyUrl}`, 180);
  doc.text(lines, margin, y);
  y += lines.length * 4 + 6;

  const png = await captureElementPng(elementId);
  if (png) {
    doc.addImage(png, "PNG", margin, y, 50, 50);
  }

  doc.save(`mitra-pass-${pass.passId}.pdf`);
}
