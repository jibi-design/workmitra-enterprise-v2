/**
 * Career Work Vault Finalization — resign/terminate/force_complete → vaultFinalized
 *
 * Pulse rule: HIRED is bell-only — do not assert pulse glow for hire.
 *
 * Run: npx playwright test --project=chromium tests/e2e/career-vault-closure.spec.ts
 */

import { expect, test } from "@playwright/test";
import {
  CAREER_CIRCUIT_IDS,
  backdateCareerCircuitInterview,
  clickEmployerCareerPipelineTab,
  employerMarkCareerCandidateHired,
  ensureCareerCircuitWorkerIdentity,
  clickPendingActionAccept,
  dismissCareerEmployerNoticeModal,
  gotoEmployeeHomeHub,
  gotoEmployerCareerPostDashboard,
  pendingOfferResponseActionId,
  syncCareerDataOnly,
  waitForCareerCircuitApplicationStage,
} from "./helpers/career-circuit.helpers";
import {
  advanceToScheduledInterview,
  bootCareerDualContexts,
  careerApplyViaUi,
  probeVaultCareerHistory,
} from "./helpers/career-chaos.helpers";

test.describe.configure({ mode: "serial" });

test.describe("Career Work Vault Finalization", () => {
  test("Terminate closure finalizes wm_vault_career_history_v1 with ratings", async ({
    browser,
  }) => {
    test.setTimeout(300_000);

    const { employerContext, employeeContext, employerPage, employeePage } =
      await bootCareerDualContexts(browser);

    let appId = "";

    await test.step("1. Hire activation (bell-only for CAREER_HIRED — no pulse assert)", async () => {
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
          return svc.recordInterviewResult(postId, applicationId, 1, "passed", "vault suite");
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
      await offerModal.getByPlaceholder("Amount").fill("32000");
      await offerModal.locator('input[type="date"]').last().fill(startIso);
      await offerModal.getByRole("button", { name: "Send Offer" }).click();
      await waitForCareerCircuitApplicationStage(employerPage, "offered");
      await dismissCareerEmployerNoticeModal(employerPage);
      await syncCareerDataOnly(employerPage, employeePage);

      await ensureCareerCircuitWorkerIdentity(employeePage);
      await gotoEmployeeHomeHub(employeePage);
      await clickPendingActionAccept(employeePage, pendingOfferResponseActionId());
      await waitForCareerCircuitApplicationStage(employeePage, "offer_accepted");
      await syncCareerDataOnly(employeePage, employerPage);

      await employerMarkCareerCandidateHired(employerPage);
      await waitForCareerCircuitApplicationStage(employerPage, "hired");
      await syncCareerDataOnly(employerPage, employeePage);

      // Mark joined so terminate from working is valid
      await employerPage.evaluate(async (postId) => {
        const actions = await import("/src/shared/employment/employmentActions.ts");
        await actions.employmentActions.markAsJoined(postId, Date.now());
      }, CAREER_CIRCUIT_IDS.postId);
      await syncCareerDataOnly(employerPage, employeePage);
    });

    await test.step("2. Seed dual ratings then terminate → vault finalize", async () => {
      // Ratings must land on the context that runs terminate (employer) with matching employerMlId.
      await employerPage.evaluate(
        async ({ postId, workerMlId }) => {
          const rating = await import("/src/shared/rating/ratingStorage.ts");
          const employment = await import("/src/shared/employment/employmentStorage.ts");
          const recs = employment.employmentStorage.getAll();
          const rec = recs.find((r: { careerPostId?: string }) => r.careerPostId === postId);
          const employerMlId =
            (rec as { employerMlId?: string } | undefined)?.employerMlId?.trim() || "employer_demo";

          rating.ratingStorage.saveWorkerRating({
            domain: "career",
            workerMlId,
            employerMlId,
            jobId: postId,
            stars: 5,
            tags: ["Paid on time", "Respectful"],
            workAgain: true,
          });
          rating.ratingStorage.saveEmployerRating({
            domain: "career",
            employerMlId,
            workerMlId,
            jobId: postId,
            stars: 4,
            tags: ["Reliable", "Skilled"],
            hireAgain: true,
          });
        },
        {
          postId: CAREER_CIRCUIT_IDS.postId,
          workerMlId: CAREER_CIRCUIT_IDS.workerMlId,
        },
      );
      await syncCareerDataOnly(employerPage, employeePage);

      const terminated = await employerPage.evaluate(async (postId) => {
        const actions = await import("/src/shared/employment/employmentActions.ts");
        return actions.employmentActions.terminate(postId, "misconduct", "E2E vault closure");
      }, CAREER_CIRCUIT_IDS.postId);

      expect(terminated, "terminate must return employment record").toBeTruthy();
      await syncCareerDataOnly(employerPage, employeePage);

      const vault = await probeVaultCareerHistory(employeePage, CAREER_CIRCUIT_IDS.postId);
      expect(vault.rows, "Exactly one history row per career post").toBe(1);
      expect(vault.finalized, "vaultFinalized must be true at closure").toBe(true);
      expect(vault.exitType).toBe("terminated");
      expect(vault.employeeRating).toBe(5);
      expect(vault.employerRating).toBe(4);
    });

    await test.step("3. Idempotent re-terminate does not duplicate vault rows", async () => {
      await employerPage.evaluate(async (postId) => {
        const actions = await import("/src/shared/employment/employmentActions.ts");
        await actions.employmentActions.terminate(postId, "misconduct", "again");
      }, CAREER_CIRCUIT_IDS.postId);
      await syncCareerDataOnly(employerPage, employeePage);

      const vault = await probeVaultCareerHistory(employeePage, CAREER_CIRCUIT_IDS.postId);
      expect(vault.rows).toBe(1);
      expect(vault.finalized).toBe(true);
    });

    await employerContext.close();
    await employeeContext.close();
  });
});
