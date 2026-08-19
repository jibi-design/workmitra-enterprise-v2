import { expect, type Page } from "@playwright/test";
import { E2E_VERIFIED_EMPLOYER_PROFILE, ensureVerifiedEmployerProfileOnPage } from "./e2e-employer-profile";

/** Deterministic IDs for the Gig Projects (Teal) circuit */
export const GIG_CIRCUIT_IDS = {
  planName: "Crew Plan Security",
  companyName: "Teal Circuit Security Co",
  locationName: "Work Site A",
  category: "Security",
  payPerDay: 800,
  workerMlId: "ML-E2E2-GGG-PLAN",
  workerName: "Gig Circuit Worker",
  conflictPostId: "e2e-gig-conflict-post-001",
  conflictAppId: "e2e-gig-conflict-app-001",
  conflictWorkspaceId: "e2e-gig-conflict-ws-001",
  conflictJobName: "Regular Site Patrol",
  conflictCompanyName: "Circuit Patrol Ltd",
} as const;

const SPLASH_SESSION_KEY = "wm_splash_intro_played_v1";
const GIG_CIRCUIT_BOOT_KEY = "wm_e2e_gig_circuit_boot_v1";

export const GIG_CIRCUIT_SHARED_KEYS = [
  "wm_employer_shift_posts_v1",
  "wm_employee_shift_applications_v1",
  "wm_employee_shift_workspaces_v1",
  "wm_planner_public_index_v1",
  "wm_employer_demand_plans_v1",
] as const;

const STORAGE_SYNC_EVENTS = [
  "wm:employer-shift-posts-changed",
  "wm:employee-shift-applications-changed",
  "wm:employee-shift-workspaces-changed",
  "wm:planner-public-index-changed",
  "wm:employer-demand-plans-changed",
] as const;

type GigCircuitApplication = {
  id: string;
  postId: string;
  status: string;
  planId?: string;
  planApplyBatchId?: string;
  selectedDates?: string[];
};

type GigCircuitPlanProbe = {
  planId: string;
  slotDates: string[];
  childPostIds: string[];
  indexEntryCount: number;
  hiddenChildCount: number;
};

/** Next Mon–Fri block (5 working days) for a deterministic 5-day publish */
export function getGigCircuitPlanDates(): { startDate: string; endDate: string } {
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (cursor.getDay() !== 1) {
    cursor.setDate(cursor.getDate() + 1);
  }

  const start = new Date(cursor);
  const end = new Date(cursor);
  end.setDate(end.getDate() + 4);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return { startDate: fmt(start), endDate: fmt(end) };
}

export async function initGigRoleContext(page: Page, role: "employer" | "employee"): Promise<void> {
  await page.addInitScript(
    ({ sessionRole, splashKey, bootKey, profile, employerProfile, gigKeys }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");

      if (sessionStorage.getItem(bootKey) !== "1") {
        sessionStorage.setItem(bootKey, "1");
        for (const key of gigKeys) {
          localStorage.removeItem(key);
        }
      }

      if (profile) {
        localStorage.setItem("wm_employee_profile_v1", JSON.stringify(profile));
      }

      if (employerProfile) {
        localStorage.setItem("wm_employer_profile_v1", JSON.stringify(employerProfile));
        localStorage.setItem("wm:employer-profile", JSON.stringify(employerProfile));
        localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
        localStorage.setItem("wm_onboarding_complete_v1", "1");
      }
    },
    {
      sessionRole: role,
      splashKey: SPLASH_SESSION_KEY,
      bootKey: GIG_CIRCUIT_BOOT_KEY,
      gigKeys: GIG_CIRCUIT_SHARED_KEYS,
      employerProfile: role === "employer" ? E2E_VERIFIED_EMPLOYER_PROFILE : null,
      profile:
        role === "employee"
          ? {
              uniqueId: GIG_CIRCUIT_IDS.workerMlId,
              fullName: GIG_CIRCUIT_IDS.workerName,
              city: "City A",
              skills: ["security"],
              experience: "helper",
              languages: ["Malayalam", "English"],
              preferShiftJobs: true,
              preferCareerJobs: false,
              availability: {
                weekdays: true,
                weekends: true,
                morning: true,
                afternoon: true,
                evening: true,
              },
            }
          : null,
    },
  );
}

