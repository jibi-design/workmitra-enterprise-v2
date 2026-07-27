// shiftJob.testSuite.ts — facade

import {
  captureSnapshot,
  logCheck,
  restoreSnapshot,
  type CheckRecord,
} from "./shiftJob.testSuite.helpers";
import {
  printStationSummary,
  runCheck1,
  runCheck2,
  runCheck3,
  runCheck4,
  runCheck5,
  runCheck6,
  runCheck7,
  runCheck8,
  runStation3,
} from "./shiftJob.testSuite.checks";
import { EMPLOYEE_WORKSPACES_KEY } from "./shiftJob.testSuite.helpers";

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
      "[Regression] Employer confirms candidate → workspace has matching workerMlId",
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
