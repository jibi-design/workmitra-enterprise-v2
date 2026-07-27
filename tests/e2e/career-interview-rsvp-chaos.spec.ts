/**
 * Career Interview RSVP Chaos — Accept vs Decline → withdrawn
 * Pulse: assert for INTERVIEW path / RSVP; never for HIRED/REJECTED.
 *
 * Run: npx playwright test --project=chromium tests/e2e/career-interview-rsvp-chaos.spec.ts
 */

import { expect, test } from "@playwright/test";
import {
  CAREER_CIRCUIT_IDS,
  ensureCareerCircuitWorkerIdentity,
  clickPendingActionAccept,
  clickPendingActionDecline,
  gotoEmployeeHomeHub,
  pendingInterviewRsvpActionId,
  readCareerCircuitApplications,
  syncAndDeliverCareerPulse,
  syncCareerDataOnly,
  waitForCareerCircuitApplicationStage,
} from "./helpers/career-circuit.helpers";
import {
  advanceToScheduledInterview,
  assertCareerPulseConsumed,
  bootCareerDualContexts,
  careerApplyViaUi,
} from "./helpers/career-chaos.helpers";

test.describe.configure({ mode: "serial" });

test.describe("Career Interview RSVP Chaos", () => {
  test("Accept RSVP keeps interview stage; Decline forces withdrawn", async ({ browser }) => {
    test.setTimeout(240_000);

    const { employerContext, employeeContext, employerPage, employeePage } =
      await bootCareerDualContexts(browser);

    let appId = "";

    await test.step("A. Apply → schedule interview (pulse shortlist/invite path)", async () => {
      appId = await careerApplyViaUi(employeePage, employerPage);
      await assertCareerPulseConsumed(employeePage, employerPage, "employer", "APPLY");

      await advanceToScheduledInterview(employerPage, employeePage, appId);
      await assertCareerPulseConsumed(employerPage, employeePage, "employee", "INTERVIEW_INVITE");

      await waitForCareerCircuitApplicationStage(employeePage, "interview");
      const apps = await readCareerCircuitApplications(employeePage);
      const row = apps.find((a) => a.id === appId);
      expect(row?.stage).toBe("interview");
    });

    await test.step("B. ACCEPT RSVP — stage stays interview; employer pulse/bell", async () => {
      await syncCareerDataOnly(employerPage, employeePage);
      await ensureCareerCircuitWorkerIdentity(employeePage);
      await gotoEmployeeHomeHub(employeePage);

      const actionId = pendingInterviewRsvpActionId();
      await expect(employeePage.getByTestId(`pending-action-row-${actionId}`)).toBeVisible({
        timeout: 15_000,
      });
      await clickPendingActionAccept(employeePage, actionId);

      await waitForCareerCircuitApplicationStage(employeePage, "interview");
      const apps = await readCareerCircuitApplications(employeePage);
      const row = apps.find((a) => a.id === appId);
      expect(row?.stage, "Accept must NOT withdraw").toBe("interview");

      await syncCareerDataOnly(employeePage, employerPage);
      const rsvpPulse = await syncAndDeliverCareerPulse(employeePage, employerPage, "employer");
      expect.soft(rsvpPulse.consumed, "RSVP accept must enqueue employer pulse").toBeGreaterThan(0);
    });

    await test.step("C. Reset pipeline + DECLINE RSVP → withdrawn (critical)", async () => {
      // Fresh application for decline path
      await employeePage.evaluate((postId) => {
        const raw = localStorage.getItem("wm_employee_career_applications_v1") ?? "[]";
        const apps = JSON.parse(raw) as Array<{ id: string; jobId: string; stage: string }>;
        const next = apps.filter((a) => a.jobId !== postId);
        localStorage.setItem("wm_employee_career_applications_v1", JSON.stringify(next));
        window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
      }, CAREER_CIRCUIT_IDS.postId);
      await syncCareerDataOnly(employeePage, employerPage);

      appId = await careerApplyViaUi(employeePage, employerPage);
      await advanceToScheduledInterview(employerPage, employeePage, appId);
      await syncCareerDataOnly(employerPage, employeePage);
      await ensureCareerCircuitWorkerIdentity(employeePage);
      await gotoEmployeeHomeHub(employeePage);

      const actionId = pendingInterviewRsvpActionId();
      await expect(employeePage.getByTestId(`pending-action-row-${actionId}`)).toBeVisible({
        timeout: 15_000,
      });

      await clickPendingActionDecline(employeePage, actionId);

      await waitForCareerCircuitApplicationStage(employeePage, "withdrawn");
      const apps = await readCareerCircuitApplications(employeePage);
      const row = apps.find((a) => a.id === appId);
      expect(row?.stage, "Decline interview MUST set stage withdrawn").toBe("withdrawn");

      await syncCareerDataOnly(employeePage, employerPage);
      const employerApps = await readCareerCircuitApplications(employerPage);
      const employerRow = employerApps.find((a) => a.id === appId);
      expect(employerRow?.stage, "Employer mirror must show withdrawn").toBe("withdrawn");

      // Decline notifies employer — pulse enabled for INTERVIEW_DECLINED
      const declinePulse = await syncAndDeliverCareerPulse(employeePage, employerPage, "employer");
      expect.soft(declinePulse.consumed, "RSVP decline pulse to employer").toBeGreaterThan(0);
    });

    await employerContext.close();
    await employeeContext.close();
  });
});
