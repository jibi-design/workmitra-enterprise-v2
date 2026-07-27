import { writeEmployeeApplications } from "../features/employer/shiftJobs/storage/employerShift.employeeBridge";
import {
  EMPLOYEE_APPS_KEY,
  EMPLOYEE_WORKSPACES_KEY,
} from "../features/employer/shiftJobs/storage/employerShift.keys";
import type {
  EmployeeShiftApplication,
  ShiftPost,
} from "../features/employer/shiftJobs/storage/employerShift.types";

export type StorageSnapshot = {
  apps: string | null;
  workspaces: string | null;
};

export type CheckRecord = {
  id: number;
  station: 1 | 2 | 3 | 4;
  passed: boolean;
};

export function captureSnapshot(): StorageSnapshot {
  return {
    apps: localStorage.getItem(EMPLOYEE_APPS_KEY),
    workspaces: localStorage.getItem(EMPLOYEE_WORKSPACES_KEY),
  };
}

export function restoreSnapshot(snapshot: StorageSnapshot): void {
  if (snapshot.apps === null) {
    localStorage.removeItem(EMPLOYEE_APPS_KEY);
  } else {
    localStorage.setItem(EMPLOYEE_APPS_KEY, snapshot.apps);
  }

  if (snapshot.workspaces === null) {
    localStorage.removeItem(EMPLOYEE_WORKSPACES_KEY);
  } else {
    localStorage.setItem(EMPLOYEE_WORKSPACES_KEY, snapshot.workspaces);
  }
}

export function resetStorage(snapshot: StorageSnapshot): void {
  restoreSnapshot(snapshot);
}

export function logCheck(id: number, label: string, passed: boolean, detail?: string): void {
  const suffix = detail ? ` — ${detail}` : "";
  console.log(`[${passed ? "PASS" : "FAIL"}] #${id} ${label}${suffix}`);
}

export function createTestPost(overrides: Partial<ShiftPost> = {}): ShiftPost {
  const now = Date.now();

  return {
    id: overrides.id ?? `test_post_${now}`,
    companyName: "TestCo",
    jobName: "Test Shift",
    category: "general",
    experience: "fresher_ok",
    payPerDay: 500,
    locationName: "Test Location",
    distanceKm: 1,
    startAt: now + 86_400_000,
    endAt: now + 90_000_000,
    mustHave: [],
    goodToHave: [],
    vacancies: 3,
    waitingBuffer: 0,
    analysisStatus: "not_started",
    shortlistIds: [],
    waitingIds: [],
    confirmedIds: [],
    rejectedIds: [],
    status: "active",
    source: "single",
    ...overrides,
  };
}

export function createTestApp(
  postId: string,
  appId: string,
  options?: {
    muid?: string;
    status?: EmployeeShiftApplication["status"];
    omitMuid?: boolean;
  },
): EmployeeShiftApplication {
  const status = options?.status ?? "shortlisted";

  return {
    id: appId,
    postId,
    createdAt: Date.now(),
    status,
    profileSnapshot: options?.omitMuid
      ? { fullName: `Worker ${appId}` }
      : {
          uniqueId: options?.muid ?? `WM-TEST-${appId}`,
          fullName: `Worker ${appId}`,
        },
    mustHaveAnswers: {},
    goodToHaveAnswers: {},
    notes: {},
  };
}

export function seedApplications(apps: EmployeeShiftApplication[]): void {
  const write = writeEmployeeApplications(apps);
  if (!write.ok) {
    throw new Error("Failed to seed applications for shift test suite");
  }
}

export { EMPLOYEE_WORKSPACES_KEY };
