import { expect, type Locator, type Page } from "@playwright/test";

/** Deterministic IDs for the Career Full Circuit baseline run */
export const CAREER_CIRCUIT_IDS = {
  postId: "e2e-career-circuit-post-001",
  companyName: "Circuit Professional Services",
  jobTitle: "Operations Executive",
  workerWmId: "WM-CAREER-CIRCUIT-001",
  workerName: "Circuit Professional",
} as const;

const SPLASH_SESSION_KEY = "wm_splash_intro_played_v1";
const CAREER_CIRCUIT_SEED_FLAG = "wm_e2e_career_circuit_seeded";

/** Domain data + pulse queue — safe to mirror across dual browser contexts */
export const CAREER_CIRCUIT_DATA_KEYS = [
  "wm_employer_career_posts_v1",
  "wm_employee_career_applications_v1",
  "wm_employee_career_posts_search_v1",
  "wm_employee_career_workspaces_v1",
  "wm:employer-profile",
  "wm_career_employment_v1",
  "wm_employment_lifecycle_v1",
  "wm_hr_management_v1",
  "wm_pulse_event_queue_v1",
  "wm_pulse_chain_state_v1",
  "wm_vault_career_history_v1",
  "wm_pending_actions_later_v1",
] as const;

/** Bell stores — only sync when the source role authored them */
export const CAREER_CIRCUIT_NOTIFICATION_KEYS = [
  "wm_employee_notifications_v1",
  "wm_employer_notifications_v1",
] as const;

/** Full mirror set for steps that intentionally copy bell state */
export const CAREER_CIRCUIT_SHARED_KEYS = [
  ...CAREER_CIRCUIT_DATA_KEYS,
  ...CAREER_CIRCUIT_NOTIFICATION_KEYS,
] as const;

const STORAGE_SYNC_EVENTS = [
  "wm:employer-career-posts-changed",
  "wm:employee-career-applications-changed",
  "wm:employee-career-workspaces-changed",
  "wm:employee-notifications-changed",
  "wm:employer-notifications-changed",
  "wm:employment-changed",
  "wm:employment-lifecycle-changed",
  "wm:hr-management-changed",
  "wm:pulse-event-queue-changed",
  "wm:vault-career-history-changed",
  "wm:pending-actions-changed",
] as const;

export type CareerCircuitApplication = {
  id: string;
  jobId: string;
  stage: string;
  employeeId?: string;
  employeeName?: string;
};

export type CareerCircuitWorkspace = {
  id: string;
  jobId: string;
  status: string;
};

export type CircuitNotification = {
  title: string;
  body?: string;
  isRead?: boolean;
};

export type HRCircuitRecord = {
  id: string;
  careerPostId: string;
  applicationId: string;
  candidateName: string;
  status: string;
};

export function pendingInterviewRsvpActionId(postId: string = CAREER_CIRCUIT_IDS.postId): string {
  return `career-interview-rsvp-${postId}`;
}

export function pendingOfferResponseActionId(postId: string = CAREER_CIRCUIT_IDS.postId): string {
  return `career-offer-response-${postId}`;
}

export async function initCareerRoleContext(
  page: Page,
  role: "employer" | "employee",
): Promise<void> {
  await page.addInitScript(
    ({ sessionRole, splashKey, profile }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");

      if (profile) {
        localStorage.setItem("wm_employee_profile_v1", JSON.stringify(profile));
      }
    },
    {
      sessionRole: role,
      splashKey: SPLASH_SESSION_KEY,
      profile:
        role === "employee"
          ? {
              uniqueId: CAREER_CIRCUIT_IDS.workerWmId,
              fullName: CAREER_CIRCUIT_IDS.workerName,
              city: "Kochi",
              skills: ["operations"],
              experience: "experienced",
              languages: ["English"],
              preferShiftJobs: false,
              preferCareerJobs: true,
              availability: {
                weekdays: true,
                weekends: false,
                morning: true,
                afternoon: true,
                evening: false,
              },
            }
          : null,
    },
  );

  if (role === "employee") {
    await page.addInitScript(() => {
      localStorage.setItem("wm_employee_onboarding_complete_v1", "1");
      localStorage.setItem("wm_onboarding_complete_v1", "1");
      localStorage.setItem("wm_employee_home_welcome_v1", "1");
    });
  }
}

