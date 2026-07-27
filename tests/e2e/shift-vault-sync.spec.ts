/**
 * Shift Job Engine ↔ Work Vault Engine — Integration E2E
 *
 * Dual ratings → vault averages / star breakdown / tag counters / reviews feed
 * Completed shift → verified history ledger (immutable upsert by workspaceId)
 * Earnings derived ledger — single increment, no duplication
 * Vault UI refresh via navigation (no hard restart)
 *
 * Run: npx playwright test --project=chromium tests/e2e/shift-vault-sync.spec.ts
 */

import { expect, test } from "@playwright/test";
import {
  SHIFT_CIRCUIT_IDS,
  ensureCircuitWorkerIdentity,
  gotoEmployeePostApply,
  gotoEmployerPostDashboard,
  initRoleContext,
  readCircuitApplications,
  readCircuitWorkspaces,
  seedShiftCircuitPost,
  syncAndDeliverPulse,
  syncDataOnly,
  syncShiftCircuitStorage,
} from "./helpers/shift-circuit.helpers";
import {
  ensureVaultSyncEmployerIdentity,
  ensureVaultWorkerProfile,
  probeVaultSyncState,
  seedPriorVaultShiftRatings,
  submitEmployerVaultRating,
  submitWorkerVaultRating,
} from "./helpers/shift-vault-sync.helpers";

test.describe.configure({ mode: "serial" });

