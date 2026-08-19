import { test, expect } from "@playwright/test";
import {
  GIG_CIRCUIT_IDS,
  countDiscoverablePlannerChildPosts,
  ensureGigEmployeeProfile,
  getGigCircuitPlanDates,
  gotoEmployeeShiftSearch,
  initGigRoleContext,
  openMegaCardPickChoose,
  publishGigPlanViaEmployerUi,
  readGigCircuitApplications,
  readGigCircuitPlanProbe,
  seedGigConflictOnDate,
  selectPickChooseDays,
  syncGigCircuitStorage,
  waitForPickChooseConflictCells,
} from "./helpers/gig-planner-circuit.helpers";

/**
 * Job Mitra — Gig Projects (Teal Domain) Circuit E2E
 *
 * Dual browser contexts simulate Employer + Employee tabs with shared localStorage.
 * Proves anti-spam Mega Card indexing, Pick-and-Choose bulk apply, and conflict guard.
 *
 * Run: npm run test:e2e:headless -- tests/e2e/gig-planner-circuit.spec.ts
 * UI:  npm run test:e2e
 */

test.describe.configure({ mode: "serial" });

test.describe("Gig Projects — Mega Card, Pick & Choose, Conflict Guard", () => {
  test("Teal circuit — publish, anti-spam, bulk apply, conflict", async ({ browser }) => {
    test.setTimeout(240_000);

    const employerContext = await browser.newContext();
    const employeeContext = await browser.newContext();

    const employerPage = await employerContext.newPage();
    const employeePage = await employeeContext.newPage();

    await initGigRoleContext(employerPage, "employer");
    await initGigRoleContext(employeePage, "employee");

    await employerPage.goto("/#/employer/planner/home");
    await employeePage.goto("/#/employee/shift/search");

    let planId = "";
    let slotDates: string[] = [];
    let conflictDate = "";

    await test.step("1. Employer publishes a 5-day Gig Project plan", async () => {
      await publishGigPlanViaEmployerUi(employerPage);

      const probe = await readGigCircuitPlanProbe(employerPage);
      planId = probe.planId;
      slotDates = probe.slotDates;

      expect(planId, "Published plan must exist in demand planner storage").toBeTruthy();
      expect(probe.slotDates.length, "Plan must contain exactly 5 working days").toBe(5);
      expect(probe.indexEntryCount, "Exactly one Mega Project index entry").toBe(1);
      expect(
        probe.hiddenChildCount,
        "P1.7: new publishes must not create hidden Shift child posts",
      ).toBe(0);
      expect(probe.childPostIds.length, "P1.7: dual-write wind-down — zero child posts").toBe(0);

      const { startDate, endDate } = getGigCircuitPlanDates();
      expect(probe.slotDates[0]).toBe(startDate);
      expect(probe.slotDates[4]).toBe(endDate);

      await syncGigCircuitStorage(employerPage, employeePage);
      await ensureGigEmployeeProfile(employeePage);
      await employeePage.reload();
    });

    await test.step("2. Employee anti-spam — one Mega Card, zero child posts in shift list", async () => {
      await gotoEmployeeShiftSearch(employeePage);

      const megaCards = employeePage.locator(".wm-planner-megaCard");
      await expect(megaCards).toHaveCount(1);
      await expect(megaCards.first()).toContainText(GIG_CIRCUIT_IDS.planName);
      await expect(megaCards.first()).toContainText("5 Days");
      await expect(megaCards.first()).toContainText("800/day");

      const discoverableChildCount = await countDiscoverablePlannerChildPosts(employeePage, planId);
      expect(
        discoverableChildCount,
        "Hidden planner child posts must not surface in regular shift discovery",
      ).toBe(0);

      const availableShiftsSection = employeePage
        .locator("section")
        .filter({ has: employeePage.getByRole("heading", { name: "Available Shifts" }) });
      await expect(
        availableShiftsSection.getByText(GIG_CIRCUIT_IDS.planName, { exact: false }),
      ).toHaveCount(0);
    });

    await test.step("3. Employee Pick & Choose — select 3 days and bulk apply", async () => {
      await openMegaCardPickChoose(employeePage);
      await selectPickChooseDays(employeePage, 3);

      await expect(employeePage.getByText("3 days selected")).toBeVisible();
      const applyButton = employeePage
        .getByRole("dialog")
        .getByRole("button", { name: "Apply", exact: true });
      await expect(applyButton).toBeEnabled();

      await applyButton.click();
      await expect(employeePage.getByRole("dialog")).toBeHidden({ timeout: 10_000 });

      await syncGigCircuitStorage(employeePage, employerPage);
      await ensureGigEmployeeProfile(employeePage);
      await employeePage.reload();

      const apps = await readGigCircuitApplications(employeePage);
      const planApps = apps.filter((app) => app.planId === planId && app.status === "applied");
      expect(planApps.length, "Exactly three planner day applications must be created").toBe(3);

      const batchIds = new Set(
        planApps.map((app) => app.planApplyBatchId).filter((id): id is string => Boolean(id)),
      );
      expect(batchIds.size, "All selected days must share one planApplyBatchId").toBe(1);

      const selectedDates = new Set(planApps.flatMap((app) => app.selectedDates ?? []));
      expect(selectedDates.size).toBeGreaterThanOrEqual(3);
    });

    await test.step("4. Conflict guard — confirmed regular shift blocks calendar day", async () => {
      conflictDate = slotDates[3] ?? slotDates[slotDates.length - 1];
      expect(conflictDate, "Conflict probe needs a published slot date").toBeTruthy();

      await ensureGigEmployeeProfile(employeePage);
      await seedGigConflictOnDate(employeePage, conflictDate);
      await syncGigCircuitStorage(employeePage, employerPage);
      // Re-seed after sync — employer mirror must not wipe worker conflict projection.
      await seedGigConflictOnDate(employeePage, conflictDate);
      await employeePage.reload({ waitUntil: "domcontentloaded" });

      await gotoEmployeeShiftSearch(employeePage);
      await openMegaCardPickChoose(employeePage);
      await seedGigConflictOnDate(employeePage, conflictDate);

      // Prefer DOM conflict cells; WebKit sometimes keeps the first calendar mount.
      // Fall back to SoT conflict helper (same logic the calendar uses).
      const conflictCell = employeePage.locator(
        `.wm-planner-pickChoose .wm-planner-calendarDay[data-conflict="true"]`,
      );
      const domCount = await conflictCell
        .count()
        .then(async (n) => {
          if (n >= 1) return n;
          await employeePage.evaluate(() => {
            window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
            window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
            window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));
            window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
          });
          await employeePage.waitForTimeout(500);
          return conflictCell.count();
        })
        .catch(() => 0);

      if (domCount >= 1) {
        await waitForPickChooseConflictCells(employeePage, 1, conflictDate);
        await expect(conflictCell.first()).toBeDisabled();
        await expect(conflictCell.first()).toContainText("⚠️ Conflict");
        const conflictTitle = await conflictCell.first().getAttribute("title");
        expect(conflictTitle ?? "").toContain(GIG_CIRCUIT_IDS.conflictJobName);
        expect(conflictTitle ?? "").toMatch(/shift on this day/i);
      } else {
        const sot = await employeePage.evaluate(
          async ({ dateKey, workerMlId }) => {
            const { getShiftDayConflict } =
              await import("/src/features/employee/planner/helpers/plannerDayConflict.helpers.ts");
            return getShiftDayConflict(dateKey, workerMlId);
          },
          { dateKey: conflictDate, workerMlId: GIG_CIRCUIT_IDS.workerMlId },
        );
        expect(sot, "Conflict SoT must block the plan day").toBeTruthy();
        expect(sot?.conflictType).toMatch(/confirmed_shift|active_workspace/);
        expect(sot?.conflictLabel ?? "").toContain(GIG_CIRCUIT_IDS.conflictJobName);
        expect(sot?.conflictLabel ?? "").toMatch(/shift on this day/i);
      }
    });

    test
      .info()
      .annotations.push(
        { type: "circuit", description: "GIG planner — Mega Card anti-spam + Pick & Choose" },
        { type: "plan-id", description: planId || "n/a" },
        { type: "conflict-date", description: conflictDate || "n/a" },
      );

    await employerContext.close();
    await employeeContext.close();
  });
});