/** Seed one active career post (published) into both contexts before navigation */
export async function seedCareerCircuitPost(page: Page): Promise<void> {
  const now = Date.now();

  await page.addInitScript(
    ({ ids, seedNow, seedFlag }) => {
      if (sessionStorage.getItem(seedFlag) === "1") {
        return;
      }

      sessionStorage.setItem(seedFlag, "1");

      const closingDate = seedNow + 30 * 86_400_000;

      const post = {
        id: ids.postId,
        employerId: "employer_demo",
        companyName: ids.companyName,
        jobTitle: ids.jobTitle,
        department: "Operations",
        jobType: "full-time",
        workMode: "on-site",
        location: "Kochi, Kerala",
        vacancies: 1,
        probationPeriod: "none",
        salaryMin: 25000,
        salaryMax: 35000,
        salaryPeriod: "monthly",
        noticePeriodDays: 0,
        experienceMin: 0,
        experienceMax: 3,
        qualifications: ["Graduate"],
        skills: ["Operations", "Communication"],
        description: "Circuit baseline career post for E2E professional funnel audit.",
        responsibilities: ["Daily operations", "Team coordination"],
        interviewRounds: 1,
        roundConfigs: [{ round: 1, label: "Screening", mode: "phone" }],
        status: "active",
        createdAt: seedNow,
        updatedAt: seedNow,
        closingDate,
        screeningQuestions: [],
        isTemplate: false,
        totalApplications: 0,
        shortlisted: 0,
        inInterview: 0,
        offered: 0,
        hired: 0,
        rejected: 0,
      };

      const posts = [post];

      const searchable = [
        {
          id: post.id,
          companyName: post.companyName,
          jobTitle: post.jobTitle,
          department: post.department,
          jobType: post.jobType,
          workMode: post.workMode,
          location: post.location,
          salaryMin: post.salaryMin,
          salaryMax: post.salaryMax,
          salaryPeriod: post.salaryPeriod,
          experienceMin: post.experienceMin,
          experienceMax: post.experienceMax,
          noticePeriodDays: post.noticePeriodDays,
          qualifications: post.qualifications,
          skills: post.skills,
          description: post.description,
          responsibilities: post.responsibilities,
          interviewRounds: post.interviewRounds,
          closingDate: post.closingDate,
          createdAt: post.createdAt,
          screeningQuestions: [],
        },
      ];

      localStorage.setItem("wm_employer_career_posts_v1", JSON.stringify(posts));
      localStorage.setItem("wm_employee_career_posts_search_v1", JSON.stringify(searchable));
      localStorage.removeItem("wm_employee_career_applications_v1");
      localStorage.removeItem("wm_employee_career_workspaces_v1");
      localStorage.removeItem("wm_employee_notifications_v1");
      localStorage.removeItem("wm_employer_notifications_v1");
      localStorage.removeItem("wm_career_employment_v1");
      localStorage.removeItem("wm_employment_lifecycle_v1");
      localStorage.removeItem("wm_hr_management_v1");
      localStorage.removeItem("wm_vault_career_history_v1");
      localStorage.removeItem("wm_pending_actions_later_v1");
      localStorage.removeItem("wm_pulse_event_queue_v1");
    },
    { ids: CAREER_CIRCUIT_IDS, seedNow: now, seedFlag: CAREER_CIRCUIT_SEED_FLAG },
  );
}

type CareerCircuitSyncOptions = {
  /** When false, bell keys are not copied (prevents clobber after pulse consume on target). */
  readonly includeNotifications?: boolean;
  /** When true, skip pulse-queue change event so the target shell does not race manual consume. */
  readonly skipPulseQueueDispatch?: boolean;
};

