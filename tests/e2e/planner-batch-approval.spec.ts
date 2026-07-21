/**
 * Hybrid A2 Section 4 — Native applications + employer batch approve
 *
 * Employee: discover → apply → applications (all /planner/*)
 * Employer: batch approve → roster (not Shift confirm screens)
 *
 * Run: npx playwright test --project=chromium tests/e2e/planner-batch-approval.spec.ts
 */

import { expect, test } from "@playwright/test";
import {
  GIG_CIRCUIT_IDS,
  ensureGigEmployeeProfile,
  initGigRoleContext,
  openMegaCardPickChoose,
  publishGigPlanViaEmployerUi,
  readGigCircuitApplications,
  readGigCircuitPlanProbe,
  selectPickChooseDays,
  syncGigCircuitStorage,
} from "./helpers/gig-planner-circuit.helpers";

test.describe.configure({ mode: "serial" });

test.describe("Planner Batch Approval — Hybrid A2 S4", () => {
  test("Native applications + employer batch approve → roster", async ({ browser }) => {
    test.setTimeout(240_000);

    const employerContext = await browser.newContext();
    const employeeContext = await browser.newContext();
    const employerPage = await employerContext.newPage();
    const employeePage = await employeeContext.newPage();

    await initGigRoleContext(employerPage, "employer");
    await initGigRoleContext(employeePage, "employee");

    await employerPage.goto("/#/employer/planner/home");
    await employeePage.goto("/#/employee/planner/browse");

    let planId = "";

    await test.step("1. Employer publishes plan", async () => {
      await publishGigPlanViaEmployerUi(employerPage);
      const probe = await readGigCircuitPlanProbe(employerPage);
      planId = probe.planId;
      expect(planId).toBeTruthy();
      await syncGigCircuitStorage(employerPage, employeePage);
      await ensureGigEmployeeProfile(employeePage);
      await employeePage.reload();
    });

    await test.step("2. Employee discover → pick & apply under /planner/*", async () => {
      await employeePage.goto("/#/employee/planner/browse");
      await expect(employeePage).toHaveURL(/\/employee\/planner\/browse/);
      await openMegaCardPickChoose(employeePage);
      await selectPickChooseDays(employeePage, 3);

      const applyButton = employeePage
        .getByRole("dialog")
        .getByRole("button", { name: "Apply", exact: true });
      await expect(applyButton).toBeEnabled();
      await applyButton.click();
      await expect(employeePage.getByRole("dialog")).toBeHidden({ timeout: 10_000 });

      await syncGigCircuitStorage(employeePage, employerPage);
      await ensureGigEmployeeProfile(employeePage);

      const apps = await readGigCircuitApplications(employeePage);
      const planApps = apps.filter((app) => app.planId === planId && app.status === "applied");
      expect(planApps.length).toBe(3);
    });

    await test.step("3. Employee native applications page shows plan bundle", async () => {
      await employeePage.goto("/#/employee/planner/applications");
      await expect(employeePage).toHaveURL(/\/employee\/planner\/applications\/?$/);
      await expect(employeePage.getByTestId("planner-employee-applications")).toBeVisible();
      await expect(employeePage.getByTestId("planner-application-bundle")).toBeVisible();
      await expect(employeePage.locator("body")).not.toContainText("Something went wrong");

      await employeePage
        .getByRole("button", { name: /View breakdown/i })
        .first()
        .click();
      await expect(employeePage).toHaveURL(
        new RegExp(`/employee/planner/applications/plan/${planId}`),
      );
    });

    await test.step("4. Employer batch approve → next route is roster", async () => {
      await syncGigCircuitStorage(employeePage, employerPage);
      await employerPage.goto("/#/employer/planner/applications");
      await expect(employerPage.getByTestId("planner-employer-applications")).toBeVisible();
      await expect(employerPage.getByTestId("planner-employer-applications-back")).toBeVisible();
      await expect(employerPage.getByTestId("planner-batch-card")).toBeVisible();

      await employerPage.getByTestId("planner-batch-approve").click();
      await expect(employerPage).toHaveURL(/\/employer\/planner\/roster/, { timeout: 20_000 });
      await expect(employerPage.locator("body")).not.toContainText("Something went wrong");

      const apps = await readGigCircuitApplications(employerPage);
      const planApps = apps.filter((app) => app.planId === planId);
      expect(planApps.every((app) => app.status === "confirmed")).toBe(true);
      expect(planApps.length).toBe(3);
    });

    test
      .info()
      .annotations.push(
        { type: "section", description: "Hybrid A2 S4 batch approval" },
        { type: "plan-id", description: planId || "n/a" },
        { type: "plan-name", description: GIG_CIRCUIT_IDS.planName },
      );

    await employerContext.close();
    await employeeContext.close();
  });
});
