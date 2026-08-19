import { expect, type Locator, type Page } from "@playwright/test";
import { E2E_VERIFIED_EMPLOYER_PROFILE } from "./e2e-employer-profile";
import { signInAs, skipSplashAndSetRole } from "./realUserCleanSlate";

/** Deterministic IDs for the Career Full Circuit baseline run */
export const CAREER_CIRCUIT_IDS = {
  postId: "e2e-career-circuit-post-001",
  companyName: "Circuit Professional Services",
  jobTitle: "Operations Executive",
  workerMlId: "ML-E2E2-CCR-CRCT",
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
  "wm_employer_profile_v1",
  "wm_career_employment_v1",
  "wm_employment_lifecycle_v1",
  "wm_pulse_event_queue_v1",
  "wm_pulse_chain_state_v1",
  "wm_vault_career_history_v1",
  "wm_pending_actions_later_v1",
  "wm_ratings_employer_to_worker_v1",
  "wm_ratings_worker_to_employer_v1",
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
    ({ sessionRole, splashKey, profile, employerProfile }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");

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
      profile:
        role === "employee"
          ? {
              uniqueId: CAREER_CIRCUIT_IDS.workerMlId,
              fullName: CAREER_CIRCUIT_IDS.workerName,
              city: "City A",
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
      employerProfile: role === "employer" ? E2E_VERIFIED_EMPLOYER_PROFILE : null,
    },
  );

  if (role === "employee") {
    await page.addInitScript(() => {
      localStorage.setItem("wm_employee_onboarding_complete_v1", "1");
      localStorage.setItem("wm_onboarding_complete_v1", "1");
      localStorage.setItem("wm_employee_home_welcome_v1", "1");
    });
  }

  const email =
    role === "employer" ? "employer@demo.jobmitra.app" : "employee@demo.jobmitra.app";
  await signInAs(page, email, "demo1234");
  await skipSplashAndSetRole(page, role);
}

/** Mirror verified employer profile into piiSecureStorage for scoped career reads. */
export async function ensureCareerEmployerProfileOnPage(page: Page): Promise<void> {
  await page.evaluate(async (profile) => {
    const { employerSettingsStorage } =
      await import("/src/features/employer/company/storage/employerSettings.storage.ts");
    employerSettingsStorage.save({
      ...employerSettingsStorage.EMPTY_PROFILE,
      ...profile,
    });
  }, E2E_VERIFIED_EMPLOYER_PROFILE);
}

