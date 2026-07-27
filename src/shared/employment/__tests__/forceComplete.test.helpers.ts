import { beforeEach, afterEach, vi } from "vitest";
import { employmentActions } from "../employmentActions";
import { employmentStorage } from "../employmentStorage";
import type { EmploymentRecord, NoticePeriodDays } from "../employmentTypes";
import { FORCE_COMPLETE_GRACE_DAYS } from "../employmentTypes";

vi.mock("../employmentNotifications", () => ({
  notifyEmployeeJoined: vi.fn(),
  notifyEmployerResignation: vi.fn(),
  notifyEmployerWithdrawal: vi.fn(),
  notifyEmployeeResignConfirmed: vi.fn(),
  notifyEmployeeTerminated: vi.fn(),
  notifyBothPleaseRate: vi.fn(),
  notifyEmployerForceCompleted: vi.fn(),
}));

export { notifyEmployerForceCompleted, notifyBothPleaseRate } from "../employmentNotifications";

export const GRACE_MS = FORCE_COMPLETE_GRACE_DAYS * 86_400_000;

export async function seedWorking(
  postId = "post_fc",
  noticeDays: NoticePeriodDays = 7,
): Promise<void> {
  employmentStorage.create({
    careerPostId: postId,
    employeeId: "ee_fc",
    employeeName: "Rahul",
    employeeMlId: "WM-FC01-RAH-1234",
    employerId: "er_fc",
    companyName: "TechCorp",
    employerMlId: "WM-FC02-TEC-5678",
    jobTitle: "Engineer",
    department: "IT",
    salaryMin: 25000,
    salaryMax: 35000,
    salaryPeriod: "monthly",
    noticePeriodDays: noticeDays,
  });
  await employmentActions.markAsJoined(postId, Date.now() - 90 * 86_400_000);
}

export function getRecord(postId = "post_fc"): EmploymentRecord {
  return employmentStorage.getByPostId(postId)!;
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
