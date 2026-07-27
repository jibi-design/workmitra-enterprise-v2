import type { Browser, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  CAREER_CIRCUIT_IDS,
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
  await employeePage.getByPlaceholder("Enter your phone number").fill("9876543210");

  const consent = employeePage.getByRole("checkbox").first();
  await consent.waitFor({ state: "visible", timeout: 10_000 });
  await consent.check({ force: true });

  const submit = employeePage.getByRole("button", { name: "Submit Application" });
  await expect(submit).toBeEnabled({ timeout: 10_000 });
  await submit.click({ force: true });

  await syncCareerDataOnly(employeePage, employerPage);
  await ensureCareerCircuitWorkerIdentity(employeePage);
  await ensureCareerCircuitWorkerIdentity(employerPage);

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
    async ({ postId, applicationId, date, time }) => {
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
    },
  );

  expect(ok, "shortlist + scheduleInterview must succeed").toBe(true);
  await syncCareerDataOnly(employerPage, employeePage);
  await waitForCareerCircuitApplicationStage(employeePage, "interview");
}

export async function readDiaryLockState(page: Page): Promise<"locked" | "active" | "missing"> {
  await page.goto("/#/employee");
  const card = page.locator("[data-diary-state]");
  if ((await card.count()) === 0) return "missing";
  const state = await card.first().getAttribute("data-diary-state");
  if (state === "active" || state === "locked") return state;
  return "missing";
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
  return page.evaluate((postId) => {
    const raw = localStorage.getItem("wm_vault_career_history_v1") ?? "[]";
    const list = JSON.parse(raw) as Array<{
      careerPostId?: string;
      vaultFinalized?: boolean;
      employeeRating?: number | null;
      employerRating?: number | null;
      exitType?: string;
    }>;
    const rows = list.filter((e) => e.careerPostId === postId);
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
