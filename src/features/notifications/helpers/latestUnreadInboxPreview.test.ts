import { describe, expect, it } from "vitest";
import { pickLatestUnreadShiftCareer, resolveInboxTickerHref } from "./latestUnreadInboxPreview";

describe("latestUnreadInboxPreview", () => {
  it("picks newest unread shift/career only", () => {
    const latest = pickLatestUnreadShiftCareer([
      {
        id: "1",
        domain: "shift",
        title: "Older",
        createdAt: 10,
        isRead: false,
      },
      {
        id: "2",
        domain: "career",
        title: "Newest",
        createdAt: 30,
        isRead: false,
      },
      {
        id: "3",
        domain: "workforce",
        title: "Planner",
        createdAt: 99,
        isRead: false,
      },
      {
        id: "4",
        domain: "shift",
        title: "Read",
        createdAt: 80,
        isRead: true,
      },
    ]);
    expect(latest?.id).toBe("2");
    expect(latest?.domain).toBe("career");
  });

  it("routes planner paths to inbox", () => {
    expect(
      resolveInboxTickerHref(
        {
          id: "1",
          domain: "shift",
          title: "x",
          createdAt: 1,
          route: "/employee/planner/home",
        },
        "/employee/notifications",
      ),
    ).toBe("/employee/notifications");
  });

  it("keeps shift action routes", () => {
    expect(
      resolveInboxTickerHref(
        {
          id: "1",
          domain: "shift",
          title: "x",
          createdAt: 1,
          route: "/employer/shift",
        },
        "/employer/notifications",
      ),
    ).toBe("/employer/shift");
  });
});
