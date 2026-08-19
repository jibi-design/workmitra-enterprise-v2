import { describe, expect, it } from "vitest";
import { buildHomeTickerLayout, formatHomeTickerLayoutLine } from "./homeTickerLayout";
import type { InboxTickerItem } from "./latestUnreadInboxPreview";

function item(partial: Partial<InboxTickerItem> & Pick<InboxTickerItem, "id" | "title">): InboxTickerItem {
  return { domain: "shift", createdAt: 1, ...partial };
}

describe("homeTickerLayout", () => {
  it("formats employee shift applied and shortlist copy", () => {
    expect(
      formatHomeTickerLayoutLine(
        buildHomeTickerLayout(
          item({
            id: "1",
            title: "Application submitted",
            body: "Applied · Harbour Gate · Lab Demo",
          }),
        ),
      ),
    ).toBe("[Applied] — Shift: Harbour Gate | Application under review by employer");
    expect(
      formatHomeTickerLayoutLine(
        buildHomeTickerLayout(
          item({
            id: "2",
            title: "You have been shortlisted for a shift",
            body: "Shortlisted · Night Porter",
          }),
        ),
      ),
    ).toBe(
      "[Action Required] — Shift: Night Porter | You are shortlisted! Please confirm your availability",
    );
  });

  it("formats employer shift applicant and rating copy", () => {
    expect(
      formatHomeTickerLayoutLine(
        buildHomeTickerLayout(
          item({
            id: "3",
            title: "New shift application received",
            body: "Asha applied to Dawn Dock.",
          }),
        ),
      ),
    ).toBe("[New Applicant] — Shift: Dawn Dock | Asha applied for this shift");
    expect(
      formatHomeTickerLayoutLine(
        buildHomeTickerLayout(
          item({
            id: "4",
            title: "Please rate your experience",
            body: "Rate your experience as Warehouse Lead.",
          }),
        ),
      ),
    ).toBe("[Rating Needed] — Shift: Warehouse Lead | Please rate your shift experience");
  });

  it("formats career, employment, and system copy", () => {
    expect(
      formatHomeTickerLayoutLine(
        buildHomeTickerLayout(
          item({
            id: "5",
            domain: "career",
            title: "Job offer received",
            body: "Clinic Supervisor",
          }),
        ),
      ),
    ).toBe("[Offer / Update] — Career: Clinic Supervisor | You have an active offer or interview invite");
    expect(
      formatHomeTickerLayoutLine(
        buildHomeTickerLayout(
          item({
            id: "6",
            domain: "employment",
            title: "Please rate your experience",
            body: "Rate your experience as Supervisor at North Yard. [EMPLOYMENT_PLEASE_RATE:p1]",
          }),
        ),
      ),
    ).toBe("[Rating Needed] — Employment: North Yard | Please rate your employment experience");
    expect(
      formatHomeTickerLayoutLine(
        buildHomeTickerLayout(
          item({
            id: "7",
            domain: "system",
            title: "Incoming call",
            body: "Call from Priya",
          }),
        ),
      ),
    ).toBe("[Incoming Call] — Call from Priya | Tap to open workspace");
  });

  it("formats work-group broadcast and reply from the live notification copy", () => {
    expect(
      formatHomeTickerLayoutLine(
        buildHomeTickerLayout(
          item({
            id: "8",
            title: "Announcement",
            body: "Broadcast LIVE-msyuzwnl",
            route: "/employee/shift/workspaces",
          }),
        ),
      ),
    ).toBe("[Broadcast] — Announcement | Broadcast LIVE-msyuzwnl");
    expect(
      formatHomeTickerLayoutLine(
        buildHomeTickerLayout(
          item({
            id: "9",
            title: "Reply (Employee)",
            body: "Reply LIVE-msyuzwnl",
            route: "/employer/shift/workspaces",
          }),
        ),
      ),
    ).toBe("[Reply] — Reply (Employee) | Reply LIVE-msyuzwnl");
  });
});
