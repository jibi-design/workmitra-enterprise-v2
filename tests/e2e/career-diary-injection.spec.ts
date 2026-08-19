/**
 * Personal Work Diary Injection — locked until hireCandidate/activateCareerHire
 *
 * Rule: offer_accepted ⇒ diary LOCKED; after hire ⇒ diary ACTIVE + lifecycle employment.
 *
 * Run: npx playwright test --project=chromium tests/e2e/career-diary-injection.spec.ts
 */

import { expect, test } from "@playwright/test";
import {
  CAREER_CIRCUIT_IDS,
  ensureCareerCircuitWorkerIdentity,
  clickPendingActionAccept,
  dismissCareerEmployerNoticeModal,
  gotoEmployeeHomeHub,
  gotoEmployerCareerPostDashboard,
  pendingOfferResponseActionId,
  syncCareerDataOnly,
  waitForCareerCircuitApplicationStage,
  backdateCareerCircuitInterview,
  clickEmployerCareerPipelineTab,
  employerMarkCareerCandidateHired,
} from "./helpers/career-circuit.helpers";
import {
  advanceToScheduledInterview,
  bootCareerDualContexts,
  careerApplyViaUi,
  probeLifecycleEmployment,
  readDiaryLockState,
} from "./helpers/career-chaos.helpers";

test.describe.configure({ mode: "serial" });

test.describe("Career Personal Work Diary Injection", () => {
  test("Diary locked at offer_accepted; unlocks only after hire activation", async ({
    browser,
  }) => {
    test.setTimeout(300_000);

    const { employerContext, employeeContext, employerPage, employeePage } =
      await bootCareerDualContexts(browser);

    let appId = "";

    await test.step("1. Pipeline to offer_accepted", async () => {
      appId = await careerApplyViaUi(employeePage, employerPage);
      await advanceToScheduledInterview(employerPage, employeePage, appId);

      await employeePage.evaluate(async (postId) => {
        const svc =
          await import("/src/features/employee/careerJobs/services/careerInterviewRsvpService.ts");
        svc.acceptInterview(postId);
      }, CAREER_CIRCUIT_IDS.postId);
      await syncCareerDataOnly(employeePage, employerPage);

      await backdateCareerCircuitInterview(employerPage, CAREER_CIRCUIT_IDS.postId);
      await employerPage.evaluate(
        async ({ postId, applicationId }) => {
          const svc =
            await import("/src/features/employer/careerJobs/services/careerInterviewService.ts");
          return svc.recordInterviewResult(postId, applicationId, 1, "passed", "diary suite");
        },
        { postId: CAREER_CIRCUIT_IDS.postId, applicationId: appId },
      );
      await syncCareerDataOnly(employerPage, employeePage);

      await gotoEmployerCareerPostDashboard(employerPage);
      await clickEmployerCareerPipelineTab(employerPage, "Interview");
      await employerPage.getByRole("button", { name: "Send Offer", exact: true }).first().click();
      const startIso = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
      const offerModal = employerPage.getByRole("dialog", { name: /Send Job Offer/i });
      await offerModal
        .getByPlaceholder("Job title for this offer")
        .fill(CAREER_CIRCUIT_IDS.jobTitle);
      await offerModal.getByPlaceholder("Amount").fill("30000");
      await offerModal.locator('input[type="date"]').last().fill(startIso);
      await offerModal.getByRole("button", { name: "Send Offer" }).click();
      await waitForCareerCircuitApplicationStage(employerPage, "offered");
      await dismissCareerEmployerNoticeModal(employerPage);
      await syncCareerDataOnly(employerPage, employeePage);

      await ensureCareerCircuitWorkerIdentity(employeePage);
      await gotoEmployeeHomeHub(employeePage);
      const offerActionId = pendingOfferResponseActionId();
      await clickPendingActionAccept(employeePage, offerActionId);
      await waitForCareerCircuitApplicationStage(employeePage, "offer_accepted");
      await syncCareerDataOnly(employeePage, employerPage);
    });

    await test.step("2. CRITICAL — diary LOCKED after offer_accepted (pre-hire)", async () => {
      const diary = await readDiaryLockState(employeePage);
      expect(diary, "Personal Work Diary must stay locked until hire").toBe("locked");

      const life = await probeLifecycleEmployment(employeePage);
      expect(life.hasPrimary, "No primary employment before hire").toBe(false);
    });

    await test.step("3. hireCandidate / activateCareerHire → diary UNLOCKS", async () => {
      await employerMarkCareerCandidateHired(employerPage, employeePage);
      await waitForCareerCircuitApplicationStage(employerPage, "hired");
      await syncCareerDataOnly(employerPage, employeePage);
      await ensureCareerCircuitWorkerIdentity(employeePage);

      await waitForCareerCircuitApplicationStage(employeePage, "hired");

      const life = await probeLifecycleEmployment(employeePage);
      expect(life.hasPrimary, "activateCareerHire must create primary employment").toBe(true);
      expect(life.employmentId).toBeTruthy();

      const diary = await readDiaryLockState(employeePage);
      expect(diary, "Diary unlocks only after hire activation").toBe("active");

      await employeePage.goto(`/#/employee/employment/${life.employmentId}`);
      await expect(employeePage.getByText(/Work Diary|Daily Tasks|Personal/i).first()).toBeVisible({
        timeout: 15_000,
      });
    });

    await employerContext.close();
    await employeeContext.close();
  });
});
