/** STEP 12 — Mitra Labs AI Photo Delivery Day-1 gate. */
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../../shared/launch/launchVisibility", () => ({
  showMitraLabsAiPhotoDelivery: false,
}));

vi.mock("../../../../shared/store/authStore", () => ({
  useAuthStore: (sel: (s: { user: null }) => unknown) => sel({ user: null }),
}));

vi.mock("../../storage/mitraLabs.storage", () => ({
  useMitraLabsStore: (sel: (s: { passes: [] }) => unknown) => sel({ passes: [] }),
}));

import { MitraLabsHub } from "../MitraLabsHub";
import { AiPhotoDeliveryBetaPage } from "../AiPhotoDeliveryBetaPage";

describe("STEP 12 Mitra Labs AI Photo gate", () => {
  it("Hub does not render AI Photo CTA when flag is off", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <MitraLabsHub />
      </MemoryRouter>,
    );
    expect(html).toContain("mitra-labs-hub");
    expect(html).toContain("All Event Tools");
    expect(html).toContain("mitra-labs-pass-status");
    expect(html).toContain("Active now");
    expect(html).toContain("Revoke");
    expect(html).toContain("mitra-labs-open-report");
    expect(html).toContain("Open full report");
    expect(html).not.toContain("mitra-labs-open-invites");
    expect(html).not.toContain("mitra-labs-open-qr");
    expect(html).not.toContain("mitra-labs-open-ai-photo");
    expect(html).not.toContain("Send guest");
    expect(html).not.toContain("Create branded QR");
  });

  it("Beta scaffold page is empty-state only (no capture controls)", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AiPhotoDeliveryBetaPage />
      </MemoryRouter>,
    );
    expect(html).toContain("mitra-labs-ai-photo-beta");
    expect(html).toContain("Coming after Day-1");
    expect(html).not.toContain("<video");
    expect(html).not.toContain("getUserMedia");
    expect(html).not.toContain('type="file"');
  });
});
