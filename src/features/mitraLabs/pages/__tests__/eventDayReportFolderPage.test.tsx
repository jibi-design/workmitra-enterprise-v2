/** Event folder attendance page. */
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { resolvePassFolderId } from "../../helpers/eventDayFolders.helpers";

vi.mock("../../../../shared/store/authStore", () => ({
  useAuthStore: (sel: (s: { user: { id: string } }) => unknown) => sel({ user: { id: "er_1" } }),
}));

vi.mock("../../storage/mitraLabs.storage", () => {
  const folderPass = {
    passId: "p1",
    issuerId: "er_1",
    eventName: "Open Day",
    venue: { name: "Main Hall" },
    validFrom: "2026-08-17T12:00:00.000Z",
    status: "active",
  };
  return {
    useMitraLabsStore: (
      sel: (s: {
        passes: typeof folderPass[];
        checkInEvents: Array<{
          eventId: string;
          passId: string;
          passToken: string;
          staffName: string;
          issuerId: string;
          action: "check_in";
          verifiedAt: string;
          createdAt: number;
        }>;
      }) => unknown,
    ) =>
      sel({
        passes: [folderPass],
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
      }),
  };
});

import { EventDayReportFolderPage } from "../EventDayReportFolderPage";

describe("EventDayReportFolderPage", () => {
  it("shows attendance rows and PDF export for the folder", () => {
    const folderId = resolvePassFolderId({
      passId: "p1",
      issuerId: "er_1",
      eventName: "Open Day",
      venue: { name: "Main Hall" },
      validFrom: "2026-08-17T12:00:00.000Z",
      status: "active",
    });
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={[`/employer/labs/report/${folderId}`]}>
        <Routes>
          <Route path="/employer/labs/report/:folderId" element={<EventDayReportFolderPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(html).toContain("event-day-report-folder-page");
    expect(html).toContain("event-day-folder-export-pdf");
    expect(html).toContain("Ada");
    expect(html).toContain("PIN Confirmed");
    expect(html).not.toContain("Exit time");
  });
});