/** Seed one active career post (published) into both contexts before navigation */
export async function seedCareerCircuitPost(page: Page): Promise<void> {
  const now = Date.now();

  await page.addInitScript(
    ({ ids, seedNow, seedFlag }) => {
      const scopeId = (raw: string) =>
        String(raw || "unknown").trim().replace(/[^a-zA-Z0-9_-]/g, "_");

      const postsRaw = localStorage.getItem("wm_employer_career_posts_v1");
      const existingPosts = postsRaw ? (JSON.parse(postsRaw) as Array<{ id?: string }>) : [];
      const alreadySeeded =
        sessionStorage.getItem(seedFlag) === "1" &&
        Array.isArray(existingPosts) &&
        existingPosts.some((item) => item.id === ids.postId);
      if (alreadySeeded) {
        return;
      }

      sessionStorage.setItem(seedFlag, "1");

      const closingDate = seedNow + 30 * 86_400_000;

      const employerProfileRaw = localStorage.getItem("wm_employer_profile_v1");
      let employerScope = "unknown_employer";
      try {
        if (employerProfileRaw) {
          const profile = JSON.parse(employerProfileRaw) as {
            uniqueId?: string;
            companyUniqueId?: string;
          };
          employerScope = scopeId(profile.uniqueId || profile.companyUniqueId || employerScope);
        }
      } catch {
        /* demo-safe */
      }

      const post = {
        id: ids.postId,
        employerId: employerScope,
        companyName: ids.companyName,
        jobTitle: ids.jobTitle,
        department: "Operations",
        jobType: "full-time",
        workMode: "on-site",
        location: "City A",
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
          employerId: post.employerId,
        },
      ];

      const workerScope = scopeId(ids.workerMlId);
      const employerPostsKey = `wm_employer_${employerScope}_career_posts_v1`;
      const employerSearchKey = `wm_employer_${employerScope}_career_search_v1`;
      const employerAppsKey = `wm_employer_${employerScope}_career_applications_v1`;
      const workerAppsKey = `wm_employee_${workerScope}_career_applications_v1`;
      const workerWsKey = `wm_employee_${workerScope}_career_workspaces_v1`;

      localStorage.setItem("wm_employer_career_posts_v1", JSON.stringify(posts));
      localStorage.setItem(employerPostsKey, JSON.stringify(posts));
      localStorage.setItem(`${employerPostsKey}__migrated_v1`, "1");

      localStorage.setItem("wm_employee_career_posts_search_v1", JSON.stringify(searchable));
      localStorage.setItem(employerSearchKey, JSON.stringify(searchable));
      localStorage.setItem(`${employerSearchKey}__migrated_v1`, "1");

      localStorage.removeItem("wm_employee_career_applications_v1");
      localStorage.removeItem(workerAppsKey);
      localStorage.removeItem(employerAppsKey);
      localStorage.removeItem("wm_employee_career_workspaces_v1");
      localStorage.removeItem(workerWsKey);
      localStorage.removeItem(`wm_employer_${employerScope}_career_workspaces_v1`);
      localStorage.removeItem("wm_employee_notifications_v1");
      localStorage.removeItem("wm_employer_notifications_v1");
      localStorage.removeItem("wm_career_employment_v1");
      localStorage.removeItem("wm_employment_lifecycle_v1");
      localStorage.removeItem("wm_hr_management_v1");
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i);
        if (key?.startsWith("wm_hr_employer_")) {
          localStorage.removeItem(key);
        }
      }
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

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith("wm_hr_employer_") ||
        /^wm_employer_[a-zA-Z0-9_-]+_career_/.test(key) ||
        /^wm_employee_[a-zA-Z0-9_-]+_career_/.test(key) ||
        /^wm_employee_[a-zA-Z0-9_-]+_vault_career_history_v1$/.test(key)
      ) {
        data[key] = localStorage.getItem(key);
      }
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
  return page.evaluate(async ({ workerMlId }) => {
    const { readCareerApps, readCareerAppsForEmployee } =
      await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");

    const merged = new Map<
      string,
      { id: string; jobId: string; stage: string; employeeId?: string; employeeName?: string }
    >();

    for (const app of [...readCareerApps(), ...readCareerAppsForEmployee(workerMlId)]) {
      merged.set(app.id, {
        id: app.id,
        jobId: app.jobId,
        stage: app.stage,
        employeeId: app.employeeId,
        employeeName: app.employeeName,
      });
    }

    return [...merged.values()];
  }, { workerMlId: CAREER_CIRCUIT_IDS.workerMlId });
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
      timeout: 25_000,
    })
    .toBe(stage);
}

export async function readCareerCircuitWorkspaces(page: Page): Promise<CareerCircuitWorkspace[]> {
  return page.evaluate(async ({ workerMlId }) => {
    const { readCareerWorkspaces, readCareerWorkspacesForEmployee } =
      await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");

    const merged = new Map<string, { id: string; jobId: string; status: string }>();
    for (const ws of [...readCareerWorkspaces(), ...readCareerWorkspacesForEmployee(workerMlId)]) {
      merged.set(ws.id, { id: ws.id, jobId: ws.jobId, status: ws.status });
    }
    return [...merged.values()];
  }, { workerMlId: CAREER_CIRCUIT_IDS.workerMlId });
}

export async function readCareerCircuitNotifications(
  page: Page,
  role: "employer" | "employee",
): Promise<CircuitNotification[]> {
  if (role === "employer") {
    return page.evaluate(async () => {
      const { employerNotificationsStorage } =
        await import("/src/features/employer/notifications/storage/employerNotifications.storage.ts");
      return employerNotificationsStorage.getAll().map((item) => ({
        title: item.title,
        body: item.body,
        isRead: item.isRead,
      }));
    });
  }

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
  }, "wm_employee_notifications_v1");
}

export async function readEmployerUnreadNotificationCount(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const { employerNotificationsStorage } =
      await import("/src/features/employer/notifications/storage/employerNotifications.storage.ts");
    return employerNotificationsStorage.getUnreadCount();
  });
}

