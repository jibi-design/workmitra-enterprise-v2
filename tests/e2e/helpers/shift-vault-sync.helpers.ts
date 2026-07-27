/** Helpers for Shift Job → Work Vault integration E2E */

import { expect, type Page } from "@playwright/test";
import { SHIFT_CIRCUIT_IDS } from "./shift-circuit.helpers";

export const VAULT_SYNC_EMPLOYER_ML_ID = "ML-E2E-VAULT-EMP1";

export type VaultSyncProbe = {
  readonly historyRowsForWorkspace: number;
  readonly historyEntry: {
    readonly workspaceId: string;
    readonly jobTitle: string;
    readonly companyName: string;
    readonly vaultFinalized: boolean;
    readonly employerRating: number | null;
    readonly workerRating: number | null;
    readonly startAt: number;
    readonly endAt: number;
    readonly completedAt: number;
    readonly totalHours: number;
  } | null;
  readonly overallRating: number | null;
  readonly totalReviews: number;
  readonly ratingBreakdown: {
    readonly star5: number;
    readonly star4: number;
    readonly star3: number;
    readonly star2: number;
    readonly star1: number;
  };
  readonly referenceHit: boolean;
  readonly referenceTags: string[];
  readonly tagCounts: Record<string, number>;
  readonly totalShiftsCompleted: number;
  readonly earningsTotal: number;
  readonly earningsShiftCount: number;
  readonly earningsEntryCount: number;
};

/** Ensure worker profile Mitra ID is readable by vault aggregators (PII-sealed storage). */
export async function ensureVaultWorkerProfile(page: Page): Promise<void> {
  await page.evaluate(
    async ({ workerMlId, workerName }) => {
      const pii = await import("/src/shared/security/piiSecureStorage.ts");
      pii.piiSecureStorage.setJson("wm_employee_profile_v1", {
        uniqueId: workerMlId,
        fullName: workerName,
        city: "Kochi",
        skills: ["loading"],
        experience: "fresher",
        languages: ["Malayalam"],
        preferShiftJobs: true,
        preferCareerJobs: false,
        availability: {
          weekdays: true,
          weekends: false,
          morning: true,
          afternoon: true,
          evening: false,
        },
        createdAt: Date.now(),
      });
    },
    {
      workerMlId: SHIFT_CIRCUIT_IDS.workerMlId,
      workerName: SHIFT_CIRCUIT_IDS.workerName,
    },
  );
}

/** Ensure employer Mitra ID is stable for rating ↔ vault joins (PII-sealed). */
export async function ensureVaultSyncEmployerIdentity(page: Page): Promise<void> {
  await page.evaluate(async (employerMlId) => {
    const pii = await import("/src/shared/security/piiSecureStorage.ts");
    const existing =
      pii.piiSecureStorage.getJson<Record<string, unknown>>("wm_employer_profile_v1") ?? {};
    const next = {
      ...existing,
      uniqueId: employerMlId,
      companyUniqueId: employerMlId,
      employerOrgId: employerMlId,
      companyName: existing.companyName ?? "Circuit Logistics",
    };
    pii.piiSecureStorage.setJson("wm_employer_profile_v1", next);
    pii.piiSecureStorage.setJson("wm:employer-profile", next);
  }, VAULT_SYNC_EMPLOYER_ML_ID);
}

/**
 * Seed two prior employer→worker shift ratings so reputation average can move
 * (Vault shows numeric overall once totalReviews >= 3). Merges; does not wipe newer rows.
 */
export async function seedPriorVaultShiftRatings(page: Page): Promise<void> {
  await page.evaluate(
    ({ employerMlId, workerMlId }) => {
      const now = Date.now();
      const prior = [
        {
          id: "e2e-vault-prior-er-1",
          domain: "shift",
          employerMlId,
          workerMlId,
          jobId: "e2e-prior-post-a",
          stars: 5,
          tags: ["Reliable", "On time"],
          comment: "Prior verified shift A",
          hireAgain: true,
          createdAt: now - 86_400_000 * 14,
          editedAt: null,
          editCount: 0,
        },
        {
          id: "e2e-vault-prior-er-2",
          domain: "shift",
          employerMlId,
          workerMlId,
          jobId: "e2e-prior-post-b",
          stars: 5,
          tags: ["Skilled", "Good communication"],
          comment: "Prior verified shift B",
          hireAgain: true,
          createdAt: now - 86_400_000 * 7,
          editedAt: null,
          editCount: 0,
        },
      ];
      const raw = localStorage.getItem("wm_ratings_employer_to_worker_v1") ?? "[]";
      let existing: Array<{ id?: string }> = [];
      try {
        existing = JSON.parse(raw) as Array<{ id?: string }>;
      } catch {
        existing = [];
      }
      const merged = [...prior];
      for (const row of existing) {
        if (!merged.some((m) => m.id === row.id)) {
          merged.push(row as (typeof prior)[number]);
        }
      }
      localStorage.setItem("wm_ratings_employer_to_worker_v1", JSON.stringify(merged));
      window.dispatchEvent(new Event("wm:ratings-changed"));
    },
    {
      employerMlId: VAULT_SYNC_EMPLOYER_ML_ID,
      workerMlId: SHIFT_CIRCUIT_IDS.workerMlId,
    },
  );
}

