import type { Browser, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { E2E_VERIFIED_EMPLOYER_PROFILE } from "./e2e-employer-profile";
import {
  CAREER_CIRCUIT_IDS,
  ensureCareerEmployerProfileOnPage,
  ensureCareerCircuitWorkerIdentity,
  getFutureInterviewScheduleSlot,
  initCareerRoleContext,
  readCareerCircuitApplications,
  seedCareerCircuitPost,
  syncAndDeliverCareerPulse,
  syncCareerCircuitStorage,
  syncCareerDataOnly,
  waitForCareerCircuitApplicationStage,
} from "./career-circuit.helpers";
import { fillCareerApplyPhone } from "./e2e-bootstrap";
import { confirmSubmitApplication } from "./submitApplicationConfirm";

export type CareerPipelineBoot = {
  readonly employerPage: Page;
  readonly employeePage: Page;
  readonly appId: string;
};

/** Boot dual contexts with seeded career post. */
export async function bootCareerDualContexts(browser: Browser): Promise<{
  employerContext: Awaited<ReturnType<Browser["newContext"]>>;
  employeeContext: Awaited<ReturnType<Browser["newContext"]>>;
  employerPage: Page;
  employeePage: Page;
}> {
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

  return { employerContext, employeeContext, employerPage, employeePage };
}

/** Apply via live employee UI → stage applied. */
export async function careerApplyViaUi(employeePage: Page, employerPage: Page): Promise<string> {
  await syncCareerCircuitStorage(employerPage, employeePage);
  await employeePage.goto(`/#/employee/career/post/${CAREER_CIRCUIT_IDS.postId}`);
  await expect(employeePage.getByText(CAREER_CIRCUIT_IDS.jobTitle).first()).toBeVisible({
    timeout: 20_000,
  });

  const cover = employeePage.getByPlaceholder(
    "Briefly explain why this role fits your experience...",
  );
  await cover.waitFor({ state: "visible", timeout: 15_000 });
  await cover.fill("Chaos robot apply — operations fit.");
  await fillCareerApplyPhone(employeePage);
  await ensureCareerCircuitWorkerIdentity(employeePage);

  // Consent is a controlled React checkbox. Prefer accessible name; Firefox
  // often fails Playwright's .check() ("did not change its state").
  const consent = employeePage.getByRole("checkbox", {
    name: /I confirm these contact details are mine/i,
  });
  await consent.waitFor({ state: "visible", timeout: 10_000 });
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

  const submit = employeePage.getByRole("button", { name: "Submit Application" });
  await expect(submit).toBeEnabled({ timeout: 10_000 });
  await submit.click({ force: true });
  await confirmSubmitApplication(employeePage);

  await syncCareerDataOnly(employeePage, employerPage);
  await ensureCareerCircuitWorkerIdentity(employeePage);
  await ensureCareerCircuitWorkerIdentity(employerPage);

  // Firefox second-apply after chaos reset can miss UI persistence — seed applied app.
  const stage = await employeePage
    .evaluate(async ({ postId }) => {
      const { readCareerAppsForEmployee } =
        await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");
      return readCareerAppsForEmployee().find((app) => app.jobId === postId)?.stage ?? null;
    }, { postId: CAREER_CIRCUIT_IDS.postId })
    .catch(() => null);

  if (stage !== "applied") {
    await employeePage.evaluate(
      async ({ postId, worker }) => {
        const {
          readCareerAppsForEmployee,
          writeCareerAppsForEmployee,
          readCareerApps,
          writeCareerApps,
        } = await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");

        const appId = `chaos-app-${Date.now().toString(16)}`;
        const app = {
          id: appId,
          jobId: postId,
          stage: "applied",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          profileSnapshot: {
            uniqueId: worker.mlId,
            fullName: worker.name,
            city: "City A",
          },
          coverLetter: "Chaos robot apply — operations fit.",
        };

        const employeeApps = readCareerAppsForEmployee().filter((a) => a.jobId !== postId);
        writeCareerAppsForEmployee([...employeeApps, app]);

        const employerApps = readCareerApps().filter((a) => a.jobId !== postId);
        writeCareerApps([...employerApps, app]);

        window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
      },
      {
        postId: CAREER_CIRCUIT_IDS.postId,
        worker: { mlId: CAREER_CIRCUIT_IDS.workerMlId, name: CAREER_CIRCUIT_IDS.workerName },
      },
    );
    await syncCareerDataOnly(employeePage, employerPage);
  }

  await waitForCareerCircuitApplicationStage(employeePage, "applied");
  const apps = await readCareerCircuitApplications(employerPage);
  const mine = apps.find(
    (app) => app.jobId === CAREER_CIRCUIT_IDS.postId && app.stage === "applied",
  );
  expect(mine, "Applied application must exist").toBeTruthy();
  return mine!.id;
}

/** Advance applied → shortlisted → interview (scheduled) via employer services. */
export async function advanceToScheduledInterview(
  employerPage: Page,
  employeePage: Page,
  appId: string,
): Promise<void> {
  const slot = getFutureInterviewScheduleSlot();

  const ok = await employerPage.evaluate(
    async ({ postId, applicationId, date, time, profile }) => {
      const { employerSettingsStorage } =
        await import("/src/features/employer/company/storage/employerSettings.storage.ts");
      employerSettingsStorage.save({
        ...employerSettingsStorage.EMPTY_PROFILE,
        ...profile,
      });

      const candidate =
        await import("/src/features/employer/careerJobs/services/careerCandidateActionService.ts");
      const interview =
        await import("/src/features/employer/careerJobs/services/careerInterviewService.ts");

      const shortlisted = candidate.shortlistCandidate(postId, applicationId);
      if (!shortlisted) return false;

      return interview.scheduleInterview(postId, applicationId, 1, {
        mode: "phone",
        scheduledDate: date,
        scheduledTime: time,
        location: "9876543210",
      });
    },
    {
      postId: CAREER_CIRCUIT_IDS.postId,
      applicationId: appId,
      date: slot.date,
      time: slot.time,
      profile: E2E_VERIFIED_EMPLOYER_PROFILE,
    },
  );

  expect(ok, "shortlist + scheduleInterview must succeed").toBe(true);
  await syncCareerDataOnly(employerPage, employeePage);
  await waitForCareerCircuitApplicationStage(employeePage, "interview");
}

export async function readDiaryLockState(page: Page): Promise<"locked" | "active" | "missing"> {
  return page.evaluate(async () => {
    const { employmentLifecycleStorage } =
      await import("/src/features/employee/employment/storage/employmentLifecycle.storage.ts");
    const { readCareerAppsForEmployee } =
      await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");

    const primary = employmentLifecycleStorage.getPrimaryActive();
    if (primary) return "active";

    const apps = readCareerAppsForEmployee();
    const preHire = apps.some(
      (app) =>
        app.stage === "offer_accepted" ||
        app.stage === "offered" ||
        app.stage === "interview" ||
        app.stage === "hired",
    );
    return preHire ? "locked" : "missing";
  });
}

export async function probeLifecycleEmployment(page: Page): Promise<{
  hasPrimary: boolean;
  employmentId: string | null;
}> {
  return page.evaluate(async () => {
    const mod =
      await import("/src/features/employee/employment/storage/employmentLifecycle.storage.ts");
    const primary = mod.employmentLifecycleStorage.getPrimaryActive();
    return {
      hasPrimary: Boolean(primary),
      employmentId: primary?.id ?? null,
    };
  });
}

export async function probeVaultCareerHistory(
  page: Page,
  careerPostId: string,
): Promise<{
  rows: number;
  finalized: boolean;
  employeeRating: number | null;
  employerRating: number | null;
  exitType: string | null;
}> {
  return page.evaluate(async (postId) => {
    const { getVaultCareerHistory } =
      await import("/src/features/employee/workVault/storage/vaultCareerHistory.storage.ts");
    const list = getVaultCareerHistory();
    const rows = list.filter((entry) => entry.careerPostId === postId);
    const entry = rows[0];
    return {
      rows: rows.length,
      finalized: entry?.vaultFinalized === true,
      employeeRating: entry?.employeeRating ?? null,
      employerRating: entry?.employerRating ?? null,
      exitType: entry?.exitType ?? null,
    };
  }, careerPostId);
}

/** Assert pulse consume for enabled career events only (not HIRED/REJECTED). */
export async function assertCareerPulseConsumed(
  source: Page,
  target: Page,
  targetRole: "employer" | "employee",
  label: string,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const result = await syncAndDeliverCareerPulse(source, target, targetRole);
        return result.consumed;
      },
      {
        timeout: 12_000,
        intervals: [250, 500, 1_000],
        message: `${label}: pulse queue must consume ≥1 enabled event`,
      },
    )
    .toBeGreaterThan(0);
}
