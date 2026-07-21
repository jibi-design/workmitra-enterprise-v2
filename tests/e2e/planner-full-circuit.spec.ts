/**
 * Hybrid A2 Section 8 — Planner full-circuit (dual-write wind-down)
 * Publish (no child posts) → Mega Card → Pick&Choose → batch approve → roster → check-in
 *
 * Run: npx playwright test --project=chromium tests/e2e/planner-full-circuit.spec.ts
 */

import { expect, test } from "@playwright/test";
import {
  GIG_CIRCUIT_IDS,
  ensureGigEmployeeProfile,
  gotoEmployeeShiftSearch,
  initGigRoleContext,
  openMegaCardPickChoose,
  publishGigPlanViaEmployerUi,
  readGigCircuitApplications,
  readGigCircuitPlanProbe,
  selectPickChooseDays,
  syncGigCircuitStorage,
} from "./helpers/gig-planner-circuit.helpers";

test.describe.configure({ mode: "serial" });

test.describe("Planner Full Circuit — Hybrid A2 S8", () => {
  test("Publish without dual-write → apply → approve → roster → check-in", async ({ browser }) => {
    test.setTimeout(300_000);

    const employerContext = await browser.newContext();
    const employeeContext = await browser.newContext();
    const employerPage = await employerContext.newPage();
    const employeePage = await employeeContext.newPage();

    await initGigRoleContext(employerPage, "employer");
    await initGigRoleContext(employeePage, "employee");

    await employerPage.goto("/#/employer/planner/home");
    await employeePage.goto("/#/employee/shift/search");

    let planId = "";

    await test.step("1. Publish plan with zero Shift child posts", async () => {
      await publishGigPlanViaEmployerUi(employerPage);
      const probe = await readGigCircuitPlanProbe(employerPage);
      planId = probe.planId;
      expect(planId).toBeTruthy();
      expect(probe.slotDates.length).toBe(5);
      expect(probe.indexEntryCount).toBe(1);
      expect(probe.childPostIds.length).toBe(0);
      expect(probe.hiddenChildCount).toBe(0);

      await syncGigCircuitStorage(employerPage, employeePage);
      await ensureGigEmployeeProfile(employeePage);
      await employeePage.reload();
    });

    await test.step("2. Mega Card visible; no discoverable children", async () => {
      await gotoEmployeeShiftSearch(employeePage);
      await expect(employeePage.locator(".wm-planner-megaCard")).toHaveCount(1);
      await expect(employeePage.locator(".wm-planner-megaCard").first()).toContainText(
        GIG_CIRCUIT_IDS.planName,
      );
    });

    await test.step("3. Pick & Choose bulk apply (slot-native)", async () => {
      await openMegaCardPickChoose(employeePage);
      await selectPickChooseDays(employeePage, 3);
      const applyButton = employeePage
        .getByRole("dialog")
        .getByRole("button", { name: "Apply", exact: true });
      await expect(applyButton).toBeEnabled();
      await applyButton.click();
      await expect(employeePage.getByRole("dialog")).toBeHidden({ timeout: 10_000 });

      await syncGigCircuitStorage(employeePage, employerPage);
      const apps = await readGigCircuitApplications(employeePage);
      const planApps = apps.filter((a) => a.planId === planId && a.status === "applied");
      expect(planApps.length).toBe(3);
      const batchIds = new Set(planApps.map((a) => a.planApplyBatchId).filter(Boolean));
      expect(batchIds.size).toBe(1);
    });

    await test.step("4. Employer batch approve → roster", async () => {
      await employerPage.goto("/#/employer/planner/applications");
      await expect(employerPage.getByTestId("planner-employer-applications")).toBeVisible({
        timeout: 15_000,
      });

      const approveBtn = employerPage.getByTestId("planner-batch-approve").first();
      await expect(approveBtn).toBeVisible({ timeout: 15_000 });
      await approveBtn.click();

      await syncGigCircuitStorage(employerPage, employeePage);

      await employerPage.goto(`/#/employer/planner/roster/${planId}`);
      await expect(employerPage.getByTestId("planner-employer-roster-detail")).toBeVisible({
        timeout: 15_000,
      });
      await expect(employerPage.getByText(GIG_CIRCUIT_IDS.workerName)).toBeVisible({
        timeout: 10_000,
      });
    });

    await test.step("5. Employee workspace hub check-in stays on /planner", async () => {
      await employeePage.goto("/#/employee/planner/workspace");
      await expect(employeePage.getByTestId("planner-employee-workspace-hub")).toBeVisible();
      await employeePage.getByTestId("planner-checkin-plan-id").fill(planId);
      await employeePage.getByTestId("planner-checkin-submit").click();
      await expect(employeePage.getByTestId("planner-checkin-result")).toHaveAttribute(
        "data-ok",
        "true",
      );
      await expect(employeePage).toHaveURL(/\/employee\/planner\/workspace\/?$/);
    });

    await employerContext.close();
    await employeeContext.close();
  });
});
