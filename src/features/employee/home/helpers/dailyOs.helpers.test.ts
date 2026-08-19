import { describe, expect, it } from "vitest";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";
import type { AppLite } from "../../careerJobs/types/careerApplicationTypes";
import {
  buildEarningsSparkline,
  buildWeekHeatCells,
  computeCareerFunnel,
  countCareerCriticalActions,
  countCriticalActions,
  formatShiftWhen,
  funnelMax,
  pickNeedsYouItems,
  pickPipelineSummary,
  pulseHeroLabel,
  resolveCurrentFunnelStage,
  sparklinePath,
} from "./dailyOs.helpers";

function app(partial: Partial<AppLite> & Pick<AppLite, "id" | "jobId" | "stage">): AppLite {
  return {
    appliedAt: 1,
    updatedAt: 2,
    currentRound: 0,
    totalPassed: 0,
    totalScheduled: 0,
    employeeName: "A",
    coverNote: "",
    noticePeriod: "Immediate",
    expectedSalary: 0,
    ...partial,
  };
}

function action(partial: Partial<PendingActionItem> & Pick<PendingActionItem, "id" | "label">): PendingActionItem {
  return {
    domain: "career",
    detail: "",
    count: 1,
    ctaLabel: "Open",
    onAction: () => undefined,
    ...partial,
  };
}

describe("dailyOs.helpers", () => {
  it("counts exclusive funnel stages and ignores closed apps", () => {
    const funnel = computeCareerFunnel([
      app({ id: "1", jobId: "a", stage: "applied" }),
      app({ id: "2", jobId: "b", stage: "shortlisted" }),
      app({ id: "3", jobId: "c", stage: "interview" }),
      app({ id: "4", jobId: "d", stage: "offered" }),
      app({ id: "5", jobId: "e", stage: "rejected" }),
    ]);
    expect(funnel).toEqual({ applied: 1, shortlisted: 1, interview: 1, offer: 1 });
    expect(funnelMax(funnel)).toBe(1);
    expect(resolveCurrentFunnelStage(funnel)).toBe("offer");
    expect(resolveCurrentFunnelStage({ applied: 2, shortlisted: 0, interview: 0, offer: 0 })).toBe(
      "applied",
    );
    expect(resolveCurrentFunnelStage({ applied: 0, shortlisted: 0, interview: 0, offer: 0 })).toBe(
      null,
    );
  });

  it("ranks Needs-you as offer, interview, then shift confirm, max 3", () => {
    const picked = pickNeedsYouItems([
      action({ id: "shift-attendance-1", domain: "shift", label: "Confirm shift attendance" }),
      action({ id: "noise", domain: "planner", label: "Other" }),
      action({ id: "career-interview-rsvp-1", label: "Interview RSVP required" }),
      action({ id: "career-offer-response-1", label: "Job offer received" }),
    ]);
    expect(picked.map((item) => item.id)).toEqual([
      "career-offer-response-1",
      "career-interview-rsvp-1",
      "shift-attendance-1",
    ]);
  });

  it("counts career-critical actions only", () => {
    expect(
      countCareerCriticalActions([
        action({ id: "c1", domain: "career", label: "Interview", count: 1 }),
        action({ id: "s1", domain: "shift", label: "Confirm", count: 2 }),
      ]),
    ).toBe(1);
  });

  it("counts all critical actions across domains", () => {
    expect(
      countCriticalActions([
        action({ id: "c1", domain: "career", label: "Interview", count: 1 }),
        action({ id: "s1", domain: "shift", label: "Confirm", count: 2 }),
      ]),
    ).toBe(3);
  });

  it("builds a 7-day calendar from confirmed shifts only", () => {
    const cells = buildWeekHeatCells({
      todayKey: "2026-08-15",
      confirmedDateKeys: ["2026-08-16"],
    });
    expect(cells).toHaveLength(7);
    expect(cells[0]?.kind).toBe("empty");
    expect(cells[1]?.kind).toBe("confirmed");
    expect(cells[2]?.kind).toBe("empty");
  });

  it("allocates pay-per-day onto overlapping sparkline days", () => {
    const start = new Date(2026, 7, 14).getTime();
    const end = new Date(2026, 7, 16).getTime();
    const points = buildEarningsSparkline(
      [
        {
          appId: "1",
          postId: "p",
          companyName: "Co",
          jobName: "Role",
          locationName: "",
          startAt: start,
          endAt: end,
          payPerDay: 100,
          totalDays: 3,
          totalEarned: 300,
          category: "General",
        },
      ],
      "2026-08-16",
      3,
    );
    expect(points.map((p) => p.amount)).toEqual([100, 100, 100]);
    expect(points.map((p) => p.hours)).toEqual([8, 8, 8]);
    expect(sparklinePath([0, 50, 100], 100, 40).startsWith("M")).toBe(true);
  });

  it("formats relative shift when labels", () => {
    expect(formatShiftWhen("2026-08-15", "2026-08-15")).toBe("Today");
    expect(formatShiftWhen("2026-08-16", "2026-08-15")).toBe("Tomorrow");
    expect(pulseHeroLabel(null)).toBe("Not set");
    expect(pickPipelineSummary([{ status: "In Review" }, { status: "Offer" }])[0]?.status).toBe(
      "Offer",
    );
  });
});