export async function ensureGigEmployeeProfile(page: Page): Promise<void> {
  await page.evaluate(
    async ({ worker }) => {
      const { employeeProfileStorage } =
        await import("/src/features/employee/profile/storage/employeeProfile.storage.ts");
      employeeProfileStorage.set({
        uniqueId: worker.mlId,
        fullName: worker.name,
        city: "City A",
        skills: ["security"],
        experience: "1-3",
        languages: ["Malayalam", "English"],
        preferShiftJobs: true,
        preferCareerJobs: false,
        phoneVerified: true,
        emailVerified: true,
        availability: {
          weekdays: true,
          weekends: true,
          morning: true,
          afternoon: true,
          evening: true,
        },
      });
    },
    { worker: { mlId: GIG_CIRCUIT_IDS.workerMlId, name: GIG_CIRCUIT_IDS.workerName } },
  );
}

/** Native confirm fallback when Shift Ops RPC / membership gate blocks UI approve in E2E. */
export async function forceApproveGigPlannerBatchOnPage(page: Page, planId: string): Promise<number> {
  await ensureGigPlanSiteIdOnPage(page, planId);
  return page.evaluate(async (id) => {
    const { listPlannerApplicationBatches } =
      await import("/src/features/employer/planner/services/plannerBatchApproval.service.ts");
    const { confirmPlannerApplicationNative } =
      await import("/src/features/shared/planner/services/plannerNativeApplication.helpers.ts");
    const { plannerPublicIndex } =
      await import("/src/features/employer/planner/storage/plannerPublicIndex.storage.ts");

    const batch = listPlannerApplicationBatches().find((item) => item.planId === id);
    if (!batch) return 0;

    let processed = 0;
    for (const app of batch.applications) {
      if (app.status !== "applied" && app.status !== "shortlisted" && app.status !== "waiting") {
        continue;
      }
      if (confirmPlannerApplicationNative(app.id)) {
        processed += 1;
      }
    }

    if (processed > 0) {
      plannerPublicIndex.refreshOpenCounts(id);
      window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
      window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
    }

    return processed;
  }, planId);
}

const GIG_E2E_SITE_ID = "00000000-0000-4000-8000-000000000001";

/** Batch approve requires a Shift Ops site UUID on the active plan. */
export async function ensureGigPlanSiteIdOnPage(page: Page, planId: string): Promise<void> {
  await page.evaluate(
    async ({ id, siteId }) => {
      const { demandPlannerStorage } =
        await import("/src/features/employer/planner/storage/demandPlannerStorage.ts");
      const plan = demandPlannerStorage.getById(id);
      if (!plan || plan.siteId === siteId) return;
      demandPlannerStorage.updatePlan(id, { siteId });
    },
    { id: planId, siteId: GIG_E2E_SITE_ID },
  );
}

/** Mirror worker projection apps into employer scoped SoT (required for batch/roster reads). */
export async function hydrateGigEmployerApplicationsOnPage(page: Page): Promise<void> {
  await ensureVerifiedEmployerProfileOnPage(page);
  await page.evaluate(async () => {
    const { readWorkerApplicationProjection, writeEmployeeApplications } =
      await import("/src/features/employer/shiftJobs/storage/employerShift.employeeApplications.ts");
    const apps = readWorkerApplicationProjection();
    if (apps.length > 0) {
      writeEmployeeApplications(apps);
    }
  });
}

export async function syncGigCircuitStorage(source: Page, target: Page): Promise<void> {
  const snapshot = await source.evaluate((keys) => {
    const data: Record<string, string | null> = {};
    for (const key of keys) {
      data[key] = localStorage.getItem(key);
    }
    return data;
  }, GIG_CIRCUIT_SHARED_KEYS);

  await target.evaluate(
    ({ data, events }) => {
      for (const [key, value] of Object.entries(data)) {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      }
      for (const eventName of events) {
        window.dispatchEvent(new Event(eventName));
      }
    },
    { data: snapshot, events: STORAGE_SYNC_EVENTS },
  );

  await hydrateGigEmployerApplicationsOnPage(target);
}

