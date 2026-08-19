import { describe, expect, it } from "vitest";
import { applyServerApplicationMerge } from "./shiftDbTruth.merge.apply";
import type { EmployeeShiftApplication } from "../../employer/shiftJobs/storage/employerShift.types";
import type { ServerShiftApplicationDto } from "./shiftGateApi.service";

const dto: ServerShiftApplicationDto = {
  id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  post_id: "ffffffff-1111-4222-8333-444444444444",
  worker_wm_id: "ML-JBEM-MAY-TEST",
  status: "confirmed",
  details: {},
  created_at: "2026-08-18T12:00:00.000Z",
  updated_at: "2026-08-18T12:00:00.000Z",
};

describe("applyServerApplicationMerge attendance intent", () => {
  it("keeps I'll-be-there timestamp across server hydrate", () => {
    const existing: EmployeeShiftApplication = {
      id: "local-app-1",
      postId: "local-post-1",
      createdAt: 1,
      status: "confirmed",
      mustHaveAnswers: {},
      goodToHaveAnswers: {},
      notes: {},
      attendanceConfirmedAt: 1_724_000_000_000,
    };

    const { merged } = applyServerApplicationMerge([existing], dto, "local-app-1");
    expect(merged.attendanceConfirmedAt).toBe(1_724_000_000_000);
    expect(merged.status).toBe("confirmed");
  });
});
