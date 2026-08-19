/**
 * Live Career: search → save (GET/POST /saved-jobs) → details → apply → shortlist.
 * Offer/hire UI is covered by career-full-circuit.spec.ts (interview gate required).
 */
import { expect, test, type Browser, type Page, type Response } from "@playwright/test";
import { signInAs, skipSplashAndSetRole, wipeBrowserState } from "./helpers/realUserCleanSlate";
import { completeEmployeeProfileViaUi, completeEmployerOnboarding } from "./helpers/realUserOnboarding";
import { fillCareerApplyPhone } from "./helpers/e2e-bootstrap";
import { confirmSubmitApplication } from "./helpers/submitApplicationConfirm";

const STAMP = Date.now().toString().slice(-6);
const JOB_TITLE = `Career Live Ops ${STAMP}`;
const ACTORS = {
  company: `Career Live Co ${STAMP}`,
  jobTitle: JOB_TITLE,
  workerName: `Alex Career ${STAMP}`,
  workArea: "100001",
};

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1280, height: 900 } });

function isSavedJobsApi(url: string): boolean {
  return url.includes("/v1/jobmitra/employee/career/saved-jobs");
}

async function openCleanPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await wipeBrowserState(page);
  return page;
}

async function createLiveCareerPost(page: Page): Promise<{ localId: string; serverId: string | null }> {
  const result = await page.evaluate(async (input) => {
    const { getCurrentEmployerMlId } = await import(
      "/src/features/employer/company/helpers/employerPublicIdentity.ts"
    );
    const { createCareerPost, getDefaultRepostClosingDate } = await import(
      "/src/features/employer/careerJobs/services/careerPostService.create.ts"
    );
    const { careerPostIdBridge } = await import("/src/features/career/utils/careerPostIdBridge.ts");
    const localId = await createCareerPost({
      employerId: getCurrentEmployerMlId(),
      companyName: input.company,
      jobTitle: input.jobTitle,
      department: "Operations",
      jobType: "full-time",
      workMode: "on-site",
      location: "Harbor District",
      locationPincode: input.workArea,
      vacancies: 1,
      probationPeriod: "none",
      salaryMin: 28000,
      salaryMax: 36000,
      salaryPeriod: "monthly",
      noticePeriodDays: 0,
      experienceMin: 0,
      experienceMax: 3,
      qualifications: ["Graduate"],
      skills: ["Operations"],
      description: "Live career e2e post for search, save, and apply.",
      responsibilities: ["Coordinate daily operations"],
      interviewRounds: 1,
      roundConfigs: [{ round: 1, label: "Screening", mode: "phone" }],
      status: "active",
      closingDate: getDefaultRepostClosingDate(Date.now()),
    });
    if (!localId) return { localId: null, serverId: null };
    return {
      localId,
      serverId: careerPostIdBridge.resolveServerPostId(localId),
    };
  }, ACTORS);
  expect(result.localId, "createCareerPost must return an id").toBeTruthy();
  return { localId: result.localId as string, serverId: result.serverId };
}

async function seedEmployeeSearchIndex(
  page: Page,
  params: { postId: string; employerUserId?: string },
): Promise<void> {
  await page.evaluate(({ postId, employerUserId, actors }) => {
    const scope = employerUserId?.trim() || "e2e-career-live";
    const key = `wm_employer_${scope}_career_search_v1`;
    const searchPost = {
      id: postId,
      companyName: actors.company,
      jobTitle: actors.jobTitle,
      department: "Operations",
      jobType: "full-time",
      workMode: "on-site",
      location: "Harbor District",
      locationPincode: actors.workArea,
      salaryMin: 28000,
      salaryMax: 36000,
      salaryPeriod: "monthly",
      experienceMin: 0,
      experienceMax: 3,
      noticePeriodDays: 0,
      qualifications: ["Graduate"],
      skills: ["Operations"],
      description: "Live career e2e post for search, save, and apply.",
      responsibilities: ["Coordinate daily operations"],
      interviewRounds: 1,
      closingDate: Date.now() + 30 * 86_400_000,
      createdAt: Date.now(),
      employerId: scope,
    };
    localStorage.setItem(key, JSON.stringify([searchPost]));
    window.dispatchEvent(new Event("wm:employee-career-search-changed"));
  }, { ...params, actors: ACTORS });
}