export async function probeVaultSyncState(
  page: Page,
  workspaceId: string,
): Promise<VaultSyncProbe> {
  return page.evaluate(
    async ({ workspaceId: wsId, companyName, jobName, workerMlId }) => {
      const historyRaw = localStorage.getItem("wm_vault_shift_history_v1") ?? "[]";
      const history = JSON.parse(historyRaw) as Array<{
        workspaceId?: string;
        jobTitle?: string;
        companyName?: string;
        vaultFinalized?: boolean;
        employerRating?: number | null;
        workerRating?: number | null;
        startAt?: number;
        endAt?: number;
        completedAt?: number;
      }>;

      const rows = history.filter((entry) => entry.workspaceId === wsId);
      const entry = rows[0];
      const totalHours =
        entry?.startAt && entry?.endAt ? Math.max(0, (entry.endAt - entry.startAt) / 3_600_000) : 0;

      const aggregator =
        await import("/src/features/employee/workVault/services/vaultDataAggregator.ts");
      const data = aggregator.getVaultSectionData();

      const ratingMod = await import("/src/shared/rating/ratingStorage.ts");
      const summary = ratingMod.ratingStorage.getWorkerSummary(workerMlId);

      const earningsMod =
        await import("/src/features/employee/shiftJobs/storage/earningsStorage.ts");
      const earnings = earningsMod.earningsStorage.getSummary("shift");

      const refs = data.references ?? [];
      const matchingRefs = refs.filter(
        (ref) =>
          ref.source === "shift" &&
          (ref.companyName?.includes(companyName) || ref.jobTitle?.includes(jobName)),
      );

      return {
        historyRowsForWorkspace: rows.length,
        historyEntry: entry
          ? {
              workspaceId: entry.workspaceId ?? "",
              jobTitle: entry.jobTitle ?? "",
              companyName: entry.companyName ?? "",
              vaultFinalized: entry.vaultFinalized === true,
              employerRating: entry.employerRating ?? null,
              workerRating: entry.workerRating ?? null,
              startAt: entry.startAt ?? 0,
              endAt: entry.endAt ?? 0,
              completedAt: entry.completedAt ?? 0,
              totalHours,
            }
          : null,
        overallRating: data.performance.overallRating,
        totalReviews: data.performance.totalReviews,
        ratingBreakdown: data.performance.ratingBreakdown,
        referenceHit: matchingRefs.length > 0,
        referenceTags: matchingRefs.flatMap((ref) => ref.tags ?? []),
        tagCounts: summary.tagCounts as Record<string, number>,
        totalShiftsCompleted: data.workStats.totalShiftsCompleted,
        earningsTotal: earnings.totalEarned,
        earningsShiftCount: earnings.totalShifts,
        earningsEntryCount: earnings.entries.length,
      };
    },
    {
      workspaceId,
      companyName: SHIFT_CIRCUIT_IDS.companyName,
      jobName: SHIFT_CIRCUIT_IDS.jobName,
      workerMlId: SHIFT_CIRCUIT_IDS.workerMlId,
    },
  );
}

export async function submitEmployerVaultRating(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Rate Worker" }).click();
  await expect(page.getByRole("button", { name: "Submit Rating" })).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "4 stars" }).click();
  await page.getByRole("button", { name: "On time", exact: true }).click();
  await page.getByRole("button", { name: "Skilled", exact: true }).click();
  await page.getByRole("button", { name: "Good communication", exact: true }).click();
  await page.getByRole("button", { name: "Yes" }).click();
  await page.getByRole("button", { name: "Submit Rating" }).click();
  await expect(page.getByRole("button", { name: "Submit Rating" })).toHaveCount(0, {
    timeout: 10_000,
  });
}

export async function submitWorkerVaultRating(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Rate Employer" }).click();
  await expect(page.getByRole("button", { name: "Submit Rating" })).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "5 stars" }).click();
  await page.getByRole("button", { name: "Paid on time", exact: true }).click();
  await page.getByRole("button", { name: "Respectful", exact: true }).click();
  await page.getByRole("button", { name: "Yes" }).click();
  await page.getByRole("button", { name: "Submit Rating" }).click();
  await expect(page.getByRole("button", { name: "Submit Rating" })).toHaveCount(0, {
    timeout: 10_000,
  });
}
