import { describe, expect, it } from "vitest";
import { buildDailyOsActivity } from "./dailyOs.activity.helpers";
import { computeMatchInsight, gaugeArcPath } from "./dailyOs.insights.helpers";
import { computePlannerWeekHours } from "./dailyOs.plannerHours.helpers";
import type { ShiftApplicationData, ShiftPostData } from "../../shiftJobs/types/shiftApplicationTypes";

const post: ShiftPostData = {
  id: "p1",
  companyName: "Co",
  jobName: "Plan role",
  experience: "helper",
  payPerDay: 90,
  locationName: "",
  startAt: new Date(2026, 7, 15, 9).getTime(),
  endAt: new Date(2026, 7, 15, 17).getTime(),
};

function app(partial: Partial<ShiftApplicationData> & Pick<ShiftApplicationData, "id">): ShiftApplicationData {
  return {
    postId: "p1",
    createdAt: 1,
    status: "applied",
    mustHaveAnswers: {},
    goodToHaveAnswers: {},
    notes: {},
    planId: "plan-1",
    selectedDates: ["2026-08-15", "2026-08-16", "2026-08-17"],
    ...partial,
  };
}

describe("dailyOs planner hours / insights / activity", () => {
  it("counts planned vs confirmed planner hours in the week window", () => {
    const hours = computePlannerWeekHours(
      [
        app({ id: "a1", status: "applied" }),
        app({ id: "a2", status: "confirmed", selectedDates: ["2026-08-15"] }),
      ],
      [post],
      "2026-08-15",
    );
    expect(hours.plannedDays).toBe(4);
    expect(hours.confirmedDays).toBe(1);
    expect(hours.scheduledHours).toBe(8);
    expect(hours.plannedHours).toBe(32);
  });

  it("ignores shift-only applications in planner hours", () => {
    const hours = computePlannerWeekHours(
      [app({ id: "s1", planId: undefined, selectedDates: ["2026-08-15"] })],
      [post],
      "2026-08-15",
    );
    expect(hours.plannedHours).toBe(0);
  });

  it("bands match insight from live scores", () => {
    expect(computeMatchInsight(85, [80, 90]).band).toBe("high");
    expect(computeMatchInsight(50, []).band).toBe("early");
    expect(computeMatchInsight(70, [20]).band).toBe("building");
    expect(gaugeArcPath(50).startsWith("M")).toBe(true);
  });

  it("merges notifications and domain apps into a sorted feed", () => {
    const feed = buildDailyOsActivity({
      notes: [
        {
          id: "n1",
          domain: "career",
          title: "Profile updated",
          createdAt: 30,
          isRead: true,
        },
      ],
      careerApps: [
        {
          id: "c1",
          jobId: "j1",
          stage: "applied",
          appliedAt: 10,
          updatedAt: 40,
          currentRound: 0,
          totalPassed: 0,
          totalScheduled: 0,
          employeeName: "A",
          coverNote: "",
          noticePeriod: "Immediate",
          expectedSalary: 0,
        },
      ],
      shiftApps: [app({ id: "p1", status: "applied", createdAt: 20 })],
      posts: [post],
      limit: 6,
    });
    expect(feed[0]?.title).toBe("Career · In Review");
    expect(feed[0]?.route).toContain("/employee/career/applications");
    expect(feed.some((item) => item.lane === "planner")).toBe(true);
    expect(feed.some((item) => item.title === "Profile updated")).toBe(true);
  });
});
