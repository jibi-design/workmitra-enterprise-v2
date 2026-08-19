import { describe, expect, it } from "vitest";
import {
  pickLatestLiveShiftCareer,
  pickLatestUnreadShiftCareer,
  resolveInboxTickerHref,
} from "./latestUnreadInboxPreview";

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

  it("includes unread employment please-rate in the ticker pick", () => {
    const latest = pickLatestUnreadShiftCareer([
      {
        id: "1",
        domain: "shift",
        title: "Older shift",
        createdAt: 10,
        isRead: false,
      },
      {
        id: "2",
        domain: "employment",
        title: "Please rate your experience",
        createdAt: 40,
        isRead: false,
      },
    ]);
    expect(latest?.id).toBe("2");
    expect(latest?.domain).toBe("employment");
  });

  it("shows no live ticker row when nothing is unread", () => {
    const latest = pickLatestLiveShiftCareer([
      {
        id: "4",
        domain: "shift",
        title: "Read",
        createdAt: 80,
        isRead: true,
      },
      {
        id: "3",
        domain: "workforce",
        title: "Planner",
        createdAt: 99,
        isRead: false,
      },
    ]);
    expect(latest).toBeNull();
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

  it("routes employment please-rate to review center", () => {
    expect(
      resolveInboxTickerHref(
        {
          id: "1",
          domain: "employment",
          title: "Please rate your experience",
          createdAt: 1,
          route: "/employee/career",
        },
        "/employee/notifications",
      ),
    ).toBe("/employee/review-center");
    expect(
      resolveInboxTickerHref(
        {
          id: "2",
          domain: "employment",
          title: "Please rate your employee",
          createdAt: 1,
          route: "/employer/career",
        },
        "/employer/notifications",
      ),
    ).toBe("/employer/review-center");
  });
});