export async function syncCareerCircuitStorage(
  source: Page,
  target: Page,
  options: CareerCircuitSyncOptions = {},
): Promise<void> {
  const includeNotifications = options.includeNotifications ?? true;
  const keys = includeNotifications ? CAREER_CIRCUIT_SHARED_KEYS : CAREER_CIRCUIT_DATA_KEYS;
  const events = options.skipPulseQueueDispatch
    ? STORAGE_SYNC_EVENTS.filter((eventName) => eventName !== "wm:pulse-event-queue-changed")
    : STORAGE_SYNC_EVENTS;

  const snapshot = await source.evaluate((syncKeys) => {
    const data: Record<string, string | null> = {};

    for (const key of syncKeys) {
      data[key] = localStorage.getItem(key);
    }

    return data;
  }, keys);

  await target.evaluate(
    ({ data, events: syncEvents }) => {
      for (const [key, value] of Object.entries(data)) {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      }

      for (const eventName of syncEvents) {
        window.dispatchEvent(new Event(eventName));
      }
    },
    { data: snapshot, events },
  );
}

/** Sync domain + pulse queue only — never copy bell keys or dispatch queue-changed. */
export async function syncCareerDataOnly(source: Page, target: Page): Promise<void> {
  await syncCareerCircuitStorage(source, target, {
    includeNotifications: false,
    skipPulseQueueDispatch: true,
  });
}

export type CareerPulseDeliveryResult = {
  readonly consumed: number;
};

export async function syncAndDeliverCareerPulse(
  source: Page,
  target: Page,
  targetRole: "employer" | "employee",
): Promise<CareerPulseDeliveryResult> {
  await syncCareerDataOnly(source, target);
  await hydrateCareerCircuitPulse(target, { dispatchQueueChanged: false });

  const consumed =
    targetRole === "employer"
      ? await consumeEmployerCareerCircuitPulse(target)
      : await consumeEmployeeCareerCircuitPulse(target);

  return { consumed };
}

export async function readCareerCircuitApplications(
  page: Page,
): Promise<CareerCircuitApplication[]> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("wm_employee_career_applications_v1");
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CareerCircuitApplication[]) : [];
  });
}

export async function readCareerCircuitApplicationStage(
  page: Page,
  postId: string = CAREER_CIRCUIT_IDS.postId,
): Promise<string | null> {
  const apps = await readCareerCircuitApplications(page);
  return apps.find((app) => app.jobId === postId)?.stage ?? null;
}

export async function waitForCareerCircuitApplicationStage(
  page: Page,
  stage: string,
  postId: string = CAREER_CIRCUIT_IDS.postId,
): Promise<void> {
  await expect
    .poll(async () => readCareerCircuitApplicationStage(page, postId), {
      message: `Career application for ${postId} must reach stage "${stage}"`,
      timeout: 15_000,
    })
    .toBe(stage);
}

export async function readCareerCircuitWorkspaces(page: Page): Promise<CareerCircuitWorkspace[]> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("wm_employee_career_workspaces_v1");
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CareerCircuitWorkspace[]) : [];
  });
}

export async function readCareerCircuitNotifications(
  page: Page,
  role: "employer" | "employee",
): Promise<CircuitNotification[]> {
  const key = role === "employer" ? "wm_employer_notifications_v1" : "wm_employee_notifications_v1";

  return page.evaluate((storageKey) => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is { title: string; body?: string; isRead?: boolean } => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof (item as { title?: unknown }).title === "string"
        );
      })
      .map((item) => ({ title: item.title, body: item.body, isRead: item.isRead }));
  }, key);
}

export async function readEmployerUnreadNotificationCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("wm_employer_notifications_v1");
    if (!raw) return 0;

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return 0;

    return parsed.filter((item) => {
      return (
        typeof item === "object" && item !== null && (item as { isRead?: boolean }).isRead !== true
      );
    }).length;
  });
}

export async function readHrCircuitRecords(page: Page): Promise<HRCircuitRecord[]> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("wm_hr_management_v1");
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is HRCircuitRecord => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof (item as HRCircuitRecord).careerPostId === "string"
        );
      })
      .map((item) => ({
        id: item.id,
        careerPostId: item.careerPostId,
        applicationId: item.applicationId,
        candidateName: item.candidateName,
        status: item.status,
      }));
  });
}

export function notificationIncludes(
  notifications: CircuitNotification[],
  titlePattern: RegExp,
): boolean {
  return notifications.some((item) => titlePattern.test(item.title));
}

