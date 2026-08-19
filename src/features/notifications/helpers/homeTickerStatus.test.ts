import { describe, expect, it } from "vitest";
import { buildHomeTickerStatus, isActionableTickerItem } from "./homeTickerStatus";
import type { InboxTickerItem } from "./latestUnreadInboxPreview";

function item(partial: Partial<InboxTickerItem> & Pick<InboxTickerItem, "id" | "title">): InboxTickerItem {
  return {
    domain: "shift",
    createdAt: 1,
    ...partial,
  };
}

describe("homeTickerStatus", () => {
  it("treats please-rate and employment signature as actionable", () => {
    expect(
      isActionableTickerItem(
        item({
          id: "1",
          domain: "employment",
          title: "Please rate your experience",
          body: "[EMPLOYMENT_PLEASE_RATE:p1]",
        }),
      ),
    ).toBe(true);
  });

  it("builds All Clear when nothing is pending", () => {
    const view = buildHomeTickerStatus([item({ id: "a", title: "Application submitted" })]);
    expect(view.status).toBe("clear");
    expect(view.badge).toContain("All Clear");
  });

  it("counts please-rate plus extra shortlist confirms", () => {
    const view = buildHomeTickerStatus(
      [
        item({
          id: "1",
          domain: "employment",
          title: "Please rate your employee",
        }),
      ],
      1,
    );
    expect(view.status).toBe("pending");
    expect(view.pendingCount).toBe(2);
    expect(view.badge).toBe("⚠️ Pending Actions (2)");
    expect(view.subtext).toContain("[Rating Needed]");
    expect(view.subtext).toContain("Please rate your employment experience");
  });
});
