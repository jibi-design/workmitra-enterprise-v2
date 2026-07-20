import { test, expect } from "@playwright/test";
import {
  SHIFT_CIRCUIT_BROADCAST,
  SHIFT_CIRCUIT_IDS,
  ensureCircuitWorkerIdentity,
  gotoEmployeePostApply,
  gotoEmployerPostDashboard,
  initRoleContext,
  notificationIncludes,
  readCircuitApplications,
  readCircuitNotifications,
  readCircuitWorkspaces,
  readEmployeeUnreadCount,
  seedShiftCircuitPost,
  syncAndDeliverPulse,
  syncDataOnly,
  syncShiftCircuitStorage,
} from "./helpers/shift-circuit.helpers";

/**
 * Job Mitra — Shift Jobs Full Circuit E2E
 *
 * Strict Concurrent Assertion architecture: role-isolated blocks, sync barriers,
 * expect.soft() side-effect matrices, and auto-polling (no hardcoded sleeps).
 *
 * Run: npm run test:e2e:headless -- tests/e2e/shift-full-circuit.spec.ts
 */

test.describe.configure({ mode: "serial" });

test.describe("Shift Jobs — Full Circuit Handshake", () => {
  test("Shift chain — confirm nav, broadcast, complete, rating, vault", async ({ browser }) => {
    test.setTimeout(180_000);

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

    await syncShiftCircuitStorage(employerPage, employeePage);

    let capturedAppId = "";
    let capturedWorkspaceId = "";

    await test.step("1. Seed employer post — visible on dashboard", async () => {
      await gotoEmployerPostDashboard(employerPage);
      await expect(employerPage.getByText(SHIFT_CIRCUIT_IDS.companyName)).toBeVisible();
      await expect(employerPage.getByText(SHIFT_CIRCUIT_IDS.jobName)).toBeVisible();
    });

    await test.step("2. Employee applies — employer notification/pulse", async () => {
      await syncShiftCircuitStorage(employerPage, employeePage);
      await gotoEmployeePostApply(employeePage);

      await employeePage.getByRole("button", { name: "Meets" }).first().click();
      await employeePage.getByRole("button", { name: "Submit Application" }).click();

      await expect(employeePage).toHaveURL(/\/#\/employee\/shift\/applications/, {
        timeout: 15_000,
      });

      await syncDataOnly(employeePage, employerPage);
      await ensureCircuitWorkerIdentity(employeePage);
      const applyPulse = await syncAndDeliverPulse(employeePage, employerPage, "employer");

      const apps = await readCircuitApplications(employerPage);
      const mine = apps.find(
        (app) => app.postId === SHIFT_CIRCUIT_IDS.postId && app.status === "applied",
      );
      expect(mine, "Application must exist after employee apply").toBeTruthy();
      capturedAppId = mine?.id ?? "";

      await expect.soft
        .poll(
          async () => {
            const employerNotes = await readCircuitNotifications(employerPage, "employer");
            return notificationIncludes(employerNotes, /New shift application received/i);
          },
          { timeout: 5_000, message: "2-EMP: Employer bell receives application notification" },
        )
        .toBe(true);

      expect
        .soft(applyPulse.consumed, "2-PULSE: Employer pulse queue must consume application event")
        .toBeGreaterThan(0);
    });

    await test.step("3. Employer shortlists — employee notification", async () => {
      await gotoEmployerPostDashboard(employerPage);
      await employerPage.getByRole("button", { name: /^Applied\b/ }).click();
      await employerPage.getByRole("button", { name: "Shortlist", exact: true }).click();

      await syncAndDeliverPulse(employerPage, employeePage, "employee");

      await expect.soft
        .poll(
          async () => {
            const employeeNotes = await readCircuitNotifications(employeePage, "employee");
            return notificationIncludes(employeeNotes, /shortlisted/i);
          },
          { timeout: 5_000, message: "3-EMP: Employee bell receives shortlist notification" },
        )
        .toBe(true);

      await employeePage.goto("/#/employee/shift/applications");
      await expect
        .soft(employeePage.getByText(/shortlisted/i).first())
        .toBeVisible({ timeout: 5_000 });
    });

    await test.step("4. Employer confirms — concurrent side-effect matrix", async () => {
      const employeeUnreadBefore = await readEmployeeUnreadCount(employeePage);

      await gotoEmployerPostDashboard(employerPage);
      await employerPage.getByRole("button", { name: /^Shortlisted\b/ }).click();
      await employerPage.getByRole("button", { name: "Confirm Worker", exact: true }).click();

      // Block A — Employer (before sync barrier)
      await expect
        .soft(employerPage)
        .toHaveURL(/\/#\/employer\/shift\/workspace\//, { timeout: 5_000 });

      await expect.soft
        .poll(
          async () => {
            const workspaces = await readCircuitWorkspaces(employerPage);
            const ws = workspaces.find(
              (item) =>
                item.postId === SHIFT_CIRCUIT_IDS.postId &&
                (item.status === "active" || item.status === "upcoming"),
            );
            if (ws) {
              capturedWorkspaceId = ws.id;
            }
            return ws !== undefined;
          },
          { timeout: 5_000, message: "4A-2: Workspace must exist in employer localStorage" },
        )
        .toBe(true);

      // — SYNC BARRIER —
      await ensureCircuitWorkerIdentity(employerPage);
      await syncDataOnly(employerPage, employeePage);
      await syncAndDeliverPulse(employerPage, employeePage, "employee");

      // Block B — Employee (after sync barrier)
      await expect.soft
        .poll(
          async () => {
            const unread = await readEmployeeUnreadCount(employeePage);
            return unread > employeeUnreadBefore;
          },
          { timeout: 5_000, message: "4B-1: Employee bell unread count must increase" },
        )
        .toBe(true);

      await expect.soft
        .poll(
          async () => {
            const employeeNotes = await readCircuitNotifications(employeePage, "employee");
            return notificationIncludes(employeeNotes, /selected/i);
          },
          { timeout: 5_000, message: "4B-2: Employee notification title must match /selected/i" },
        )
        .toBe(true);
    });

    await test.step("5. S-DE1 — employer workspace controls visible", async () => {
      await expect(employerPage).toHaveURL(
        new RegExp(`/#/employer/shift/workspace/${capturedWorkspaceId}`),
        { timeout: 5_000 },
      );
      await expect
        .soft(employerPage.getByText("Employer Controls"))
        .toBeVisible({ timeout: 5_000 });
    });

    await test.step("6. Employer broadcasts — employee sees announcement", async () => {
      await employeePage.goto("/#/employee/shift/applications");

      await employerPage.getByRole("button", { name: "Broadcast" }).click();
      await employerPage
        .getByPlaceholder("Type shift update details")
        .fill(SHIFT_CIRCUIT_BROADCAST);
      await employerPage.getByRole("button", { name: "Send Broadcast" }).click();

      await syncShiftCircuitStorage(employerPage, employeePage);
      await employeePage.evaluate(() => {
        window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));
      });

      await expect.soft
        .poll(
          async () => {
            const employeeNotes = await readCircuitNotifications(employeePage, "employee");
            return notificationIncludes(employeeNotes, /announcement|New workspace update/i);
          },
          { timeout: 5_000, message: "6-EMP: Employee bell receives broadcast notification" },
        )
        .toBe(true);

      await employeePage.goto(`/#/employee/shift/workspace/${capturedWorkspaceId}`);
      await expect
        .soft(employeePage.getByText(SHIFT_CIRCUIT_BROADCAST))
        .toBeVisible({ timeout: 5_000 });
    });

    await test.step("7. Employer marks shift completed", async () => {
      await employerPage.goto(`/#/employer/shift/workspace/${capturedWorkspaceId}`);
      await employerPage.getByRole("button", { name: "Mark Completed" }).click();
      await employerPage
        .getByRole("dialog", { name: "Mark shift completed?" })
        .getByRole("button", { name: "Mark Completed" })
        .click();

      await expect
        .poll(async () => {
          const workspaces = await readCircuitWorkspaces(employerPage);
          return workspaces.find((item) => item.id === capturedWorkspaceId)?.status ?? "";
        })
        .toBe("completed");

      await syncShiftCircuitStorage(employerPage, employeePage);
    });

    await test.step("8. S-DE3 — dual rating notifications on complete", async () => {
      await expect.soft
        .poll(
          async () => {
            const employeeNotes = await readCircuitNotifications(employeePage, "employee");
            return notificationIncludes(employeeNotes, /please rate your experience/i);
          },
          { timeout: 5_000, message: "8-EMP: Employee rating prompt notification" },
        )
        .toBe(true);

      await expect.soft
        .poll(
          async () => {
            const employerNotes = await readCircuitNotifications(employerPage, "employer");
            return notificationIncludes(employerNotes, /please rate your employee/i);
          },
          { timeout: 5_000, message: "8-EMPLOYER: Employer rating prompt notification" },
        )
        .toBe(true);
    });

    await test.step("9. S-DE4 — employer rates worker → vault history finalized", async () => {
      await syncShiftCircuitStorage(employerPage, employeePage);

      await employerPage.goto(`/#/employer/shift/workspace/${capturedWorkspaceId}`);
      await employerPage.getByRole("button", { name: "Rate Worker" }).click();
      await expect(employerPage.getByRole("button", { name: "Submit Rating" })).toBeVisible({
        timeout: 10_000,
      });
      await employerPage.getByRole("button", { name: "5 stars" }).click();
      await employerPage.getByRole("button", { name: "Yes" }).click();
      await employerPage.getByRole("button", { name: "Submit Rating" }).click();

      await syncShiftCircuitStorage(employerPage, employeePage);

      const vaultProbe = await employeePage.evaluate(
        async ({ companyName, jobName, workspaceId }) => {
          const historyRaw = localStorage.getItem("wm_vault_shift_history_v1") ?? "[]";
          const history = JSON.parse(historyRaw) as Array<{
            workspaceId?: string;
            companyName?: string;
            jobTitle?: string;
            vaultFinalized?: boolean;
          }>;

          const historyHit = history.some(
            (entry) =>
              entry.workspaceId === workspaceId &&
              entry.vaultFinalized === true &&
              (entry.companyName?.includes(companyName) || entry.jobTitle?.includes(jobName)),
          );

          const aggregator =
            await import("/src/features/employee/workVault/services/vaultDataAggregator.ts");
          const data = aggregator.getVaultSectionData();
          const referenceHit = (data.references ?? []).some(
            (ref) => ref.companyName?.includes(companyName) || ref.jobTitle?.includes(jobName),
          );

          return {
            historyHit,
            referenceHit,
            totalShiftsCompleted: data.workStats.totalShiftsCompleted,
          };
        },
        {
          companyName: SHIFT_CIRCUIT_IDS.companyName,
          jobName: SHIFT_CIRCUIT_IDS.jobName,
          workspaceId: capturedWorkspaceId,
        },
      );

      expect.soft(vaultProbe.historyHit, "9-VAULT: Finalized shift history record").toBe(true);
      expect
        .soft(
          vaultProbe.referenceHit || vaultProbe.totalShiftsCompleted > 0,
          "9-VAULT: Work Vault reflects completed shift dossier",
        )
        .toBe(true);
    });

    test
      .info()
      .annotations.push(
        { type: "circuit", description: "SHIFT full handshake — soft concurrent matrix" },
        { type: "captured-app-id", description: capturedAppId || "n/a" },
        { type: "captured-workspace-id", description: capturedWorkspaceId || "n/a" },
      );

    await employerContext.close();
    await employeeContext.close();
  });
});