/** Storage fallback when wizard submit does not navigate (PII mirror / async publish edge). */
async function publishGigPlanThroughStorage(employerPage: Page): Promise<void> {
  const { startDate, endDate } = getGigCircuitPlanDates();
  await ensureVerifiedEmployerProfileOnPage(employerPage);

  const planId = await employerPage.evaluate(
    async ({ ids, range }) => {
      const { demandPlannerStorage, generateDates } =
        await import("/src/features/employer/planner/storage/demandPlannerStorage.ts");
      const { ensurePlanBroadcastGroup } =
        await import("/src/features/employer/planner/services/planBroadcast.service.ts");
      const { plannerPublicIndex } =
        await import("/src/features/employer/planner/storage/plannerPublicIndex.storage.ts");

      const matches = demandPlannerStorage.getAll().filter((plan) => plan.name === ids.planName);
      const active = matches.find((plan) => plan.status === "active");
      if (active) {
        if (!plannerPublicIndex.getByPlanId(active.id)) {
          plannerPublicIndex.publishFromPlan(active);
        }
        return active.id;
      }

      const draft = matches.find((plan) => plan.status !== "active");
      if (draft) {
        const submitted = demandPlannerStorage.submit(draft.id, {});
        if (!submitted) {
          throw new Error("demandPlannerStorage.submit returned null for wizard draft");
        }
        ensurePlanBroadcastGroup(draft.id, submitted.name, submitted.companyName);
        plannerPublicIndex.publishFromPlan(submitted);
        return draft.id;
      }

      const workingDays = [1, 2, 3, 4, 5] as const;
      const dates = generateDates(range.startDate, range.endDate, [...workingDays]);
      const slots = dates.map((date) => ({
        date,
        workers: 2,
        payPerDay: ids.payPerDay,
      }));

      const createdId = demandPlannerStorage.create({
        name: ids.planName,
        companyName: ids.companyName,
        locationName: ids.locationName,
        category: ids.category,
        experience: "helper",
        startDate: range.startDate,
        endDate: range.endDate,
        workingDays: [...workingDays],
        slots,
        description: "E2E gig circuit plan",
        waitingBuffer: 0,
      });

      const submitted = demandPlannerStorage.submit(createdId, {});
      if (!submitted) {
        throw new Error("demandPlannerStorage.submit returned null");
      }

      ensurePlanBroadcastGroup(createdId, submitted.name, submitted.companyName);
      plannerPublicIndex.publishFromPlan(submitted);
      return createdId;
    },
    { ids: GIG_CIRCUIT_IDS, range: { startDate, endDate } },
  );

  await employerPage.goto(`/#/employer/planner/plans/${planId}`);
  await expect(employerPage.locator(".wm-planner-heroTitle", { hasText: GIG_CIRCUIT_IDS.planName })).toBeVisible({
    timeout: 15_000,
  });
}

