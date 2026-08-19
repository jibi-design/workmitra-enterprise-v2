/** Event Day report folders — empty + auto folder card. */
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

const validFrom = new Date(Date.now() + 60_000).toISOString();
const validUntil = new Date(Date.now() + 3600_000).toISOString();

vi.mock("../../../../shared/store/authStore", () => ({
  useAuthStore: (sel: (s: { user: { id: string } }) => unknown) => sel({ user: { id: "er_1" } }),
}));

vi.mock("../../storage/mitraLabs.storage", () => ({
  useMitraLabsStore: (
    sel: (s: {
      passes: Array<{
        passId: string;
        issuerId: string;
        eventName?: string;
        venue: { name: string };
        validFrom: string;
        validUntil: string;
        status: string;
      }>;
      checkInEvents: Array<{
        eventId: string;
        passId: string;
        passToken: string;
        staffName: string;
        issuerId: string;
        action: "check_in" | "scan_verify";
        verifiedAt: string;
        createdAt: number;
      }>;
      deleteEventFolder: () => void;
    }) => unknown,
  ) =>
    sel({
      passes: [
        {
          passId: "p1",
          issuerId: "er_1",
          eventName: "Open Day",
          venue: { name: "Main Hall" },
          validFrom,
          validUntil,
          status: "active",
        },
      ],
      checkInEvents: [
        {
          eventId: "e1",
          passId: "p1",
          passToken: "token_abcdefghijklmn",
          staffName: "Ada",
          issuerId: "er_1",
          action: "check_in",
          verifiedAt: new Date().toISOString(),
          createdAt: Date.now(),
        },
      ],
      deleteEventFolder: () => undefined,
    }),
}));

import { EventDayReportPage } from "../EventDayReportPage";
import { EVENT_REPORT_DEVICE_COPY } from "../../helpers/eventDayReport.helpers";

describe("EventDayReportPage", () => {
  it("renders an automatic event folder card from issued passes", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EventDayReportPage />
      </MemoryRouter>,
    );
    expect(html).toContain("event-day-report-page");
    expect(html).toContain(EVENT_REPORT_DEVICE_COPY);
    expect(html).toContain("event-day-folder-grid");
    expect(html).toContain("Open Day");
    expect(html).toContain("Main Hall");
    expect(html).toContain("event-day-folder-card");
    expect(html).not.toContain("Exit time");
  });
});
