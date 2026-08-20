/** Job Mitra | employerDashboard.laneFocus.test.ts */

import { describe, expect, it } from "vitest";
import { laneFocusCopy } from "./employerDashboard.laneFocus";
import type { EmployerOsDomainSnapshot } from "./employerDashboard.osTypes";

const shift: EmployerOsDomainSnapshot = {
  domain: "shift",
  title: "Shift Jobs",
  openLabel: "Open posts",
  openCount: 0,
  pendingLabel: "Waiting review",
  pendingCount: 0,
  confirmedLabel: "Confirmed",
  confirmedCount: 0,
};

describe("laneFocusCopy", () => {
  it("shows capability hints at zero — never Ready or a lone 0 header", () => {
    const copy = laneFocusCopy(shift);
    expect(copy.empty).toBe(true);
    expect(copy.hint).toBe("Tracks: Open Shifts • Applicants • Urgent Start Alerts");
    expect(copy.plusLabel).toBe("Post Shift");
    expect(JSON.stringify(copy).includes("Ready")).toBe(false);
  });

  it("switches to live counts when the lane has work", () => {
    const live = laneFocusCopy({ ...shift, openCount: 3, pendingCount: 2 });
    expect(live.empty).toBe(false);
    expect(live.openLine).toBe("3 Open Posts");
    expect(live.pendingLine).toBe("2 Waiting review");
    expect(
      laneFocusCopy({ ...shift, domain: "career", openCount: 2, pendingCount: 4 }).openLine,
    ).toBe("2 Active Roles");
    expect(
      laneFocusCopy({ ...shift, domain: "planner", openCount: 1, pendingCount: 1 }).openLine,
    ).toBe("1 Active Plans");
    expect(laneFocusCopy({ ...shift, domain: "career" }).hint).toBe(
      "Tracks: Active Roles • Scheduled Interviews • Hire Pipeline",
    );
    expect(laneFocusCopy({ ...shift, domain: "planner" }).hint).toBe(
      "Tracks: Multi-day Plans • Unfilled Gaps • Batch Approvals",
    );
  });
});
