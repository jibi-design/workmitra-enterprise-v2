import { describe, expect, it } from "vitest";
import { resolveEmployeeShiftApplicationsTab } from "./shiftApplications.smartResume";
import type { ShiftApplicationData } from "../../shiftJobs/types/shiftApplicationTypes";

function app(
  status: ShiftApplicationData["status"],
  extra: Partial<ShiftApplicationData> = {},
): ShiftApplicationData {
  return {
    id: status,
    postId: "p1",
    createdAt: 1,
    status,
    mustHaveAnswers: {},
    goodToHaveAnswers: {},
    notes: {},
    ...extra,
  };
}

describe("resolveEmployeeShiftApplicationsTab", () => {
  it("lands confirmed when attendance intent is missing", () => {
    expect(resolveEmployeeShiftApplicationsTab([app("confirmed")])).toBe("confirmed");
  });

  it("lands active for shortlist", () => {
    expect(resolveEmployeeShiftApplicationsTab([app("shortlisted")])).toBe("active");
  });
});