export async function readHrCircuitRecords(page: Page): Promise<HRCircuitRecord[]> {
  return page.evaluate(async () => {
    const { readAll } =
      await import("/src/features/employer/hrManagement/storage/hrStorage.core.ts");
    return readAll().map((item) => ({
      id: item.id,
      careerPostId: item.careerPostId,
      applicationId: item.applicationId,
      candidateName: item.employeeName,
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
  await page.evaluate(
    async ({ workerMlId, workerName, postId }) => {
      const { employeeProfileStorage } =
        await import("/src/features/employee/profile/storage/employeeProfile.storage.ts");
      const { readCareerAppsForEmployee, writeCareerAppsForEmployee } =
        await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");

      const byId = new Map<string, Record<string, unknown>>();
      const collect = (apps: Array<{ id?: string; jobId?: string }>) => {
        for (const app of apps) {
          if (!app?.id) continue;
          byId.set(app.id, app as Record<string, unknown>);
        }
      };

      collect(readCareerAppsForEmployee());
      collect(readCareerAppsForEmployee(workerMlId));
      for (const key of Object.keys(localStorage)) {
        if (!key.includes("_career_applications_v1") || key.includes("__migrated")) continue;
        try {
          const parsed = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<{ id?: string }>;
          if (Array.isArray(parsed)) collect(parsed);
        } catch {
          /* ignore */
        }
      }

      const existing = employeeProfileStorage.get();
      const liveId = existing.uniqueId?.trim() || workerMlId;
      employeeProfileStorage.set({
        ...existing,
        uniqueId: liveId,
        fullName: existing.fullName?.trim() || workerName,
        city: existing.city || "City A",
        skills: existing.skills?.length ? existing.skills : ["operations"],
        experience: existing.experience || "experienced",
        languages: existing.languages?.length ? existing.languages : ["English"],
        preferShiftJobs: false,
        preferCareerJobs: true,
      });

      const apps = [...byId.values()] as Array<{
        id: string;
        jobId: string;
        employeeId?: string;
        employeeName?: string;
        profileSnapshot?: { uniqueId?: string; fullName?: string };
      }>;
      for (const app of apps) {
        if (app.jobId !== postId) continue;
        app.employeeId = liveId;
        app.employeeName = app.employeeName || workerName;
        app.profileSnapshot = {
          ...app.profileSnapshot,
          uniqueId: liveId,
          fullName: app.profileSnapshot?.fullName || workerName,
        };
      }

      writeCareerAppsForEmployee(apps, liveId);
      window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
    },
    CAREER_CIRCUIT_IDS,
  );
}

/** Copy offerDetails from employer bucket into employee scoped app (sync omits nested fields). */
export async function ensureCareerOfferDetailsOnEmployee(
  employeePage: Page,
  employerPage: Page,
  postId: string = CAREER_CIRCUIT_IDS.postId,
): Promise<void> {
  const offerDetails = await employerPage.evaluate(async ({ jobId }) => {
    const { readCareerApps } =
      await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");
    const app = readCareerApps().find((item) => item.jobId === jobId && item.stage === "offered");
    return app?.offerDetails ?? null;
  }, { jobId: postId });

  if (!offerDetails) return;

  await employeePage.evaluate(
    async ({ jobId, details }) => {
      const { readCareerAppsForEmployee, writeCareerAppsForEmployee } =
        await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");
      const { employeeProfileStorage } =
        await import("/src/features/employee/profile/storage/employeeProfile.storage.ts");

      const liveId = employeeProfileStorage.get().uniqueId?.trim();
      const apps = readCareerAppsForEmployee(liveId);
      let changed = false;
      for (const app of apps) {
        if (app.jobId !== jobId || app.stage !== "offered") continue;
        app.offerDetails = details;
        if (liveId) app.employeeId = liveId;
        changed = true;
      }
      if (changed) {
        writeCareerAppsForEmployee(apps, liveId);
      }
    },
    { jobId: postId, details: offerDetails },
  );
}

/** Fallback when PendingActionsHub accept handler races async offer accept. */
export async function acceptCareerOfferOnPage(
  page: Page,
  postId: string = CAREER_CIRCUIT_IDS.postId,
): Promise<boolean> {
  return page.evaluate(async (jobId) => {
    const { acceptCareerOffer } =
      await import("/src/features/employee/careerJobs/services/careerApply/careerApply.actions.ts");
    const result = await acceptCareerOffer(jobId);
    return result.ok;
  }, postId);
}

/** Interview results can only be recorded after scheduled datetime — backdate for E2E plumbing */
export async function backdateCareerCircuitInterview(
  page: Page,
  postId: string = CAREER_CIRCUIT_IDS.postId,
): Promise<void> {
  await page.evaluate(
    async ({ jobId, workerMlId }) => {
      const { readCareerAppsForEmployee, writeCareerAppsForEmployee } =
        await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");

      const apps = readCareerAppsForEmployee(workerMlId);
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

      writeCareerAppsForEmployee(apps, workerMlId);
    },
    { jobId: postId, workerMlId: CAREER_CIRCUIT_IDS.workerMlId },
  );
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
  await dismissCareerEmployerNoticeModal(page);
  const tabButton = page.locator("button.wm-pipeline-btn").filter({ hasText: tabLabel }).first();
  await tabButton.scrollIntoViewIfNeeded({ timeout: 15_000 });
  await tabButton.click({ timeout: 15_000 });
}

/** Close NoticeModal (Offer Sent / Hired / etc.) — OK button; Escape fallback. */
export async function dismissCareerEmployerNoticeModal(page: Page): Promise<void> {
  const dialog = page.locator('[role="dialog"].wm-modal-backdrop, [role="dialog"]').filter({
    has: page.locator(".wm-noticeModal"),
  });
  const visible = await dialog
    .first()
    .isVisible()
    .catch(() => false);
  if (!visible) {
    // Also match aria-label dialogs without requiring class on role node
    const byLabel = page.getByRole("dialog", { name: /Offer Sent|Candidate Hired|Cannot/i });
    if (!(await byLabel.isVisible().catch(() => false))) return;
    await byLabel
      .getByRole("button", { name: /^OK$/i })
      .click({ timeout: 3_000 })
      .catch(async () => {
        await page.keyboard.press("Escape");
      });
    await byLabel.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => undefined);
    return;
  }

  await dialog
    .first()
    .getByRole("button", { name: /^OK$/i })
    .click({ timeout: 3_000 })
    .catch(async () => {
      await page.keyboard.press("Escape");
    });
  await dialog
    .first()
    .waitFor({ state: "hidden", timeout: 5_000 })
    .catch(() => undefined);
}

/** V2 hiring flow: employee accept leaves offer_accepted; employer must confirm hire. */
export async function employerMarkCareerCandidateHired(
  page: Page,
  employeePage?: Page,
): Promise<void> {
  if (employeePage) {
    await syncCareerDataOnly(employeePage, page);
  }

  await waitForCareerCircuitApplicationStage(page, "offer_accepted");
  await ensureCareerEmployerProfileOnPage(page);
  await gotoEmployerCareerPostDashboard(page);
  await dismissCareerEmployerNoticeModal(page);
  await clickEmployerCareerPipelineTab(page, "Offered");

  await page.evaluate(() => {
    window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
    window.dispatchEvent(new Event("wm:employer-career-posts-changed"));
  });

  const hireBtn = page.getByRole("button", { name: "Mark as Hired", exact: true }).first();
  const hireBtnVisible = await hireBtn.isVisible({ timeout: 12_000 }).catch(() => false);

  if (!hireBtnVisible) {
    const hired = await page.evaluate(
      async ({ postId, workerMlId }) => {
        const { readCareerApps, readCareerAppsForEmployee, writeCareerApps } =
          await import("/src/features/employer/careerJobs/helpers/careerPersistence.ts");
        const { hireCandidate } =
          await import("/src/features/employer/careerJobs/services/careerOfferHireService.ts");

        const employeeApp = readCareerAppsForEmployee(workerMlId).find(
          (item) => item.jobId === postId && item.stage === "offer_accepted",
        );
        if (!employeeApp) return { ok: false, reason: "no_employee_app" };

        const employerApps = readCareerApps();
        const nextEmployerApps = employerApps.some((item) => item.id === employeeApp.id)
          ? employerApps.map((item) => (item.id === employeeApp.id ? employeeApp : item))
          : [...employerApps, employeeApp];
        writeCareerApps(nextEmployerApps);

        const result = await hireCandidate(postId, employeeApp.id);
        return { ok: result.ok, reason: result.ok ? "ok" : result.reason };
      },
      { postId: CAREER_CIRCUIT_IDS.postId, workerMlId: CAREER_CIRCUIT_IDS.workerMlId },
    );

    expect(hired.ok, `hireCandidate service fallback must succeed (${hired.reason})`).toBe(true);
    await dismissCareerEmployerNoticeModal(page);
    return;
  }

  await hireBtn.click();
  const hireDialog = page.getByRole("dialog", { name: /Hire this candidate/i });
  await hireDialog.getByRole("button", { name: "Hire", exact: true }).click();
  await hireDialog.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => undefined);
  await dismissCareerEmployerNoticeModal(page);
}

/** Runtime guard — write through the same scoped persistence the dashboard reads. */
export async function ensureCareerCircuitPostInStorage(page: Page): Promise<void> {
  const writeOk = await page.evaluate(
    async ({ ids, employerProfile }) => {
      const { employerSettingsStorage } = await import(
        "/src/features/employer/company/storage/employerSettings.storage.ts"
      );
      employerSettingsStorage.save({
        ...employerSettingsStorage.EMPTY_PROFILE,
        ...employerProfile,
      });

      const { readCareerPosts, writeCareerPosts } = await import(
        "/src/features/employer/careerJobs/helpers/careerPersistence.ts"
      );
      const { tryGetCareerEmployerScopeId } = await import(
        "/src/features/shared/career/careerEmployerScope.ts"
      );

      const seedNow = Date.now();
      const closingDate = seedNow + 30 * 86_400_000;
      const employerScope = tryGetCareerEmployerScopeId() ?? "ML-E2E-EMP-AAA1";

      const post = {
        id: ids.postId,
        employerId: employerScope,
        companyName: ids.companyName,
        jobTitle: ids.jobTitle,
        department: "Operations",
        jobType: "full-time" as const,
        workMode: "on-site" as const,
        location: "City A",
        vacancies: 1,
        probationPeriod: "none" as const,
        salaryMin: 25000,
        salaryMax: 35000,
        salaryPeriod: "monthly" as const,
        noticePeriodDays: 0,
        experienceMin: 0,
        experienceMax: 3,
        qualifications: ["Graduate"],
        skills: ["Operations", "Communication"],
        description: "Circuit baseline career post for E2E professional funnel audit.",
        responsibilities: ["Daily operations", "Team coordination"],
        interviewRounds: 1,
        roundConfigs: [{ round: 1, label: "Screening", mode: "phone" as const }],
        status: "active" as const,
        createdAt: seedNow,
        updatedAt: seedNow,
        closingDate,
        screeningQuestions: [] as [],
        isTemplate: false,
        totalApplications: 0,
        shortlisted: 0,
        inInterview: 0,
        offered: 0,
        hired: 0,
        rejected: 0,
      };

      const existing = readCareerPosts();
      const next = existing.some((item) => item.id === ids.postId)
        ? existing
        : [post, ...existing];
      const result = writeCareerPosts(next);
      if (!result.ok) return false;

      const payload = JSON.stringify(next);
      localStorage.setItem("wm_employer_career_posts_v1", payload);
      localStorage.setItem(`wm_employer_${employerScope}_career_posts_v1`, payload);
      localStorage.setItem(`wm_employer_${employerScope}_career_posts_v1__migrated_v1`, "1");
      for (const key of Object.keys(localStorage)) {
        if (/^wm_employer_.+_career_posts_v1$/.test(key)) {
          localStorage.setItem(key, payload);
          localStorage.setItem(`${key}__migrated_v1`, "1");
        }
      }

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
          employerId: post.employerId,
        },
      ];

      localStorage.setItem("wm_employer_career_posts_v1", JSON.stringify(next));
      localStorage.setItem(`wm_employer_${employerScope}_career_posts_v1`, JSON.stringify(next));
      localStorage.setItem(`wm_employer_${employerScope}_career_posts_v1__migrated_v1`, "1");
      localStorage.setItem("wm_employee_career_posts_search_v1", JSON.stringify(searchable));
      localStorage.setItem(`wm_employer_${employerScope}_career_search_v1`, JSON.stringify(searchable));
      localStorage.setItem(`wm_employer_${employerScope}_career_search_v1__migrated_v1`, "1");
      window.dispatchEvent(new Event("wm:employer-career-posts-changed"));
      window.dispatchEvent(new Event("wm:employee-career-search-changed"));
      return true;
    },
    { ids: CAREER_CIRCUIT_IDS, employerProfile: E2E_VERIFIED_EMPLOYER_PROFILE },
  );

  if (!writeOk) {
    throw new Error("Career circuit post seed failed — employer scope key unavailable.");
  }
}

const CAREER_POST_ROUTE_WAIT_MS = 20_000;

export async function gotoEmployerCareerPostDashboard(page: Page): Promise<void> {
  await ensureCareerEmployerProfileOnPage(page);
  await ensureCareerCircuitPostInStorage(page);

  const path = `/#/employer/career/post/${CAREER_CIRCUIT_IDS.postId}`;
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(CAREER_CIRCUIT_IDS.postId), {
    timeout: CAREER_POST_ROUTE_WAIT_MS,
  });

  await ensureCareerCircuitPostInStorage(page);
  const jobTitle = page.getByText(CAREER_CIRCUIT_IDS.jobTitle).first();
  if (!(await jobTitle.isVisible().catch(() => false))) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await ensureCareerCircuitPostInStorage(page);
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
    window.dispatchEvent(new Event("wm:employee-career-search-changed"));
    window.dispatchEvent(new Event("wm:pending-actions-changed"));
  });

  await page.locator(".wm-homePage--console").waitFor({ state: "visible", timeout: 15_000 });
  await page.getByTestId("pending-actions-hub").waitFor({ state: "visible", timeout: 15_000 });
  await expandPendingActionsHub(page);
}