test("Career live search, saved-jobs API, apply, shortlist", async ({ browser }) => {
  test.setTimeout(180_000);
  const savedHits: { method: string; status: number }[] = [];

  const employer = await openCleanPage(browser);
  const employee = await openCleanPage(browser);

  employee.on("request", (req) => {
    if (isSavedJobsApi(req.url())) {
      savedHits.push({ method: `${req.method()}:req`, status: 0 });
    }
  });
  employee.on("response", (res: Response) => {
    if (!isSavedJobsApi(res.url())) return;
    savedHits.push({ method: res.request().method(), status: res.status() });
  });

  await signInAs(employer, "employer@demo.jobmitra.app", "demo1234");
  await skipSplashAndSetRole(employer, "employer");
  await completeEmployerOnboarding(employer, ACTORS);
  const created = await createLiveCareerPost(employer);
  const postId = created.serverId ?? created.localId;
  expect(created.serverId, "Career post must sync a live server UUID").toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );

  await signInAs(employee, "employee@demo.jobmitra.app", "demo1234");
  await skipSplashAndSetRole(employee, "employee");
  await completeEmployeeProfileViaUi(employee, ACTORS);
  await seedEmployeeSearchIndex(employee, { postId, employerUserId: "e2e-career-live" });

  await employee.goto("/#/employee/career/search", { waitUntil: "domcontentloaded" });
  await employee.getByPlaceholder("Job title, skill, or company").fill(JOB_TITLE);
  await expect(employee.getByText(JOB_TITLE).first()).toBeVisible({ timeout: 20_000 });

  const saveBtn = employee.locator(`[data-testid="career-save-job"][data-post-id="${postId}"]`);
  await expect(saveBtn).toBeVisible({ timeout: 10_000 });
  await saveBtn.click();
  await employee.waitForTimeout(1200);
  const syncMeta = await employee.evaluate(async () => {
    const { isCareerApiSyncEnabled } = await import(
      "/src/features/career/services/careerGateApi.bridge.ts"
    );
    const { employeeCareerSavedJobsStorage } = await import(
      "/src/features/employee/careerJobs/storage/employeeCareerSavedJobs.storage.ts"
    );
    return {
      apiSync: isCareerApiSyncEnabled(),
      savedIds: employeeCareerSavedJobsStorage.getIds(),
    };
  });
  expect(
    savedHits.some((h) => h.method === "POST" && (h.status === 201 || h.status === 200)),
    `saved-jobs POST missing. sync=${JSON.stringify(syncMeta)} hits=${JSON.stringify(savedHits)}`,
  ).toBe(true);

  await employee.getByTestId("career-search-tab-saved").click();
  await expect(employee.getByText(JOB_TITLE).first()).toBeVisible({ timeout: 10_000 });

  await employee.reload({ waitUntil: "domcontentloaded" });
  await employee.getByTestId("career-search-tab-saved").click();
  await expect(employee.getByText(JOB_TITLE).first()).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => savedHits.some((h) => h.method === "GET" && h.status === 200)).toBe(true);

  await employee.getByRole("button", { name: /View details/i }).first().click();
  const cover = employee.getByPlaceholder("Briefly explain why this role fits your experience...");
  await expect(cover).toBeVisible({ timeout: 15_000 });
  await cover.fill("I am ready to join this operations team immediately.");
  await fillCareerApplyPhone(employee);
  const consent = employee.getByRole("checkbox", { name: /I confirm these contact details are mine/i });
  if (await consent.isVisible().catch(() => false) && !(await consent.isChecked())) {
    await consent.click({ force: true });
  }
  await employee.getByRole("button", { name: "Submit Application" }).click();
  await confirmSubmitApplication(employee);

  await employer.evaluate(async (localPostId) => {
    const { hydrateCareerApplicationsForPostFromServer } = await import(
      "/src/features/career/services/careerDbTruth.service.ts"
    );
    await hydrateCareerApplicationsForPostFromServer(localPostId);
  }, created.localId);

  await employer.goto(`/#/employer/career/post/${created.localId}`, { waitUntil: "domcontentloaded" });
  const appliedTab = employer.getByRole("button", { name: /^Applied/i });
  if (await appliedTab.isVisible().catch(() => false)) {
    await appliedTab.click();
  }
  const shortlist = employer.getByRole("button", { name: "Move to Shortlist", exact: true });
  await expect(shortlist).toBeVisible({ timeout: 25_000 });
  await shortlist.click();
  await expect(employer.getByRole("button", { name: "Schedule Interview", exact: true })).toBeVisible({
    timeout: 15_000,
  });
});
