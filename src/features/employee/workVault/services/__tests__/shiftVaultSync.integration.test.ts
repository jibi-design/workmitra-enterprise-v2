/**
 * Shift → Vault history service integration (jsdom)
 * Complements Playwright shift-vault-sync.spec.ts
 */

import { beforeEach, describe, expect, it } from "vitest";
import { ratingStorage } from "../../../../../shared/rating/ratingStorage";
import type { ShiftWorkspace } from "../../../../shared/shift/shiftEmployerPublic";
import {
  finalizeVaultShiftHistoryForPost,
  recordShiftCompletedInVault,
  syncVaultShiftRatings,
} from "../shiftVaultHistory.service";
import {
  getVaultShiftHistory,
  getVaultShiftHistoryForWorker,
  VAULT_SHIFT_HISTORY_KEY,
} from "../../storage/vaultShiftHistory.storage";
import { getVaultSectionData } from "../vaultDataAggregator";

const WORKER = "ML-VT-WORKER-001";
const EMPLOYER = "ML-VT-EMPLOYER-001";
const POST = "vault-int-post-1";
const WS = "vault-int-ws-1";

function makeWorkspace(overrides?: Partial<ShiftWorkspace>): ShiftWorkspace {
  const now = Date.now();
  return {
    id: WS,
    postId: POST,
    appId: "vault-int-app-1",
    workerMlId: WORKER,
    workerName: "Vault Worker",
    companyName: "Vault Corp",
    jobName: "Dock Helper",
    category: "other",
    locationName: "City A",
    startAt: now - 8 * 3_600_000,
    endAt: now,
    status: "completed",
    lastActivityAt: now,
    unreadCount: 0,
    updates: [],
    ...overrides,
  };
}

describe("Shift → Work Vault service integration", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "wm_employee_profile_v1",
      JSON.stringify({ uniqueId: WORKER, fullName: "Vault Worker", skills: [] }),
    );
    localStorage.setItem(
      "wm_employer_profile_v1",
      JSON.stringify({ uniqueId: EMPLOYER, companyName: "Vault Corp" }),
    );
    localStorage.setItem(
      "wm_employer_shift_posts_v1",
      JSON.stringify([
        {
          id: POST,
          companyName: "Vault Corp",
          jobName: "Dock Helper",
          payPerDay: 800,
          startAt: Date.now() - 8 * 3_600_000,
          endAt: Date.now(),
        },
      ]),
    );
  });

  it("appends verified history on complete and finalizes on dual ratings without duplication", () => {
    const workspace = makeWorkspace();
    recordShiftCompletedInVault(workspace);

    let history = getVaultShiftHistoryForWorker(WORKER);
    expect(history).toHaveLength(1);
    expect(history[0]?.vaultFinalized).toBeFalsy();
    expect(history[0]?.jobTitle).toBe("Dock Helper");

    ratingStorage.saveEmployerRating({
      domain: "shift",
      employerMlId: EMPLOYER,
      workerMlId: WORKER,
      jobId: POST,
      stars: 4,
      tags: ["On time", "Skilled", "Good communication"],
      hireAgain: true,
      comment: "Solid shift",
    });

    ratingStorage.saveWorkerRating({
      domain: "shift",
      workerMlId: WORKER,
      employerMlId: EMPLOYER,
      jobId: POST,
      stars: 5,
      tags: ["Paid on time", "Respectful"],
      workAgain: true,
    });

    syncVaultShiftRatings({
      ...workspace,
      employerRating: 4,
      rating: 5,
    });

    history = getVaultShiftHistoryForWorker(WORKER);
    expect(history).toHaveLength(1);
    expect(history[0]?.vaultFinalized).toBe(true);
    expect(history[0]?.employerRating).toBe(4);
    expect(history[0]?.workerRating).toBe(5);

    // Idempotent finalize
    const result = finalizeVaultShiftHistoryForPost(POST, [workspace]);
    expect(result.ok).toBe(true);
    expect(getVaultShiftHistory()).toHaveLength(1);
    expect(localStorage.getItem(VAULT_SHIFT_HISTORY_KEY)).toBeTruthy();

    const vault = getVaultSectionData();
    expect(vault.workStats.totalShiftsCompleted).toBeGreaterThanOrEqual(1);
    expect(vault.performance.totalReviews).toBeGreaterThanOrEqual(1);
    expect(vault.performance.ratingBreakdown.star4).toBeGreaterThanOrEqual(1);
    expect(
      vault.references.some((ref) => ref.jobTitle === "Dock Helper" && ref.source === "shift"),
    ).toBe(true);
  });
});
