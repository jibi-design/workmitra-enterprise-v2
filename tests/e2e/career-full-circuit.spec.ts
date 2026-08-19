import { test, expect } from "@playwright/test";
import {
  CAREER_CIRCUIT_IDS,
  assertPendingActionAcceptHasPulseHalo,
  acceptCareerOfferOnPage,
  backdateCareerCircuitInterview,
  clickEmployerCareerPipelineTab,
  ensureCareerCircuitWorkerIdentity,
  ensureCareerOfferDetailsOnEmployee,
  ensureCareerEmployerProfileOnPage,
  getFutureInterviewScheduleSlot,
  clickPendingActionAccept,
  gotoEmployeeCareerPostApply,
  gotoEmployeeHomeHub,
  expandPendingActionsHub,
  employerMarkCareerCandidateHired,
  gotoEmployerCareerPostDashboard,
  gotoEmployerHome,
  initCareerRoleContext,
  notificationIncludes,
  pendingInterviewRsvpActionId,
  pendingOfferResponseActionId,
  readCareerCircuitApplications,
  readCareerCircuitApplicationStage,
  readCareerCircuitNotifications,
  readCareerCircuitWorkspaces,
  readEmployerUnreadNotificationCount,
  readHrCircuitRecords,
  seedCareerCircuitPost,
  syncAndDeliverCareerPulse,
  syncCareerCircuitStorage,
  syncCareerDataOnly,
  waitForCareerCircuitApplicationStage,
  dismissCareerEmployerNoticeModal,
} from "./helpers/career-circuit.helpers";
import {
  employeeSubmitCareerResignation,
  employerConfirmCareerJoining,
  employerConfirmCareerResignation,
  gotoEmployeeCareerWorkspace,
} from "./helpers/career-resign.helpers";
import { fillCareerApplyPhone } from "./helpers/e2e-bootstrap";
import { confirmSubmitApplication } from "./helpers/submitApplicationConfirm";

/**
 * Job Mitra — Career Jobs Full Circuit E2E
 *
 * Strict Concurrent Assertion architecture: role-isolated blocks, sync barriers,
 * expect.soft() side-effect matrices, and auto-polling (no hardcoded sleeps).
 *
 * Run: npm run test:e2e:headless -- tests/e2e/career-full-circuit.spec.ts
 */

test.describe.configure({ mode: "serial" });

