import { describe, expect, it } from "vitest";
import { listEmployeeApplyTicker, pickEmployeeApplyTicker } from "./employeeApplyTicker";
import type { ShiftApplicationData, ShiftPostData } from "../../employee/shiftJobs/types/shiftApplicationTypes";

function app(partial: Partial<ShiftApplicationData> & Pick<ShiftApplicationData, "id" | "status">): ShiftApplicationData {
  return {
    postId: "p1",
    createdAt: 1,
    mustHaveAnswers: {},
    goodToHaveAnswers: {},
    notes: {},
    ...partial,
  };
}

describe("pickEmployeeApplyTicker", () => {
  it("prefers shortlisted copy over applied", () => {
    const item = pickEmployeeApplyTicker([
      app({ id: "a", status: "applied", createdAt: 20 }),
      app({ id: "s", status: "shortlisted", createdAt: 10 }),
    ]);
    expect(item?.title).toBe("You have been shortlisted for a shift");
    expect(item?.id).toBe("app:s");
  });

  it("uses application submitted when only applied", () => {
    const item = pickEmployeeApplyTicker([app({ id: "a", status: "applied", createdAt: 5 })]);
    expect(item?.title).toBe("Application submitted");
  });
});

describe("listEmployeeApplyTicker", () => {
  it("includes job and company on apply rows", () => {
    const posts: ShiftPostData[] = [
      {
        id: "p1",
        companyName: "Lab Demo Corp",
        jobName: "Harbour Gate Marshall",
        experience: "helper",
        payPerDay: 1,
        locationName: "Dock",
        startAt: 1,
        endAt: 2,
      },
    ];
    const rows = listEmployeeApplyTicker([app({ id: "a", status: "applied", createdAt: 5 })], posts);
    expect(rows[0]?.body).toBe("Applied · Harbour Gate Marshall · Lab Demo Corp");
  });
});