test.describe("Shift Job ↔ Work Vault Integration Sync", () => {
  test("dual ratings, verified history, earnings, vault UI refresh", async ({ browser }) => {
    test.setTimeout(240_000);

    const employerContext = await browser.newContext();
    const employeeContext = await browser.newContext();
    const employerPage = await employerContext.newPage();
    const employeePage = await employeeContext.newPage();

    await initRoleContext(employerPage, "employer");
    await initRoleContext(employeePage, "employee");
    await seedShiftCircuitPost(employerPage);
    await seedShiftCircuitPost(employeePage);

    await employerPage.goto("http://localhost:5173/#/employer/shift");
    await employeePage.goto("http://localhost:5173/#/employee/shift");
    await ensureVaultSyncEmployerIdentity(employerPage);
    await syncShiftCircuitStorage(employerPage, employeePage);

    let workspaceId = "";
    let baselineOverall: number | null = null;
    let baselineReviews = 0;
    let earningsBefore = 0;

    await test.step("1. Reach completed workspace (apply → confirm → complete)", async () => {
      await syncShiftCircuitStorage(employerPage, employeePage);
      await gotoEmployeePostApply(employeePage);
      await employeePage.getByRole("button", { name: "Meets" }).first().click();
      await employeePage.getByRole("button", { name: "Submit Application" }).click();
      await expect(employeePage).toHaveURL(/\/#\/employee\/shift\/applications/, {
        timeout: 15_000,
      });

      await syncDataOnly(employeePage, employerPage);
      await ensureCircuitWorkerIdentity(employeePage);
      await syncAndDeliverPulse(employeePage, employerPage, "employer");

      await gotoEmployerPostDashboard(employerPage);
      await employerPage.getByRole("button", { name: /^Applied\b/ }).click();
      await employerPage.getByRole("button", { name: "Shortlist", exact: true }).click();
      await syncAndDeliverPulse(employerPage, employeePage, "employee");

      await gotoEmployerPostDashboard(employerPage);
      await employerPage.getByRole("button", { name: /^Shortlisted\b/ }).click();
      await employerPage.getByRole("button", { name: "Confirm Worker", exact: true }).click();
      await expect(employerPage).toHaveURL(/\/#\/employer\/shift\/workspace\//, {
        timeout: 5_000,
      });

      await ensureCircuitWorkerIdentity(employerPage);
      await syncDataOnly(employerPage, employeePage);
      await syncAndDeliverPulse(employerPage, employeePage, "employee");

      await expect
        .poll(async () => {
          const workspaces = await readCircuitWorkspaces(employerPage);
          const ws = workspaces.find((item) => item.postId === SHIFT_CIRCUIT_IDS.postId);
          if (ws) workspaceId = ws.id;
          return ws?.id ?? "";
        })
        .not.toBe("");

      await employerPage.goto(`/#/employer/shift/workspace/${workspaceId}`);
      await employerPage.getByRole("button", { name: "Mark Completed" }).click();
      await employerPage
        .getByRole("dialog", { name: "Mark shift completed?" })
        .getByRole("button", { name: "Mark Completed" })
        .click();

      await expect
        .poll(async () => {
          const workspaces = await readCircuitWorkspaces(employerPage);
          return workspaces.find((item) => item.id === workspaceId)?.status ?? "";
        })
        .toBe("completed");

      await syncShiftCircuitStorage(employerPage, employeePage);
    });

    await test.step("2. Seed prior ratings + capture baseline reputation / earnings", async () => {
      await ensureVaultSyncEmployerIdentity(employerPage);
      await syncDataOnly(employerPage, employeePage);
      await ensureVaultWorkerProfile(employeePage);
      await seedPriorVaultShiftRatings(employeePage);
      await seedPriorVaultShiftRatings(employerPage);

      const baseline = await probeVaultSyncState(employeePage, workspaceId);
      baselineOverall = baseline.overallRating;
      baselineReviews = baseline.totalReviews;
      earningsBefore = baseline.earningsTotal;

      expect(
        baselineReviews,
        "Prior ratings must load into vault aggregator",
      ).toBeGreaterThanOrEqual(2);
      expect(baseline.historyEntry, "Completed shift must inject vault history row").toBeTruthy();
      expect(baseline.historyEntry?.jobTitle).toContain(SHIFT_CIRCUIT_IDS.jobName);
      expect(baseline.historyEntry?.companyName).toContain(SHIFT_CIRCUIT_IDS.companyName);
      expect(baseline.historyEntry?.totalHours, "Hours derived from start/end").toBeGreaterThan(0);
      expect(baseline.historyRowsForWorkspace, "Single ledger row per workspace").toBe(1);
    });

    await test.step("3. Employer → Worker rating sync (stars, tags, average move)", async () => {
      await ensureVaultSyncEmployerIdentity(employerPage);
      await seedPriorVaultShiftRatings(employerPage);
      await employerPage.goto(`/#/employer/shift/workspace/${workspaceId}`);
      await submitEmployerVaultRating(employerPage);
      await syncDataOnly(employerPage, employeePage);
      await ensureVaultWorkerProfile(employeePage);
      await seedPriorVaultShiftRatings(employeePage);

      const afterEmployer = await probeVaultSyncState(employeePage, workspaceId);

      expect(afterEmployer.historyRowsForWorkspace).toBe(1);
      expect(afterEmployer.historyEntry?.vaultFinalized).toBe(true);
      expect(afterEmployer.historyEntry?.employerRating).toBe(4);
      expect(afterEmployer.totalReviews).toBeGreaterThan(baselineReviews);
      expect(afterEmployer.overallRating).not.toBeNull();
      expect(afterEmployer.overallRating as number).toBeLessThan(baselineOverall ?? 5);
      expect(afterEmployer.ratingBreakdown.star4).toBeGreaterThanOrEqual(1);
      expect(afterEmployer.ratingBreakdown.star5).toBeGreaterThanOrEqual(2);
      expect(afterEmployer.tagCounts["On time"] ?? 0).toBeGreaterThanOrEqual(1);
      expect(afterEmployer.tagCounts.Skilled ?? 0).toBeGreaterThanOrEqual(1);
      expect(afterEmployer.tagCounts["Good communication"] ?? 0).toBeGreaterThanOrEqual(1);
      expect(afterEmployer.referenceHit).toBe(true);
      expect(afterEmployer.totalShiftsCompleted).toBeGreaterThanOrEqual(1);
    });

    await test.step("4. Worker → Employer rating sync + employer vault reflection", async () => {
      await ensureVaultWorkerProfile(employeePage);
      await ensureVaultSyncEmployerIdentity(employeePage);
      await employeePage.goto(`/#/employee/shift/workspace/${workspaceId}`);
      await expect(employeePage.getByRole("button", { name: "Rate Employer" })).toBeVisible({
        timeout: 15_000,
      });
      await submitWorkerVaultRating(employeePage);
      await syncDataOnly(employeePage, employerPage);
      await ensureVaultSyncEmployerIdentity(employerPage);
      await ensureVaultWorkerProfile(employeePage);

      const afterWorker = await probeVaultSyncState(employeePage, workspaceId);
      expect(afterWorker.historyRowsForWorkspace).toBe(1);
      expect(afterWorker.historyEntry?.workerRating).toBe(5);
      expect(afterWorker.historyEntry?.employerRating).toBe(4);
      expect(afterWorker.historyEntry?.vaultFinalized).toBe(true);

      await employerPage.goto("/#/employer/vault");
      await expect(employerPage.getByText("Employer Trust Vault")).toBeVisible({
        timeout: 15_000,
      });
      await expect(employerPage.getByText("Reviews from Workers")).toBeVisible({ timeout: 10_000 });
      await expect(employerPage.getByText(SHIFT_CIRCUIT_IDS.workerMlId).first()).toBeVisible({
        timeout: 10_000,
      });
      await expect(employerPage.getByText("Paid on time").first()).toBeVisible({ timeout: 10_000 });
      await expect(employerPage.getByText("Respectful").first()).toBeVisible({ timeout: 10_000 });
      await expect(employerPage.getByText("5/5").first()).toBeVisible({ timeout: 10_000 });
    });

    await test.step("5. Earnings ledger — confirmed shift counted once (no duplication)", async () => {
      const apps = await readCircuitApplications(employeePage);
      const confirmed = apps.filter(
        (app) => app.postId === SHIFT_CIRCUIT_IDS.postId && app.status === "confirmed",
      );
      expect(confirmed.length, "Confirmed application must exist for earnings").toBe(1);

      const first = await probeVaultSyncState(employeePage, workspaceId);
      const second = await probeVaultSyncState(employeePage, workspaceId);

      expect(first.earningsEntryCount).toBe(second.earningsEntryCount);
      expect(first.earningsTotal).toBe(second.earningsTotal);
      expect(first.earningsShiftCount).toBe(1);
      expect(first.earningsTotal).toBeGreaterThan(0);
      expect(first.earningsTotal).toBeGreaterThanOrEqual(earningsBefore);

      // Re-probe after sync must not invent duplicate entries for same appId
      const entryIds = await employeePage.evaluate(async () => {
        const earningsMod =
          await import("/src/features/employee/shiftJobs/storage/earningsStorage.ts");
        return earningsMod.earningsStorage.getSummary("shift").entries.map((e) => e.appId);
      });
      expect(new Set(entryIds).size).toBe(entryIds.length);
    });

    await test.step("6. Vault UI dynamic refresh — navigate without hard restart", async () => {
      await employeePage.goto("/#/employee/shift");
      await expect(employeePage.getByText("Shift Jobs").first()).toBeVisible({ timeout: 10_000 });

      await employeePage.goto("/#/employee/vault");
      await expect(employeePage.getByText(/Work Vault|Vault/i).first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(employeePage.getByText("Shifts completed")).toBeVisible({ timeout: 10_000 });
      await expect(employeePage.getByText("Shift Work Reviews")).toBeVisible({ timeout: 10_000 });
      await expect(employeePage.getByText(SHIFT_CIRCUIT_IDS.companyName).first()).toBeVisible({
        timeout: 10_000,
      });
      await expect(employeePage.getByText(SHIFT_CIRCUIT_IDS.jobName).first()).toBeVisible({
        timeout: 10_000,
      });
      await expect(
        employeePage.getByText(/4\/5|4.0|4\.7|Rating building|completed work review/i).first(),
      ).toBeVisible({
        timeout: 10_000,
      });
    });

    test.info().annotations.push(
      { type: "integration", description: "Shift → Work Vault dual sync" },
      { type: "workspace-id", description: workspaceId },
      {
        type: "reputation",
        description: `baseline=${baselineOverall} reviews=${baselineReviews}`,
      },
    );

    await employerContext.close();
    await employeeContext.close();
  });
});