test.describe("Career Jobs — Full Professional Funnel", () => {
  test("Career chain — hub RSVP, offer, bell, HR, diary, vault", async ({ browser }) => {
    test.setTimeout(540_000);

    const employerContext = await browser.newContext();
    const employeeContext = await browser.newContext();

    const employerPage = await employerContext.newPage();
    const employeePage = await employeeContext.newPage();

    await initCareerRoleContext(employerPage, "employer");
    await initCareerRoleContext(employeePage, "employee");

    await seedCareerCircuitPost(employerPage);
    await seedCareerCircuitPost(employeePage);

    await employerPage.goto("/#/employer/career");
    await employeePage.goto("/#/employee/career");

    await ensureCareerEmployerProfileOnPage(employerPage);
    await syncCareerCircuitStorage(employerPage, employeePage);

    let capturedAppId = "";
    let capturedWorkspaceId = "";

    await test.step("1. Employer career post — visible on dashboard", async () => {
      await gotoEmployerCareerPostDashboard(employerPage);
      await expect(employerPage.getByText(CAREER_CIRCUIT_IDS.companyName)).toBeVisible();
      await expect(employerPage.getByText(CAREER_CIRCUIT_IDS.jobTitle)).toBeVisible();
    });

    await test.step("2. Employee applies — shared application handshake", async () => {
      await syncCareerCircuitStorage(employerPage, employeePage);
      await gotoEmployeeCareerPostApply(employeePage);

      await employeePage
        .getByPlaceholder("Briefly explain why this role fits your experience...")
        .fill("I have operations experience and am ready to contribute to your team immediately.");
      await fillCareerApplyPhone(employeePage);
      const consent = employeePage.getByRole("checkbox", {
        name: /I confirm these contact details are mine/i,
      });
      if (!(await consent.isChecked())) {
        await consent.dispatchEvent("click");
      }
      if (!(await consent.isChecked())) {
        await consent.evaluate((el) => {
          const input = el as HTMLInputElement;
          const proto = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "checked",
          );
          proto?.set?.call(input, true);
          input.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }
      await expect(consent).toBeChecked({ timeout: 5_000 });

      await employeePage.getByRole("button", { name: "Submit Application" }).click();
      await confirmSubmitApplication(employeePage);

      await syncCareerDataOnly(employeePage, employerPage);
      await ensureCareerCircuitWorkerIdentity(employeePage);
      await ensureCareerCircuitWorkerIdentity(employerPage);
      const applyPulse = await syncAndDeliverCareerPulse(employeePage, employerPage, "employer");

      const apps = await readCareerCircuitApplications(employerPage);
      const mine = apps.find(
        (app) => app.jobId === CAREER_CIRCUIT_IDS.postId && app.stage === "applied",
      );
      expect(mine, "Application must exist in shared storage after apply").toBeTruthy();
      capturedAppId = mine?.id ?? "";

      expect
        .soft(applyPulse.consumed, "2-PULSE: Employer pulse queue must consume apply event")
        .toBeGreaterThan(0);

      await gotoEmployerCareerPostDashboard(employerPage);
      await clickEmployerCareerPipelineTab(employerPage, "Applied");
      await expect
        .soft(
          employerPage.locator(".wm-candidate-name", { hasText: CAREER_CIRCUIT_IDS.workerName }),
        )
        .toBeVisible({ timeout: 15_000 });
    });

    await test.step("3. Employer shortlists and schedules interview", async () => {
      await gotoEmployerCareerPostDashboard(employerPage);
      await clickEmployerCareerPipelineTab(employerPage, "Applied");
      await employerPage.getByRole("button", { name: "Move to Shortlist", exact: true }).click();

      await syncCareerDataOnly(employerPage, employeePage);

      await clickEmployerCareerPipelineTab(employerPage, "Shortlist");
      await employerPage.getByRole("button", { name: "Schedule Interview", exact: true }).click();

      const scheduleSlot = getFutureInterviewScheduleSlot();
      const scheduleModal = employerPage.getByRole("dialog", { name: "Schedule Interview" });

      await scheduleModal.getByRole("button", { name: "Phone", exact: true }).click();
      await scheduleModal.locator('input[type="date"]').fill(scheduleSlot.date);
      await scheduleModal.locator('input[type="time"]').fill(scheduleSlot.time);
      await scheduleModal.getByTestId("career-schedule-phone-national").fill("9876543210");

      await expect(scheduleModal.getByRole("button", { name: "Confirm Schedule" })).toBeEnabled({
        timeout: 10_000,
      });
      await scheduleModal.getByRole("button", { name: "Confirm Schedule" }).click();

      await syncCareerDataOnly(employerPage, employeePage);

      await expect.soft
        .poll(
          async () => {
            const interviewApps = await readCareerCircuitApplications(employerPage);
            return interviewApps.some(
              (app) => app.jobId === CAREER_CIRCUIT_IDS.postId && app.stage === "interview",
            );
          },
          { timeout: 5_000, message: "3-EMPLOYER: Application must reach interview stage" },
        )
        .toBe(true);
    });

    await test.step("4. Interview RSVP — concurrent side-effect matrix", async () => {
      const employerUnreadBefore = await readEmployerUnreadNotificationCount(employerPage);

      await syncCareerDataOnly(employerPage, employeePage);
      await ensureCareerCircuitWorkerIdentity(employeePage);
      await gotoEmployeeHomeHub(employeePage);
      await expandPendingActionsHub(employeePage);

      const interviewActionId = pendingInterviewRsvpActionId();

      await expect(employeePage.getByTestId("pending-actions-hub")).toHaveAttribute(
        "data-pending-active",
        "true",
        { timeout: 15_000 },
      );
      await expect
        .soft(employeePage.getByText("Interview RSVP required").first())
        .toBeVisible({ timeout: 10_000 });

      await assertPendingActionAcceptHasPulseHalo(employeePage, interviewActionId);
      await clickPendingActionAccept(employeePage, interviewActionId);

      // Block A — Employee (before sync barrier)
      await expect.soft
        .poll(
          async () => {
            const visible = await employeePage
              .getByTestId(`pending-action-row-${interviewActionId}`)
              .isVisible()
              .catch(() => false);
            return !visible;
          },
          { timeout: 20_000, message: "4A-1: Interview RSVP row must vanish from hub" },
        )
        .toBe(true);

      await waitForCareerCircuitApplicationStage(employeePage, "interview");

      // — SYNC BARRIER —
      await syncCareerDataOnly(employeePage, employerPage);
      await syncCareerCircuitStorage(employeePage, employerPage, { includeNotifications: true });
      await gotoEmployerHome(employerPage);
      await syncAndDeliverCareerPulse(employeePage, employerPage, "employer");

      // Block B — Employer (after sync barrier)
      await expect.soft
        .poll(
          async () => {
            const unread = await readEmployerUnreadNotificationCount(employerPage);
            return unread > employerUnreadBefore;
          },
          { timeout: 12_000, message: "4B-1: Employer bell unread count must increase" },
        )
        .toBe(true);

      const employerUnreadAfter = await readEmployerUnreadNotificationCount(employerPage);
      await expect
        .soft(
          employerPage
            .getByRole("button", { name: "Notifications" })
            .locator(`span[aria-label="${employerUnreadAfter} unread"]`),
        )
        .toBeVisible({ timeout: 5_000 });

      await expect.soft
        .poll(
          async () => {
            const employerNotes = await readCareerCircuitNotifications(employerPage, "employer");
            return notificationIncludes(employerNotes, /interview accepted/i);
          },
          { timeout: 5_000, message: "4B-2: Employer bell title matches interview accepted" },
        )
        .toBe(true);
    });

    await test.step("4b. Employer records interview passed (plumbing)", async () => {
      await backdateCareerCircuitInterview(employerPage, CAREER_CIRCUIT_IDS.postId);
      await syncCareerDataOnly(employerPage, employeePage);

      const recorded = await employerPage.evaluate(
        async ({ postId, appId }) => {
          const svc =
            await import("/src/features/employer/careerJobs/services/careerInterviewService.ts");
          return svc.recordInterviewResult(postId, appId, 1, "passed", "E2E circuit pass");
        },
        { postId: CAREER_CIRCUIT_IDS.postId, appId: capturedAppId },
      );

      expect(recorded, "Employer must record interview pass after backdate").toBe(true);

      await syncCareerDataOnly(employerPage, employeePage);
    });

    await test.step("5. Employer sends offer", async () => {
      await gotoEmployerCareerPostDashboard(employerPage);
      await clickEmployerCareerPipelineTab(employerPage, "Interview");
      await employerPage.getByRole("button", { name: "Send Offer", exact: true }).first().click();

      const startDate = new Date(Date.now() + 7 * 86_400_000);
      const startIso = startDate.toISOString().slice(0, 10);

      const offerModal = employerPage.getByRole("dialog", { name: /Send Job Offer/i });
      await offerModal
        .getByPlaceholder("Job title for this offer")
        .fill(CAREER_CIRCUIT_IDS.jobTitle);
      await offerModal.getByPlaceholder("Amount").fill("30000");
      await offerModal.locator('input[type="date"]').last().fill(startIso);

      const sendOfferButton = offerModal.getByRole("button", { name: "Send Offer" });
      await expect(sendOfferButton).toBeEnabled({ timeout: 10_000 });
      await sendOfferButton.click();

      await waitForCareerCircuitApplicationStage(employerPage, "offered");
      await dismissCareerEmployerNoticeModal(employerPage);
      await syncCareerDataOnly(employerPage, employeePage);
      await waitForCareerCircuitApplicationStage(employeePage, "offered");

      const offeredApps = await readCareerCircuitApplications(employeePage);
      const offered = offeredApps.find(
        (app) => app.jobId === CAREER_CIRCUIT_IDS.postId && app.stage === "offered",
      );
      expect(offered, "Application must be in offered stage after send offer").toBeTruthy();
    });

    await test.step("6. Accept Offer + Employer Hire — concurrent side-effect matrix", async () => {
      const employerUnreadBefore = await readEmployerUnreadNotificationCount(employerPage);

      await syncCareerDataOnly(employerPage, employeePage);
      await ensureCareerCircuitWorkerIdentity(employeePage);
      await ensureCareerOfferDetailsOnEmployee(employeePage, employerPage);
      await waitForCareerCircuitApplicationStage(employeePage, "offered");
      await gotoEmployeeHomeHub(employeePage);
      await expandPendingActionsHub(employeePage);

      const offerActionId = pendingOfferResponseActionId();

      await expect(employeePage.getByTestId("pending-actions-hub")).toHaveAttribute(
        "data-pending-active",
        "true",
        { timeout: 15_000 },
      );
      await expect
        .soft(employeePage.getByTestId(`pending-action-row-${offerActionId}`))
        .toBeVisible({
          timeout: 15_000,
        });
      await expect
        .soft(employeePage.getByText("Job offer received").first())
        .toBeVisible({ timeout: 10_000 });
      await assertPendingActionAcceptHasPulseHalo(employeePage, offerActionId);
      await clickPendingActionAccept(employeePage, offerActionId);

      // Offer accept can navigate away — ensure stage via service fallback if needed.
      await expect.soft
        .poll(
          async () => {
            const stage = await readCareerCircuitApplicationStage(employeePage);
            if (stage === "offer_accepted") return true;
            return acceptCareerOfferOnPage(employeePage);
          },
          { timeout: 15_000, message: "6A-1: Offer must reach offer_accepted stage" },
        )
        .toBe(true);

      await expect.soft
        .poll(
          async () => {
            const visible = await employeePage
              .getByTestId(`pending-action-row-${offerActionId}`)
              .isVisible()
              .catch(() => false);
            return !visible;
          },
          { timeout: 10_000, message: "6A-1: Offer pending-action row must vanish from hub" },
        )
        .toBe(true);

      await waitForCareerCircuitApplicationStage(employeePage, "offer_accepted");

      // — SYNC BARRIER (offer accepted) —
      await syncCareerDataOnly(employeePage, employerPage);
      await syncCareerCircuitStorage(employeePage, employerPage, { includeNotifications: true });
      await gotoEmployerHome(employerPage);
      await syncAndDeliverCareerPulse(employeePage, employerPage, "employer");

      // Block B — Employer offer-accepted signals (before hire confirm)
      await expect.soft
        .poll(
          async () => {
            const unread = await readEmployerUnreadNotificationCount(employerPage);
            return unread > employerUnreadBefore;
          },
          { timeout: 5_000, message: "6B-1: Employer bell unread count must increase" },
        )
        .toBe(true);

      const employerUnreadAfter = await readEmployerUnreadNotificationCount(employerPage);
      await expect
        .soft(
          employerPage
            .getByRole("button", { name: "Notifications" })
            .locator(`span[aria-label="${employerUnreadAfter} unread"]`),
        )
        .toBeVisible({ timeout: 5_000 });

      await expect.soft
        .poll(
          async () => {
            const employerNotes = await readCareerCircuitNotifications(employerPage, "employer");
            return notificationIncludes(
              employerNotes,
              /offer accepted|Career offer accepted|accepted/i,
            );
          },
          { timeout: 5_000, message: "6B-2: Employer bell title matches offer accepted" },
        )
        .toBe(true);

      // Block C — Employer hire confirm (V2: hired + workspace only after employer action)
      await employerMarkCareerCandidateHired(employerPage, employeePage);
      await syncCareerDataOnly(employerPage, employeePage);
      await syncCareerCircuitStorage(employerPage, employeePage);
      await syncCareerCircuitStorage(employerPage, employerPage);
      await ensureCareerEmployerProfileOnPage(employerPage);
      await waitForCareerCircuitApplicationStage(employerPage, "hired");
      await syncCareerDataOnly(employerPage, employeePage);
      await syncAndDeliverCareerPulse(employerPage, employeePage, "employee");

      await waitForCareerCircuitApplicationStage(employerPage, "hired");
      await waitForCareerCircuitApplicationStage(employeePage, "hired");

      await expect.soft
        .poll(
          async () => {
            const workspaces = await readCareerCircuitWorkspaces(employeePage);
            const workspace = workspaces.find((item) => item.jobId === CAREER_CIRCUIT_IDS.postId);
            if (workspace?.id) {
              capturedWorkspaceId = workspace.id;
            }
            return Boolean(workspace?.id);
          },
          { timeout: 10_000, message: "6C-1: Career workspace must be created on employer hire" },
        )
        .toBe(true);

      await expect.soft
        .poll(
          async () => {
            const hrRecords = await readHrCircuitRecords(employerPage);
            return hrRecords.some(
              (record) =>
                record.careerPostId === CAREER_CIRCUIT_IDS.postId &&
                record.applicationId === capturedAppId,
            );
          },
          {
            timeout: 5_000,
            message: "6C-2: HR record must exist in wm_hr_employer_{id}_management_v1",
          },
        )
        .toBe(true);

      await employerPage.goto("/#/employer/hr");
      await ensureCareerEmployerProfileOnPage(employerPage);

      const hrRecords = await readHrCircuitRecords(employerPage);
      expect
        .soft(
          hrRecords.some(
            (record) =>
              record.careerPostId === CAREER_CIRCUIT_IDS.postId &&
              record.applicationId === capturedAppId,
          ),
          "6C-2b: HR record visible via hrStorage.core",
        )
        .toBe(true);

      await gotoEmployerCareerPostDashboard(employerPage);
      await clickEmployerCareerPipelineTab(employerPage, "Hired");
      await employerConfirmCareerJoining(employerPage);
      await syncCareerCircuitStorage(employerPage, employeePage);
    });

    await test.step("7. Career workspace navigates to Work Diary / punch-in", async () => {
      expect(capturedWorkspaceId, "7: workspace id captured after hire").toBeTruthy();
      await gotoEmployeeCareerWorkspace(employeePage, capturedWorkspaceId);
      await expect.soft(employeePage.getByText(CAREER_CIRCUIT_IDS.jobTitle).first()).toBeVisible({
        timeout: 5_000,
      });

      const diaryCta = employeePage.getByRole("button", {
        name: /Open Daily Tasks.*Work Diary/i,
      });

      await expect
        .soft(diaryCta, "Career Workspace must link directly to Work Diary / punch-in")
        .toBeVisible({ timeout: 5_000 });

      await diaryCta.click();

      await expect.soft(employeePage).toHaveURL(/\/#\/employee\/employment\//, { timeout: 5_000 });
      await expect
        .soft(employeePage.getByText("Work Diary").first())
        .toBeVisible({ timeout: 5_000 });
    });

    await test.step("8. Resign, confirm, definitive vault history entry", async () => {
      await syncCareerCircuitStorage(employerPage, employeePage);

      expect(capturedWorkspaceId, "8: workspace id captured after hire").toBeTruthy();
      await gotoEmployeeCareerWorkspace(employeePage, capturedWorkspaceId);
      await employeeSubmitCareerResignation(employeePage);

      await syncCareerCircuitStorage(employeePage, employerPage);

      await gotoEmployerCareerPostDashboard(employerPage);
      await clickEmployerCareerPipelineTab(employerPage, "Hired");
      await employerConfirmCareerResignation(employerPage);

      await syncCareerCircuitStorage(employerPage, employeePage);

      const vaultProbe = await employeePage.evaluate(
        async ({ companyName, jobTitle, postId, workerMlId }) => {
          const { getVaultCareerHistory } =
            await import("/src/features/employee/workVault/storage/vaultCareerHistory.storage.ts");

          const history = [
            ...getVaultCareerHistory(workerMlId),
            ...getVaultCareerHistory(),
          ];

          const legacyRaw = localStorage.getItem("wm_vault_career_history_v1") ?? "[]";
          let legacy: typeof history = [];
          try {
            legacy = JSON.parse(legacyRaw) as typeof history;
          } catch {
            legacy = [];
          }

          const merged = [...history, ...legacy];
          const historyHit = merged.some(
            (entry) =>
              entry.careerPostId === postId &&
              entry.vaultFinalized === true &&
              (entry.companyName?.includes(companyName) || entry.jobTitle?.includes(jobTitle)),
          );

          const aggregator =
            await import("/src/features/employee/workVault/services/vaultDataAggregator.ts");
          const data = aggregator.getVaultSectionData();
          const experienceHit = (data.workExperience ?? []).some(
            (item) => item.companyName?.includes(companyName) || item.jobTitle?.includes(jobTitle),
          );

          return { historyHit, experienceHit };
        },
        {
          companyName: CAREER_CIRCUIT_IDS.companyName,
          jobTitle: CAREER_CIRCUIT_IDS.jobTitle,
          postId: CAREER_CIRCUIT_IDS.postId,
          workerMlId: CAREER_CIRCUIT_IDS.workerMlId,
        },
      );

      expect.soft(vaultProbe.historyHit, "8-VAULT: Finalized career history record").toBe(true);
      expect.soft(vaultProbe.experienceHit, "8-VAULT: Work experience section updated").toBe(true);
    });

    test
      .info()
      .annotations.push(
        { type: "circuit", description: "CAREER full handshake — soft concurrent matrix" },
        { type: "captured-app-id", description: capturedAppId || "n/a" },
        { type: "captured-workspace-id", description: capturedWorkspaceId || "n/a" },
      );

    await employerContext.close();
    await employeeContext.close();
  });
});