/** Compact employee home hub hides rows until the trigger is expanded. */
export async function expandPendingActionsHub(page: Page): Promise<void> {
  const hub = page.getByTestId("pending-actions-hub");
  const isCompact = await hub.getAttribute("data-pending-compact");
  if (isCompact !== "true") return;

  const trigger = hub.locator(".wm-pendingActionsHub__compactTrigger");
  const expanded = await hub.evaluate((node) => node.classList.contains("isExpanded"));
  if (!expanded) {
    await trigger.click({ timeout: 5_000 });
    await hub.evaluate((node) => node.classList.contains("isExpanded"));
  }
}

export async function gotoEmployerHome(page: Page): Promise<void> {
  await page.goto("/#/employer");
  await page.getByRole("button", { name: "Notifications" }).waitFor({ state: "visible" });
}

export function getPendingActionRow(page: Page, actionId: string): Locator {
  return page.getByTestId(`pending-action-row-${actionId}`).first();
}

export function getPendingActionAcceptButton(page: Page, actionId: string): Locator {
  return page.getByTestId(`pending-action-accept-${actionId}`).first();
}

export function getPendingActionDeclineButton(page: Page, actionId: string): Locator {
  return page.getByTestId(`pending-action-decline-${actionId}`).first();
}

/**
 * Pulse breathe on the CTA makes Playwright's stability check hang.
 * Force-click after visible — intentional for E2E against animated halo.
 */
