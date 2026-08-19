/** P1 — Event-day empty states for invites + branded QR. */
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../shared/store/authStore", () => ({
  useAuthStore: (sel: (s: { user: null }) => unknown) => sel({ user: null }),
}));

vi.mock("../storage/mitraLabs.storage", () => ({
  useMitraLabsStore: (
    sel: (s: {
      passes: [];
      checkInEvents: [];
      createPass: () => void;
      cacheIssuedPass: () => void;
      revokePass: () => void;
      deleteVenueFolder: () => void;
      deletePersonFolder: () => void;
    }) => unknown,
  ) =>
    sel({
      passes: [],
      checkInEvents: [],
      createPass: () => undefined,
      cacheIssuedPass: () => undefined,
      revokePass: () => undefined,
      deleteVenueFolder: () => undefined,
      deletePersonFolder: () => undefined,
    }),
}));

vi.mock("../storage/qrPoster.storage", () => ({
  useQrPosterStore: (
    sel: (s: {
      posters: [];
      savePoster: () => void;
      deletePoster: () => void;
      deletePosterFolder: () => void;
      deletePosterPersonFolder: () => void;
    }) => unknown,
  ) =>
    sel({
      posters: [],
      savePoster: () => undefined,
      deletePoster: () => undefined,
      deletePosterFolder: () => undefined,
      deletePosterPersonFolder: () => undefined,
    }),
}));

import { ArtisticQrStudio } from "../ArtisticQrStudio";
import { DigitalInviteBuilder } from "../DigitalInviteBuilder";

describe("event-day empty states", () => {
  it("shows invite empty copy before compose", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <DigitalInviteBuilder />
      </MemoryRouter>,
    );
    expect(html).toContain("digital-invite-page-empty");
    expect(html).toContain("No passes yet");
    expect(html).toContain("Create first pass");
    expect(html).toContain("this is not a ticket shop or payment");
    expect(html).not.toContain("guest-name-input");
  });

  it("shows branded QR workflow and designer by default", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ArtisticQrStudio />
      </MemoryRouter>,
    );
    expect(html).not.toContain("event-day-workflow-cards");
    expect(html).toContain("Create branded QR &amp; export");
    expect(html).toContain("qr-poster-download-svg");
    expect(html).toContain("qr-poster-download-png");
    expect(html).toContain("qr-poster-download-pdf");
    expect(html).not.toContain("artistic-qr-page-empty");
  });
});
