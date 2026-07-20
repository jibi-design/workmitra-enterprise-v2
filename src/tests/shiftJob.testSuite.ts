// App name: Job Mitra
// File name: shiftJob.testSuite.ts
// Self-contained browser-console-runnable shift job test suite.
// Usage: import { runShiftTestSuite } from "./tests/shiftJob.testSuite"; runShiftTestSuite();

import {
  confirmCandidate,
  replaceConfirmedCandidate,
} from "../features/employer/shiftJobs/storage/employerShift.candidateActions";
import {
  readEmployeeWorkspaces,
  writeEmployeeApplications,
} from "../features/employer/shiftJobs/storage/employerShift.employeeBridge";
import { createOrUpdateEmployeeWorkspace } from "../features/employer/shiftJobs/storage/employerShift.employeeWorkspaces";
import {
  EMPLOYEE_APPS_KEY,
  EMPLOYEE_WORKSPACES_KEY,
} from "../features/employer/shiftJobs/storage/employerShift.keys";
import type {
  EmployeeShiftApplication,
  ShiftPost,
} from "../features/employer/shiftJobs/storage/employerShift.types";

type StorageSnapshot = {
  apps: string | null;
  workspaces: string | null;
};

type CheckRecord = {
  id: number;
  station: 1 | 2 | 3 | 4;
  passed: boolean;
};

function captureSnapshot(): StorageSnapshot {
  return {
    apps: localStorage.getItem(EMPLOYEE_APPS_KEY),
    workspaces: localStorage.getItem(EMPLOYEE_WORKSPACES_KEY),
  };
}