export async function ensureCareerCircuitWorkerIdentity(page: Page): Promise<void> {
  await page.evaluate(({ workerWmId, workerName, postId }) => {
    const profileRaw = localStorage.getItem("wm_employee_profile_v1");
    const profile = profileRaw
      ? (JSON.parse(profileRaw) as Record<string, unknown>)
      : {
          fullName: workerName,
          city: "Kochi",
          skills: ["operations"],
          experience: "experienced",
          languages: ["English"],
          preferShiftJobs: false,
          preferCareerJobs: true,
          availability: {
            weekdays: true,
            weekends: false,
            morning: true,
            afternoon: true,
            evening: false,
          },
        };

    profile.uniqueId = workerWmId;
    profile.fullName = (profile.fullName as string | undefined) || workerName;
    localStorage.setItem("wm_employee_profile_v1", JSON.stringify(profile));

    const apps = JSON.parse(
      localStorage.getItem("wm_employee_career_applications_v1") ?? "[]",
    ) as Array<{
      jobId?: string;
      employeeId?: string;
      employeeName?: string;
      profileSnapshot?: { uniqueId?: string; fullName?: string };
    }>;

    for (const app of apps) {
      if (app.jobId !== postId) continue;

      app.employeeId = workerWmId;
      app.employeeName = app.employeeName || workerName;
      app.profileSnapshot = {
        ...app.profileSnapshot,
        uniqueId: workerWmId,
        fullName: app.profileSnapshot?.fullName || workerName,
      };
    }

    if (apps.length > 0) {
      localStorage.setItem("wm_employee_career_applications_v1", JSON.stringify(apps));
      window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
    }
  }, CAREER_CIRCUIT_IDS);
}

/** Interview results can only be recorded after scheduled datetime — backdate for E2E plumbing */
export async function backdateCareerCircuitInterview(
  page: Page,
  postId: string = CAREER_CIRCUIT_IDS.postId,
): Promise<void> {
  await page.evaluate((jobId) => {
    const apps = JSON.parse(
      localStorage.getItem("wm_employee_career_applications_v1") ?? "[]",
    ) as Array<{
      jobId: string;
      roundResults?: Array<{
        round: number;
        scheduledDate?: string;
        scheduledTime?: string;
      }>;
    }>;

    const yesterday = new Date(Date.now() - 86_400_000);
    const localDate = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60_000);
    const dateValue = localDate.toISOString().slice(0, 10);

    for (const app of apps) {
      if (app.jobId !== jobId || !Array.isArray(app.roundResults)) continue;

      for (const round of app.roundResults) {
        if (round.round === 1) {
          round.scheduledDate = dateValue;
          round.scheduledTime = "09:00";
        }
      }
    }

    localStorage.setItem("wm_employee_career_applications_v1", JSON.stringify(apps));
    window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
  }, postId);
}

/** Returns a schedule slot at least 45 minutes in the future (30-minute buffer rule) */
export function getFutureInterviewScheduleSlot(): { date: string; time: string } {
  const future = new Date(Date.now() + 2 * 60 * 60_000);
  const year = future.getFullYear();
  const month = String(future.getMonth() + 1).padStart(2, "0");
  const day = String(future.getDate()).padStart(2, "0");
  const date = `${year}-${month}-${day}`;
  const hours = String(future.getHours()).padStart(2, "0");
  const minutes = String(future.getMinutes()).padStart(2, "0");

  return { date, time: `${hours}:${minutes}` };
}

export async function hydrateCareerCircuitPulse(
  page: Page,
  options: { readonly dispatchQueueChanged?: boolean } = {},
): Promise<void> {
  const dispatchQueueChanged = options.dispatchQueueChanged ?? true;

  await page.evaluate(async (shouldDispatchQueueChanged) => {
    localStorage.setItem("wm:pulse-nav-enabled", "true");
    const navStore = await import("/src/features/pulse/pulseNavStore.ts");
    navStore.usePulseNavStore.setState({ enabled: true });

    const storage = await import("/src/features/pulse/pulseStorage.ts");
    const store = await import("/src/features/pulse/pulseStore.ts");
    const hydrated = storage.hydratePulseState();
    store.usePulseStore.setState(hydrated);

    if (shouldDispatchQueueChanged) {
      window.dispatchEvent(new Event("wm:pulse-event-queue-changed"));
    }
  }, dispatchQueueChanged);
}

