import { beforeEach, describe, expect, it } from "vitest";
import { activateShiftHireMyStaff } from "../../shiftJobs/services/shiftHireMyStaffActivation.service";
import { myStaffStorage } from "../../myStaff/storage/myStaff.storage";
import { workforceStaffService } from "../../workforceOps/services/workforceStaffService";
import type { EmployeeShiftApplication, ShiftPost } from "../../shiftJobs/storage/employerShift.types";

function makePost(id = "jm_shift_test_1"): ShiftPost {
  return {
    id,
    companyName: "Test Co",
    jobName: "Warehouse Helper",
    category: "Logistics",
    experience: "helper",
    payPerDay: 900,
    payBasis: "per_day",
    locationName: "City A",
    locationAddress: "Gate 1",
    distanceKm: 0,
    startAt: "2026-08-12",
    endAt: "2026-08-12",
    description: "Test",
    shiftTiming: "9-5",
    mapsLink: "",
    isHiddenFromSearch: false,
    mustHave: [],
    goodToHave: [],
    whatWeProvide: [],
    jobType: "single_day",
    vacancies: 1,
    waitingBuffer: 0,
    shortlistIds: [],
    waitingIds: [],
    confirmedIds: [],
    rejectedIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: { backupSlots: 0, autoPromoteBackup: true, notifyBackup: true },
  } as ShiftPost;
}

function makeApp(uniqueId = "JM-ML-ABCD-TES-EFGH"): EmployeeShiftApplication {
  return {
    id: "jm_app_1",
    postId: "jm_shift_test_1",
    status: "confirmed",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    profileSnapshot: {
      uniqueId,
      fullName: "Test Worker",
    },
  } as EmployeeShiftApplication;
}

describe("activateShiftHireMyStaff", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates My Staff + Workforce Ops rows on first confirm", () => {
    const result = activateShiftHireMyStaff(makePost(), makeApp());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.created).toBe(true);
    const staff = myStaffStorage.findByShiftPostId("jm_shift_test_1");
    expect(staff?.employeeName).toBe("Test Worker");
    expect(staff?.status).toBe("joining_pending");
    expect(staff?.addMethod).toBe("via_app");

    const wf = workforceStaffService.getByEmployeeId("JM-ML-ABCD-TES-EFGH");
    expect(wf?.employeeUniqueId).toBe("JM-ML-ABCD-TES-EFGH");
  });

  it("is idempotent for the same shift post", () => {
    const first = activateShiftHireMyStaff(makePost(), makeApp());
    const second = activateShiftHireMyStaff(makePost(), makeApp());
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.created).toBe(false);
    expect(second.staffId).toBe(first.staffId);
    expect(myStaffStorage.getAll()).toHaveLength(1);
  });
});