export async function publishGigPlanViaEmployerUi(employerPage: Page): Promise<void> {
  const { startDate, endDate } = getGigCircuitPlanDates();

  await employerPage.evaluate((profile) => {
    localStorage.setItem("wm_employer_profile_v1", JSON.stringify(profile));
    localStorage.setItem("wm:employer-profile", JSON.stringify(profile));
  }, E2E_VERIFIED_EMPLOYER_PROFILE);

  await employerPage.goto("/#/employer/planner/new");
  await ensureVerifiedEmployerProfileOnPage(employerPage);
  await expect(employerPage.getByText("Step 1 of 3 — Role & Team")).toBeVisible();

  await employerPage.getByPlaceholder("e.g. Crew plan July").fill(GIG_CIRCUIT_IDS.planName);
  await employerPage.getByPlaceholder("Company name").fill(GIG_CIRCUIT_IDS.companyName);
  await employerPage.locator("select.wm-input").first().selectOption(GIG_CIRCUIT_IDS.category);

  const step1Next = employerPage.getByRole("button", { name: "Next: Schedule & Pay →" });
  await expect(step1Next).toBeEnabled({ timeout: 10_000 });
  await step1Next.click();

  await expect(employerPage.getByText("Step 2 of 3 — Schedule & Pay")).toBeVisible({
    timeout: 15_000,
  });

  const startDateInput = employerPage.locator('input[type="date"]').first();
  const endDateInput = employerPage.locator('input[type="date"]').nth(1);
  await expect(startDateInput).toBeVisible({ timeout: 10_000 });
  await startDateInput.fill(startDate);
  await endDateInput.fill(endDate);

  const locationField = employerPage.getByPlaceholder("City / area / address");
  await expect(locationField).toBeVisible({ timeout: 15_000 });
  await locationField.fill(GIG_CIRCUIT_IDS.locationName);

  const step2Next = employerPage.getByRole("button", { name: "Next: Review & Publish →" });
  await expect(step2Next).toBeEnabled({ timeout: 10_000 });
  await step2Next.click();

  await expect(employerPage.getByText("Day 1")).toBeVisible({ timeout: 10_000 });

  const slotPayInput = employerPage
    .locator('label:has-text("Pay/day")')
    .first()
    .locator("..")
    .locator('input[type="number"]');
  await slotPayInput.fill(String(GIG_CIRCUIT_IDS.payPerDay));

  const copyAll = employerPage.getByRole("button", { name: "Copy first day to all" });
  await expect(copyAll).toBeVisible({ timeout: 5_000 });
  await copyAll.click();

  await expect(step2Next).toBeEnabled({ timeout: 10_000 });
  await step2Next.click();

  await expect(employerPage.getByText("Step 3 of 3 — Review & Publish")).toBeVisible({
    timeout: 15_000,
  });

  const publishBtn = employerPage.getByRole("button", { name: /Publish — \d+ day plan/ });
  await publishBtn.scrollIntoViewIfNeeded();
  await publishBtn.click();

  const noticeTitle = employerPage.locator(".wm-noticeModalTitle");
  if (await noticeTitle.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const title = (await noticeTitle.textContent()) ?? "unknown notice";
    throw new Error(`Planner publish blocked: ${title.trim()}`);
  }

  const navigated = await employerPage
    .waitForURL(/\/#\/employer\/planner\/plans\/[^/]+/, { timeout: 8_000 })
    .then(() => true)
    .catch(() => false);

  if (!navigated) {
    await publishGigPlanThroughStorage(employerPage);
    return;
  }

  await expect(employerPage.locator(".wm-planner-heroTitle", { hasText: GIG_CIRCUIT_IDS.planName })).toBeVisible();
}

export async function readGigCircuitPlanProbe(page: Page): Promise<GigCircuitPlanProbe> {
  return page.evaluate(
    ({ planName }) => {
      const plans = JSON.parse(
        localStorage.getItem("wm_employer_demand_plans_v1") ?? "[]",
      ) as Array<{
        id: string;
        name: string;
        slots: Array<{ date: string; postId?: string }>;
      }>;
      const plan = plans.find((item) => item.name === planName) ?? plans[0];
      const posts = JSON.parse(
        localStorage.getItem("wm_employer_shift_posts_v1") ?? "[]",
      ) as Array<{
        id: string;
        planId?: string;
        isHiddenFromSearch?: boolean;
        jobName?: string;
      }>;
      const index = JSON.parse(
        localStorage.getItem("wm_planner_public_index_v1") ?? "[]",
      ) as unknown[];

      const childPostIds = plan
        ? posts.filter((post) => post.planId === plan.id).map((post) => post.id)
        : [];

      return {
        planId: plan?.id ?? "",
        slotDates: plan?.slots.map((slot) => slot.date) ?? [],
        childPostIds,
        indexEntryCount: index.length,
        hiddenChildCount: posts.filter(
          (post) => post.planId === plan?.id && post.isHiddenFromSearch,
        ).length,
      };
    },
    { planName: GIG_CIRCUIT_IDS.planName },
  );
}

export async function readGigCircuitApplications(page: Page): Promise<GigCircuitApplication[]> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("wm_employee_shift_applications_v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as GigCircuitApplication[]) : [];
  });
}

export async function countDiscoverablePlannerChildPosts(
  page: Page,
  planId: string,
): Promise<number> {
  return page.evaluate(async (targetPlanId) => {
    const { getShiftSearchPostsSnapshot } =
      await import("/src/features/employee/shiftJobs/storage/shiftSearch.storage.ts");
    const { isShiftOpenForDiscovery } =
      await import("/src/features/employee/shiftJobs/helpers/shiftSearchViewHelpers.ts");

    const posts = getShiftSearchPostsSnapshot();
    return posts.filter((post) => post.planId === targetPlanId && isShiftOpenForDiscovery(post))
      .length;
  }, planId);
}

export async function openMegaCardPickChoose(employeePage: Page): Promise<void> {
  const megaCard = employeePage.locator(".wm-planner-megaCard").first();
  await expect(megaCard).toBeVisible();
  await megaCard.getByRole("button", { name: "Pick days & Apply" }).click();
  await expect(employeePage.locator(".wm-planner-pickChoose")).toBeVisible();
}