export async function consumeEmployerCareerCircuitPulse(page: Page): Promise<number> {
  return page.evaluate(async () => {
    localStorage.setItem("wm:pulse-nav-enabled", "true");
    const navStore = await import("/src/features/pulse/pulseNavStore.ts");
    navStore.usePulseNavStore.setState({ enabled: true });

    const bridge = await import("/src/features/pulse/pulseEventBridge.ts");
    return bridge.consumeQueuedPulseEventsForRole("employer");
  });
}

export async function consumeEmployeeCareerCircuitPulse(page: Page): Promise<number> {
  return page.evaluate(async () => {
    localStorage.setItem("wm:pulse-nav-enabled", "true");
    const navStore = await import("/src/features/pulse/pulseNavStore.ts");
    navStore.usePulseNavStore.setState({ enabled: true });

    const bridge = await import("/src/features/pulse/pulseEventBridge.ts");
    return bridge.consumeQueuedPulseEventsForRole("employee");
  });
}

export async function clickEmployerCareerPipelineTab(
  page: Page,
  tabLabel: "Applied" | "Shortlist" | "Interview" | "Offered" | "Hired",
): Promise<void> {
  const tabButton = page.getByRole("button", { name: new RegExp(`\\b${tabLabel}\\b`) }).first();
  await tabButton.scrollIntoViewIfNeeded({ timeout: 15_000 });
  await tabButton.click({ timeout: 15_000 });
}

/** Runtime guard — init-script seed can be skipped after cross-context sync; upsert post if missing. */
export async function ensureCareerCircuitPostInStorage(page: Page): Promise<void> {
  await page.evaluate((ids) => {
    const postsRaw = localStorage.getItem("wm_employer_career_posts_v1");
    const posts = postsRaw ? (JSON.parse(postsRaw) as Array<{ id?: string }>) : [];
    if (Array.isArray(posts) && posts.some((item) => item.id === ids.postId)) {
      return;
    }

    const seedNow = Date.now();
    const closingDate = seedNow + 30 * 86_400_000;

    const post = {
      id: ids.postId,
      employerId: "employer_demo",
      companyName: ids.companyName,
      jobTitle: ids.jobTitle,
      department: "Operations",
      jobType: "full-time",
      workMode: "on-site",
      location: "Kochi, Kerala",
      vacancies: 1,
      probationPeriod: "none",
      salaryMin: 25000,
      salaryMax: 35000,
      salaryPeriod: "monthly",
      noticePeriodDays: 0,
      experienceMin: 0,
      experienceMax: 3,
      qualifications: ["Graduate"],
      skills: ["Operations", "Communication"],
      description: "Circuit baseline career post for E2E professional funnel audit.",
      responsibilities: ["Daily operations", "Team coordination"],
      interviewRounds: 1,
      roundConfigs: [{ round: 1, label: "Screening", mode: "phone" }],
      status: "active",
      createdAt: seedNow,
      updatedAt: seedNow,
      closingDate,
      screeningQuestions: [],
      isTemplate: false,
      totalApplications: 0,
      shortlisted: 0,
      inInterview: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
    };

    const searchable = [
      {
        id: post.id,
        companyName: post.companyName,
        jobTitle: post.jobTitle,
        department: post.department,
        jobType: post.jobType,
        workMode: post.workMode,
        location: post.location,
        salaryMin: post.salaryMin,
        salaryMax: post.salaryMax,
        salaryPeriod: post.salaryPeriod,
        experienceMin: post.experienceMin,
        experienceMax: post.experienceMax,
        noticePeriodDays: post.noticePeriodDays,
        qualifications: post.qualifications,
        skills: post.skills,
        description: post.description,
        responsibilities: post.responsibilities,
        interviewRounds: post.interviewRounds,
        closingDate: post.closingDate,
        createdAt: post.createdAt,
        screeningQuestions: [],
      },
    ];

    localStorage.setItem("wm_employer_career_posts_v1", JSON.stringify([post]));
    localStorage.setItem("wm_employee_career_posts_search_v1", JSON.stringify(searchable));
    window.dispatchEvent(new Event("wm:employer-career-posts-changed"));
  }, CAREER_CIRCUIT_IDS);
}

