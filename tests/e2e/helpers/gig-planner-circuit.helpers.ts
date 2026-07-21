import { expect, type Page } from "@playwright/test";

/** Deterministic IDs for the Gig Projects (Teal) circuit */
export const GIG_CIRCUIT_IDS = {
  planName: "Lulu Mall Security",
  companyName: "Teal Circuit Security Co",
  locationName: "Lulu Mall, Kochi",
  category: "Security",
  payPerDay: 800,
  workerMlId: "ML-E2E2-GGG-PLAN",
  workerName: "Gig Circuit Worker",
  conflictPostId: "e2e-gig-conflict-post-001",
  conflictAppId: "e2e-gig-conflict-app-001",
  conflictWorkspaceId: "e2e-gig-conflict-ws-001",
  conflictJobName: "Regular Mall Patrol",
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
    ({ sessionRole, splashKey, bootKey, profile, gigKeys }) => {
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
    },
    {
      sessionRole: role,
      splashKey: SPLASH_SESSION_KEY,
      bootKey: GIG_CIRCUIT_BOOT_KEY,
      gigKeys: GIG_CIRCUIT_SHARED_KEYS,
      profile:
        role === "employee"
          ? {
              uniqueId: GIG_CIRCUIT_IDS.workerMlId,
              fullName: GIG_CIRCUIT_IDS.workerName,
              city: "Kochi",
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
    ({ worker }) => {
      localStorage.setItem(
        "wm_employee_profile_v1",
        JSON.stringify({
          uniqueId: worker.mlId,
          fullName: worker.name,
          city: "Kochi",
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
        }),
      );
    },
    { worker: { mlId: GIG_CIRCUIT_IDS.workerMlId, name: GIG_CIRCUIT_IDS.workerName } },
  );
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
}

export async function publishGigPlanViaEmployerUi(employerPage: Page): Promise<void> {
  const { startDate, endDate } = getGigCircuitPlanDates();

  await employerPage.goto("/#/employer/planner/new");
  await expect(employerPage.getByText("Step 1 of 3 — Role & Team")).toBeVisible();

  await employerPage.getByPlaceholder("e.g. Mall Crew July").fill(GIG_CIRCUIT_IDS.planName);
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

  await employerPage.getByRole("button", { name: "Next: Review & Publish →" }).click();

  await expect(employerPage.getByText("Day 1")).toBeVisible({ timeout: 10_000 });

  const slotPayInput = employerPage
    .locator('label:has-text("Pay/day")')
    .first()
    .locator("..")
    .locator('input[type="number"]');
  await slotPayInput.fill(String(GIG_CIRCUIT_IDS.payPerDay));
  await employerPage.getByRole("button", { name: "Copy first day to all" }).click();

  await employerPage.getByRole("button", { name: "Next: Review & Publish →" }).click();
  await expect(employerPage.getByText("Step 3 of 3 — Review & Publish")).toBeVisible();

  await employerPage.getByRole("button", { name: /Publish — \d+ day plan/ }).click();
  await expect(employerPage).toHaveURL(/\/#\/employer\/planner\/plans\//, { timeout: 20_000 });
  await expect(employerPage.getByText(GIG_CIRCUIT_IDS.planName)).toBeVisible();
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
    ({ ids, dateKey, worker }) => {
      const posts = JSON.parse(localStorage.getItem("wm_employer_shift_posts_v1") ?? "[]") as Array<
        Record<string, unknown>
      >;
      const apps = JSON.parse(
        localStorage.getItem("wm_employee_shift_applications_v1") ?? "[]",
      ) as Array<Record<string, unknown>>;
      const workspaces = JSON.parse(
        localStorage.getItem("wm_employee_shift_workspaces_v1") ?? "[]",
      ) as Array<Record<string, unknown>>;

      const startAt = new Date(`${dateKey}T09:00:00`).getTime();
      const endAt = new Date(`${dateKey}T18:00:00`).getTime();

      posts.push({
        id: ids.conflictPostId,
        companyName: ids.conflictCompanyName,
        jobName: ids.conflictJobName,
        category: "Security",
        experience: "helper",
        payPerDay: 750,
        payBasis: "per_day",
        locationName: "Lulu Mall, Kochi",
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
      });

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
          city: "Kochi",
          experience: "helper",
          skills: ["security"],
        },
      });

      workspaces.push({
        id: ids.conflictWorkspaceId,
        postId: ids.conflictPostId,
        appId: ids.conflictAppId,
        workerMlId: worker.mlId,
        workerName: worker.name,
        companyName: ids.conflictCompanyName,
        jobName: ids.conflictJobName,
        category: "other",
        locationName: "Lulu Mall, Kochi",
        startAt,
        endAt,
        status: "upcoming",
        lastActivityAt: Date.now(),
        unreadCount: 0,
        updates: [],
      });

      localStorage.setItem("wm_employer_shift_posts_v1", JSON.stringify(posts));
      localStorage.setItem("wm_employee_shift_applications_v1", JSON.stringify(apps));
      localStorage.setItem("wm_employee_shift_workspaces_v1", JSON.stringify(workspaces));

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

export async function gotoEmployeeShiftSearch(employeePage: Page): Promise<void> {
  await employeePage.goto("/#/employee/shift/search");
  await expect(employeePage.getByRole("heading", { name: "Find Shifts" })).toBeVisible();
  await expect(employeePage.getByText("Mega Project Cards")).toBeVisible();
}