export async function clickPendingActionAccept(page: Page, actionId: string): Promise<void> {
  await expandPendingActionsHub(page);
  const button = getPendingActionAcceptButton(page, actionId);
  await button.waitFor({ state: "visible", timeout: 15_000 });
  await button.click({ force: true });

  // Firefox/WebKit: pulse halo can swallow the first click — retry via service.
  const row = getPendingActionRow(page, actionId);
  const stillVisible = await row.isVisible({ timeout: 2_000 }).catch(() => false);
  if (stillVisible && actionId.startsWith("career-interview-rsvp-")) {
    const jobId = actionId.replace("career-interview-rsvp-", "");
    await page.evaluate(async (id) => {
      const { acceptInterview } =
        await import("/src/features/employee/careerJobs/services/careerInterviewRsvpService.ts");
      acceptInterview(id);
      window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
      window.dispatchEvent(new Event("wm:pending-actions-changed"));
    }, jobId);
  }
}

export async function clickPendingActionDecline(page: Page, actionId: string): Promise<void> {
  await expandPendingActionsHub(page);
  const button = getPendingActionDeclineButton(page, actionId);
  await button.waitFor({ state: "visible", timeout: 15_000 });
  await button.click({ force: true });

  // Firefox: pulse/hub can swallow decline — enforce via RSVP service.
  if (actionId.startsWith("career-interview-rsvp-")) {
    const jobId = actionId.replace("career-interview-rsvp-", "");
    await page.evaluate(async (id) => {
      const { declineInterview } =
        await import("/src/features/employee/careerJobs/services/careerInterviewRsvpService.ts");
      declineInterview(id);
      window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
      window.dispatchEvent(new Event("wm:pending-actions-changed"));
    }, jobId);
  }
}

export async function assertPendingActionAcceptHasPulseHalo(
  page: Page,
  actionId: string,
): Promise<void> {
  await expandPendingActionsHub(page);
  const row = getPendingActionRow(page, actionId);
  await expect(row).toBeVisible({ timeout: 15_000 });

  const acceptButton = getPendingActionAcceptButton(page, actionId);
  await expect(acceptButton).toBeVisible();

  const pulseHalo = row.locator(".wm-breathe, .wm-breathe-static, .wm-breathe-arrival");
  await expect(
    pulseHalo,
    "Pending Actions accept CTA must render Pulse Halo (.wm-breathe*)",
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