function restoreSnapshot(snapshot: StorageSnapshot): void {
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

function resetStorage(snapshot: StorageSnapshot): void {
  restoreSnapshot(snapshot);
}

function logCheck(id: number, label: string, passed: boolean, detail?: string): void {
  const suffix = detail ? ` — ${detail}` : "";
  console.log(`[${passed ? "PASS" : "FAIL"}] #${id} ${label}${suffix}`);
}

function createTestPost(overrides: Partial<ShiftPost> = {}): ShiftPost {
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

function createTestApp(
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

function seedApplications(apps: EmployeeShiftApplication[]): void {
  const write = writeEmployeeApplications(apps);
  if (!write.ok) {
    throw new Error("Failed to seed applications for shift test suite");
  }
}

function runCheck1(snapshot: StorageSnapshot): boolean {
  resetStorage(snapshot);

  const post = createTestPost({ id: "test_s1_check1", vacancies: 5 });
  const app = createTestApp(post.id, "test_app_check1", { muid: "WM-S1-001" });
  seedApplications([app]);

  const result = confirmCandidate(post, app.id);
  const passed = result.ok === true;

  logCheck(1, "confirmCandidate with valid app + MUID → ok: true", passed);
  return passed;
}

function runCheck2(snapshot: StorageSnapshot): boolean {
  resetStorage(snapshot);

  const post = createTestPost({ id: "test_s1_check2", vacancies: 1 });
  const appA = createTestApp(post.id, "test_app_check2a", { muid: "WM-S1-002A" });
  const appB = createTestApp(post.id, "test_app_check2b", { muid: "WM-S1-002B" });
  seedApplications([appA, appB]);

  const first = confirmCandidate(post, appA.id);
  const currentPost = first.ok ? first.post : post;
  const second = confirmCandidate(currentPost, appB.id);
  const passed = !second.ok && second.reason === "vacancy_full";

  logCheck(
    2,
    "confirmCandidate when vacancy already full → ok: false, reason: vacancy_full",
    passed,
    !second.ok ? `got reason: ${second.reason}` : "expected failure",
  );
  return passed;
}

function runCheck3(snapshot: StorageSnapshot): boolean {
  resetStorage(snapshot);

  const post = createTestPost({ id: "test_s1_check3", vacancies: 5 });
  const app = createTestApp(post.id, "test_app_check3", { omitMuid: true });
  seedApplications([app]);

  const result = confirmCandidate(post, app.id);
  const passed = !result.ok && result.reason === "missing_muid";

  logCheck(
    3,
    "confirmCandidate with missing MUID → ok: false, reason: missing_muid",
    passed,
    !result.ok ? `got reason: ${result.reason}` : "expected failure",
  );
  return passed;
}

function runCheck4(snapshot: StorageSnapshot): boolean {
  resetStorage(snapshot);

  const post = createTestPost({ id: "test_s1_check4", vacancies: 5 });
  const app = createTestApp(post.id, "test_app_check4", {
    muid: "WM-S1-004",
    status: "confirmed",
  });
  seedApplications([app]);

  const result = confirmCandidate({ ...post, confirmedIds: [app.id] }, app.id);
  const passed = !result.ok && result.reason === "already_confirmed";

  logCheck(
    4,
    "confirmCandidate when app already confirmed → ok: false, reason: already_confirmed",
    passed,
    !result.ok ? `got reason: ${result.reason}` : "expected failure",
  );
  return passed;
}

function runCheck5(snapshot: StorageSnapshot): boolean {
  resetStorage(snapshot);

  const post = createTestPost({ id: "test_s1_check5", vacancies: 5 });
  const app = createTestApp(post.id, "test_app_check5", {
    muid: "WM-S1-005",
    status: "shortlisted",
  });
  seedApplications([app]);

  const result = replaceConfirmedCandidate(post, app.id, "other");
  const passed = !result.ok && result.reason === "not_confirmed";

  logCheck(
    5,
    "replaceConfirmedCandidate when app not confirmed → ok: false, reason: not_confirmed",
    passed,
    !result.ok ? `got reason: ${result.reason}` : "expected failure",
  );
  return passed;
}

function runCheck6(snapshot: StorageSnapshot): boolean {
  resetStorage(snapshot);

  const post = createTestPost({ id: "test_s2_check6", vacancies: 3 });
  const muid = "WM-S2-006";
  const app = createTestApp(post.id, "test_app_check6", { muid });
  seedApplications([app]);

  const result = confirmCandidate(post, app.id);
  if (!result.ok) {
    logCheck(
      6,
      "Employer confirms candidate → workspace has matching workerWmId",
      false,
      "confirm failed",
    );
    return false;
  }

  const workspace = readEmployeeWorkspaces().find(
    (item) => item.postId === post.id && item.appId === app.id,
  );
  const workerWmId = workspace?.workerWmId?.trim().toUpperCase();
  const passed = Boolean(workerWmId) && workerWmId === muid.trim().toUpperCase();

  logCheck(6, "Employer confirms candidate → workspace has matching workerWmId", passed);
  return passed;
}

function runCheck7(snapshot: StorageSnapshot): boolean {
  resetStorage(snapshot);

  const post = createTestPost({ id: "test_s2_check7", vacancies: 3 });
  const app = createTestApp(post.id, "test_app_check7", { muid: "WM-S2-007" });
  seedApplications([app]);

  const before = localStorage.getItem(EMPLOYEE_WORKSPACES_KEY);
  const result = confirmCandidate(post, app.id);
  const after = localStorage.getItem(EMPLOYEE_WORKSPACES_KEY);

  const passed = result.ok && after !== before && after !== null;

  logCheck(7, `Employer confirms → localStorage key "${EMPLOYEE_WORKSPACES_KEY}" updated`, passed);
  return passed;
}

function runCheck8(snapshot: StorageSnapshot): boolean {
  resetStorage(snapshot);

  const post = createTestPost({ id: "test_s2_check8", vacancies: 3 });
  const muid = "WM-S2-008";
  const app = createTestApp(post.id, "test_app_check8", { muid });
  seedApplications([app]);

  const result = confirmCandidate(post, app.id);
  if (!result.ok) {
    logCheck(
      8,
      "MUID in application profileSnapshot.uniqueId === workerWmId in created workspace",
      false,
      "confirm failed",
    );
    return false;
  }

  const workspace = readEmployeeWorkspaces().find((item) => item.id === result.workspaceId);
  const appMuid = app.profileSnapshot?.uniqueId?.trim().toUpperCase() ?? "";
  const workspaceMuid = workspace?.workerWmId?.trim().toUpperCase() ?? "";
  const workspaceHelper = createOrUpdateEmployeeWorkspace(post, app);
  const passed =
    appMuid.length > 0 &&
    appMuid === workspaceMuid &&
    workspaceHelper.ok &&
    workspaceHelper.workspaceId === result.workspaceId;

  logCheck(
    8,
    "MUID in application profileSnapshot.uniqueId === workerWmId in created workspace",
    passed,
  );
  return passed;
}

function runStation3(snapshot: StorageSnapshot): {
  check11: boolean;
  check12: boolean;
  check13: boolean;
  check14: boolean;
} {
  resetStorage(snapshot);

  const loadPostId = "test_s3_load_post";
  const post = createTestPost({ id: loadPostId, vacancies: 3 });

  console.log("[INFO] #9 Create 1 post (vacancies: 3), create 100 applications with unique MUIDs");

  const apps = Array.from({ length: 100 }, (_, index) =>
    createTestApp(loadPostId, `test_load_app_${index}`, {
      muid: `WM-LOAD-${String(index).padStart(3, "0")}`,
    }),
  );
  seedApplications(apps);

  console.log("[INFO] #10 Run confirmCandidate for all 100 in a loop");

  let currentPost = post;
  let okCount = 0;
  let vacancyFullCount = 0;

  for (const app of apps) {
    const result = confirmCandidate(currentPost, app.id);
    if (result.ok) {
      okCount += 1;
      currentPost = result.post;
    } else if (result.reason === "vacancy_full") {
      vacancyFullCount += 1;
    }
  }

  const workspaces = readEmployeeWorkspaces().filter((item) => item.postId === loadPostId);
  const allHaveMuid = workspaces.every((item) => Boolean(item.workerWmId?.trim()));

  const check11 = okCount === 3;
  logCheck(11, "Count ok:true results → expect exactly 3", check11, `got ${okCount}`);

  const check12 = vacancyFullCount === 97;
  logCheck(
    12,
    "Count ok:false reason:vacancy_full → expect exactly 97",
    check12,
    `got ${vacancyFullCount}`,
  );

  const check13 = workspaces.length === 3;
  logCheck(
    13,
    "Count workspaces in localStorage → expect exactly 3",
    check13,
    `got ${workspaces.length}`,
  );

  const check14 = workspaces.length === 3 && allHaveMuid;
  logCheck(14, "Verify all 3 workspaces have a non-empty workerWmId", check14);

  return { check11, check12, check13, check14 };
}

function printStationSummary(results: CheckRecord[]): void {
  const station1 = results.filter((item) => item.station === 1);
  const station2 = results.filter((item) => item.station === 2);
  const station3 = results.filter((item) => item.station === 3);
  const station4 = results.filter((item) => item.station === 4);

  const countPassed = (items: CheckRecord[]) => items.filter((item) => item.passed).length;

  const s1 = countPassed(station1);
  const s2 = countPassed(station2);
  const s3 = countPassed(station3);
  const s4 = countPassed(station4);
  const overall = countPassed(results);

  console.log("");
  console.log("Station Summary");
  console.log(`  Station 1: ${s1}/5 passed`);
  console.log(`  Station 2: ${s2}/3 passed`);
  console.log(`  Station 3: ${s3}/4 passed`);
  console.log(`  Station 4: ${s4}/3 passed`);
  console.log(`  Overall: ${overall}/15 passed`);
}

export function runShiftTestSuite(): void {
  const snapshot = captureSnapshot();
  const results: CheckRecord[] = [];

  console.log("=== STATION 1: Component Tests ===");

  try {
    results.push({ id: 1, station: 1, passed: runCheck1(snapshot) });
    results.push({ id: 2, station: 1, passed: runCheck2(snapshot) });
    results.push({ id: 3, station: 1, passed: runCheck3(snapshot) });
    results.push({ id: 4, station: 1, passed: runCheck4(snapshot) });
    results.push({ id: 5, station: 1, passed: runCheck5(snapshot) });

    console.log("");
    console.log("=== STATION 2: Integration Tests ===");

    results.push({ id: 6, station: 2, passed: runCheck6(snapshot) });
    results.push({ id: 7, station: 2, passed: runCheck7(snapshot) });
    results.push({ id: 8, station: 2, passed: runCheck8(snapshot) });

    console.log("");
    console.log("=== STATION 3: Load Test ===");

    const load = runStation3(snapshot);
    results.push({ id: 11, station: 3, passed: load.check11 });
    results.push({ id: 12, station: 3, passed: load.check12 });
    results.push({ id: 13, station: 3, passed: load.check13 });
    results.push({ id: 14, station: 3, passed: load.check14 });

    console.log("");
    console.log("=== STATION 4: Regression ===");

    const regression1 = runCheck1(snapshot);
    logCheck(1, "[Regression] confirmCandidate with valid app + MUID → ok: true", regression1);
    results.push({ id: 1, station: 4, passed: regression1 });

    const regression6 = runCheck6(snapshot);
    logCheck(
      6,
      "[Regression] Employer confirms candidate → workspace has matching workerWmId",
      regression6,
    );
    results.push({ id: 6, station: 4, passed: regression6 });

    const regression7 = runCheck7(snapshot);
    logCheck(
      7,
      `[Regression] Employer confirms → localStorage key "${EMPLOYEE_WORKSPACES_KEY}" updated`,
      regression7,
    );
    results.push({ id: 7, station: 4, passed: regression7 });

    printStationSummary(results);
  } finally {
    restoreSnapshot(snapshot);
    console.log("");
    console.log("[INFO] Test data cleaned up — localStorage restored to pre-run snapshot.");
  }
}
