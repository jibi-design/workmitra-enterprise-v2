import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { EmployerDashboardUtilitiesPanel } from "../components/employerDashboard/EmployerDashboardUtilitiesPanel";

vi.mock("../../../../shared/launch/launchVisibility", () => ({
  showMitraLabsAiPhotoDelivery: false,
}));

describe("Event day coach on utilities panel", () => {
  it("renders the one-step coach when the session flag is clear", () => {
    sessionStorage.removeItem("wm_er_event_day_coach_v1");
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmployerDashboardUtilitiesPanel />
      </MemoryRouter>,
    );
    expect(html).toContain("er-event-day-coach");
    expect(html).toContain("Send a door pass or print a QR");
    expect(html).toContain("Got it");
    expect(html).toContain("All Event Tools");
    expect(html).toContain("Open full report");
    expect(html).toContain("dash-labs-hub");
    expect(html).toContain("dash-labs-report");
    expect(html).toContain("No entry logs yet");
  });
});
