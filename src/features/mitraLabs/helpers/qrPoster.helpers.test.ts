import { describe, expect, it } from "vitest";
import {
  buildInitialsBadgeDataUrl,
  composePosterSvg,
  deriveCompanyInitials,
  resolveQrCenterLogo,
} from "./qrPoster.helpers";

describe("qrPoster.helpers", () => {
  it("derives company initials", () => {
    expect(deriveCompanyInitials("Acme Corp")).toBe("AC");
    expect(deriveCompanyInitials("Job Mitra")).toBe("JM");
    expect(deriveCompanyInitials("  ")).toBe("CO");
    expect(deriveCompanyInitials("Zenith")).toBe("ZE");
  });

  it("builds initials badge data URL", () => {
    const url = buildInitialsBadgeDataUrl("JM");
    expect(url.startsWith("data:image/svg+xml")).toBe(true);
    expect(decodeURIComponent(url)).toContain("JM");
  });

  it("falls back to initials when no company logo", () => {
    const resolved = resolveQrCenterLogo("Demo Partner Co", undefined, true);
    expect(resolved?.isInitialsFallback).toBe(true);
    expect(resolved?.initials).toBe("DP");
  });

  it("uses uploaded logo when present", () => {
    const logo = "data:image/png;base64,abc";
    const resolved = resolveQrCenterLogo("Demo", logo, true);
    expect(resolved?.isInitialsFallback).toBe(false);
    expect(resolved?.src).toBe(logo);
  });

  it("embeds header and footer in exported poster SVG", () => {
    const qr = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    qr.setAttribute("width", "220");
    qr.setAttribute("height", "220");
    qr.innerHTML = '<rect width="220" height="220" fill="#fff"/>';
    const svg = composePosterSvg({
      companyName: "Event Co",
      qrSvgElement: qr,
      paletteAccent: "#0891b2",
    });
    expect(svg).toContain("Event Co");
    expect(svg).toContain("Powered by");
    expect(svg).toContain("Job ");
    expect(svg).toContain("Mitra");
    expect(svg).not.toContain("Access Hub");
    expect(svg).not.toContain(">Hub<");
  });
});
