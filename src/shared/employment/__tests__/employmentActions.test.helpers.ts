import { beforeEach, vi } from "vitest";
import { employmentStorage } from "../employmentStorage";
import type { NoticePeriodDays, EmploymentRecord } from "../employmentTypes";

vi.mock("../employmentNotifications", () => ({
  notifyEmployeeJoined: vi.fn(),
  notifyEmployerResignation: vi.fn(),
  notifyEmployerWithdrawal: vi.fn(),
  notifyEmployeeResignConfirmed: vi.fn(),
  notifyEmployeeTerminated: vi.fn(),
  notifyBothPleaseRate: vi.fn(),
}));

export {
  notifyEmployeeJoined,
  notifyEmployerResignation,
  notifyEmployerWithdrawal,
  notifyEmployeeResignConfirmed,
  notifyEmployeeTerminated,
  notifyBothPleaseRate,
} from "../employmentNotifications";

export function seedRecord(
  overrides?: Partial<Parameters<typeof employmentStorage.create>[0]>,
): EmploymentRecord {
  const record = employmentStorage.create({
    careerPostId: "post_001",
    employeeId: "ee_001",
    employeeName: "Rahul",
    employeeMlId: "WM-AB12-RAH-CD34",
    employerId: "er_001",
    companyName: "TechCorp",
    employerMlId: "WM-XY56-TEC-ZW78",
    jobTitle: "Site Engineer",
    department: "Construction",
    salaryMin: 25000,
    salaryMax: 35000,
    salaryPeriod: "monthly",
    noticePeriodDays: 7 as NoticePeriodDays,
    ...overrides,
  });

  if (!record) {
    throw new Error("Failed to seed employment record");
  }

  return record;
}

export function registerEmploymentActionsTestSetup(): void {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });
}

export type { NoticePeriodDays, EmploymentRecord };