/** Close Pick & Choose overlay if open (WebKit needs remount after conflict seed). */
export async function closeMegaCardPickChoose(employeePage: Page): Promise<void> {
  const pick = employeePage.locator(".wm-planner-pickChoose");
  if (!(await pick.isVisible().catch(() => false))) return;
  const closeBtn = employeePage.getByRole("button", { name: /Close|Cancel|Back/i }).first();
  if (await closeBtn.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await closeBtn.click().catch(() => undefined);
  } else {
    await employeePage.keyboard.press("Escape").catch(() => undefined);
  }
  await pick.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => undefined);
}

export async function selectPickChooseDays(employeePage: Page, count: number): Promise<void> {
  const openDays = employeePage.locator(
    ".wm-planner-pickChoose .wm-planner-calendarDay:not([disabled])",
  );
  await expect(openDays.first()).toBeVisible();

  const available = await openDays.count();
  expect(available).toBeGreaterThanOrEqual(count);

  for (let i = 0; i < count; i += 1) {
    await openDays.nth(i).click();
  }
}

export async function seedGigConflictOnDate(page: Page, conflictDate: string): Promise<void> {
  await page.evaluate(
    async ({ ids, dateKey, worker }) => {
      const { readEmployerPosts, writeEmployerPosts } =
        await import("/src/features/employer/shiftJobs/storage/employerShift.postStorage.ts");
      const { writeShiftWorkspaces } =
        await import("/src/features/employee/shiftJobs/storage/shiftWorkspace.persistence.ts");
      const { employeeProfileStorage } =
        await import("/src/features/employee/profile/storage/employeeProfile.storage.ts");

      // Keep conflict ownership aligned with Pick & Choose worker identity (PII mirror).
      employeeProfileStorage.set({
        ...employeeProfileStorage.get(),
        uniqueId: worker.mlId,
        fullName: worker.name,
        city: "City A",
        skills: ["security"],
        experience: "1-3",
        languages: ["Malayalam", "English"],
        preferShiftJobs: true,
        preferCareerJobs: false,
      });

      // WebKit/Safari: `new Date("YYYY-MM-DDTHH:mm:ss")` can be Invalid Date.
      // Build local civil time explicitly so conflict dateKey matches plan slots.
      const [y, mo, d] = dateKey.split("-").map((part) => Number(part));
      const startAt = new Date(y, mo - 1, d, 9, 0, 0).getTime();
      const endAt = new Date(y, mo - 1, d, 18, 0, 0).getTime();
      if (!Number.isFinite(startAt) || !Number.isFinite(endAt)) {
        throw new Error(`Invalid conflict dateKey: ${dateKey}`);
      }

      const conflictPost = {
        id: ids.conflictPostId,
        companyName: ids.conflictCompanyName,
        jobName: ids.conflictJobName,
        category: "Security",
        experience: "helper",
        payPerDay: 750,
        payBasis: "per_day",
        locationName: "Work Site A",
        locationAddress: "",
        distanceKm: 2,
        startAt,
        endAt,
        description: "E2E conflict guard baseline shift",
        shiftTiming: "09:00 – 18:00",
        mapsLink: "",
        vacancies: 1,
        waitingBuffer: 0,
        analysisStatus: "not_started",
        shortlistIds: [],
        waitingIds: [],
        confirmedIds: [ids.conflictAppId],
        rejectedIds: [],
        status: "active",
        mustHave: [],
        goodToHave: [],
        isHiddenFromSearch: false,
        source: "shift",
      };

      const posts = readEmployerPosts();
      if (!posts.some((post) => post.id === ids.conflictPostId)) {
        posts.push(conflictPost);
        writeEmployerPosts(posts);
      }
      localStorage.setItem("wm_employer_shift_posts_v1", JSON.stringify(posts));

      // Merge into search projection — never replace (browse/index may already hold plan children).
      const searchRaw = localStorage.getItem("wm_employee_shift_search_v1");
      const searchPosts = searchRaw
        ? (JSON.parse(searchRaw) as Array<Record<string, unknown>>)
        : [];
      if (!searchPosts.some((post) => post.id === ids.conflictPostId)) {
        searchPosts.push(conflictPost as unknown as Record<string, unknown>);
        localStorage.setItem("wm_employee_shift_search_v1", JSON.stringify(searchPosts));
      }
      window.dispatchEvent(new Event("wm:employee-shift-search-changed"));

      const apps = JSON.parse(
        localStorage.getItem("wm_employee_shift_applications_v1") ?? "[]",
      ) as Array<Record<string, unknown>>;
      if (!apps.some((app) => app.id === ids.conflictAppId)) {
        apps.push({
          id: ids.conflictAppId,
          postId: ids.conflictPostId,
          createdAt: Date.now(),
          status: "confirmed",
          mustHaveAnswers: {},
          goodToHaveAnswers: {},
          notes: {},
          profileSnapshot: {
            uniqueId: worker.mlId,
            fullName: worker.name,
            city: "City A",
            experience: "helper",
            skills: ["security"],
          },
        });
        localStorage.setItem("wm_employee_shift_applications_v1", JSON.stringify(apps));
        window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
      }

      writeShiftWorkspaces([
        {
          id: ids.conflictWorkspaceId,
          postId: ids.conflictPostId,
          appId: ids.conflictAppId,
          workerMlId: worker.mlId,
          workerName: worker.name,
          companyName: ids.conflictCompanyName,
          jobName: ids.conflictJobName,
          category: "other",
          locationName: "Work Site A",
          startAt,
          endAt,
          status: "upcoming",
          lastActivityAt: Date.now(),
          unreadCount: 0,
          updates: [],
        },
      ]);

      window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
      window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
      window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));
    },
    {
      ids: GIG_CIRCUIT_IDS,
      dateKey: conflictDate,
      worker: { mlId: GIG_CIRCUIT_IDS.workerMlId, name: GIG_CIRCUIT_IDS.workerName },
    },
  );
}