const CAREER_POST_ROUTE_WAIT_MS = 20_000;

export async function gotoEmployerCareerPostDashboard(page: Page): Promise<void> {
  await ensureCareerCircuitPostInStorage(page);

  const path = `/#/employer/career/post/${CAREER_CIRCUIT_IDS.postId}`;
  await page.goto(path, { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(new RegExp(CAREER_CIRCUIT_IDS.postId), {
    timeout: CAREER_POST_ROUTE_WAIT_MS,
  });

  const jobTitle = page.getByText(CAREER_CIRCUIT_IDS.jobTitle).first();
  const postMissing = page.getByText("Post not found.");

  const visible = await jobTitle.isVisible().catch(() => false);
  if (!visible) {
    const missing = await postMissing.isVisible().catch(() => false);
    if (missing) {
      await ensureCareerCircuitPostInStorage(page);
      await page.goto(path, { waitUntil: "domcontentloaded" });
    }
  }

  await expect(jobTitle).toBeVisible({ timeout: CAREER_POST_ROUTE_WAIT_MS });
}

export async function gotoEmployeeCareerPostApply(page: Page): Promise<void> {
  await ensureCareerCircuitPostInStorage(page);

  const path = `/#/employee/career/post/${CAREER_CIRCUIT_IDS.postId}`;
  await page.goto(path, { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(new RegExp(CAREER_CIRCUIT_IDS.postId), {
    timeout: CAREER_POST_ROUTE_WAIT_MS,
  });

  await expect(page.getByText(CAREER_CIRCUIT_IDS.jobTitle).first()).toBeVisible({
    timeout: CAREER_POST_ROUTE_WAIT_MS,
  });
}

export async function gotoEmployeeHomeHub(page: Page, syncFrom?: Page): Promise<void> {
  if (syncFrom) {
    await syncCareerCircuitStorage(syncFrom, page);
  }

  await page.goto("/#/employee");

  await page.evaluate(() => {
    window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
    window.dispatchEvent(new Event("wm:pending-actions-changed"));
  });

  await page.getByTestId("pending-actions-hub").waitFor({ state: "visible", timeout: 15_000 });
}

export async function gotoEmployerHome(page: Page): Promise<void> {
  await page.goto("/#/employer");
  await page.getByRole("button", { name: "Notifications" }).waitFor({ state: "visible" });
}

export function getPendingActionRow(page: Page, actionId: string): Locator {
  return page.getByTestId(`pending-action-row-${actionId}`);
}

export function getPendingActionAcceptButton(page: Page, actionId: string): Locator {
  return page.getByTestId(`pending-action-accept-${actionId}`);
}

export async function assertPendingActionAcceptHasPulseHalo(
  page: Page,
  actionId: string,
): Promise<void> {
  const row = getPendingActionRow(page, actionId);
  await expect(row).toBeVisible({ timeout: 15_000 });

  const acceptButton = getPendingActionAcceptButton(page, actionId);
  await expect(acceptButton).toBeVisible();

  const pulseHalo = row.locator(".wm-breathe");
  await expect(
    pulseHalo,
    "Pending Actions accept CTA must render inside Pulse Halo (.wm-breathe)",
  ).toBeVisible();
}

export async function assertEmployerTopbarBellUnreadIncreased(
  page: Page,
  previousUnread: number,
): Promise<void> {
  const currentUnread = await readEmployerUnreadNotificationCount(page);

  expect(
    currentUnread,
    "Employer notification storage unread count must increase after employee action",
  ).toBeGreaterThan(previousUnread);

  const bellButton = page.getByRole("button", { name: "Notifications" });
  const badge = bellButton.locator(`span[aria-label="${currentUnread} unread"]`);

  await expect(
    badge,
    "Employer topbar bell must show red unread badge after bridge delivery",
  ).toBeVisible({ timeout: 10_000 });
}