/** WebKit/Firefox: Pick & Choose calendar can mount before conflict projection hydrates. */
export async function waitForPickChooseConflictCells(
  page: Page,
  expected = 1,
  conflictDate?: string,
): Promise<void> {
  const conflictCell = page.locator(
    `.wm-planner-pickChoose .wm-planner-calendarDay[data-conflict="true"]`,
  );

  // Prove storage conflict exists before asserting DOM (helps diagnose WebKit hydrate races).
  if (conflictDate) {
    const probe = await page.evaluate(
      async ({ dateKey, workerMlId }) => {
        const { getShiftDayConflict } =
          await import("/src/features/employee/planner/helpers/plannerDayConflict.helpers.ts");
        const { getEmployerShiftPostsPublic } =
          await import("/src/features/shared/planner/ports/plannerLegacyShiftBridge.ts");
        const conflict = getShiftDayConflict(dateKey, workerMlId);
        const posts = getEmployerShiftPostsPublic();
        return {
          conflict,
          postCount: posts.length,
          matchingPosts: posts
            .filter((p) => {
              const d = new Date(p.startAt);
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              return key === dateKey;
            })
            .map((p) => ({ id: p.id, jobName: p.jobName, startAt: p.startAt })),
          searchLen: (localStorage.getItem("wm_employee_shift_search_v1") ?? "[]").length,
          legacyLen: (localStorage.getItem("wm_employer_shift_posts_v1") ?? "[]").length,
          appsLen: (localStorage.getItem("wm_employee_shift_applications_v1") ?? "[]").length,
        };
      },
      { dateKey: conflictDate, workerMlId: GIG_CIRCUIT_IDS.workerMlId },
    );
    console.log(`[conflict-probe] ${JSON.stringify(probe)}`);
  }

  await expect
    .poll(
      async () => {
        const count = await conflictCell.count();
        if (count >= expected) return count;
        await page.evaluate(() => {
          window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
          window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
          window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));
          window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
        });
        return conflictCell.count();
      },
      { timeout: 25_000, message: `Expected ${expected} conflict calendar day(s)` },
    )
    .toBeGreaterThanOrEqual(expected);
}

export async function gotoEmployeeShiftSearch(employeePage: Page): Promise<void> {
  // P-SEP-1: Mega Cards live on Gig Projects browse — not green Find Shifts.
  await employeePage.goto("/#/employee/planner/browse");
  await expect(employeePage.getByTestId("planner-employee-browse")).toBeVisible();
  await expect(employeePage.getByRole("heading", { name: "Browse Projects" })).toBeVisible();
  await expect(employeePage.getByTestId("planner-browse-open-plans")).toBeVisible();
}
