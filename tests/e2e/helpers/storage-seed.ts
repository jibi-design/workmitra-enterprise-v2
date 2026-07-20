import type { Page } from "@playwright/test";

/** Storage keys aligned with employerShift.keys.ts / shiftWorkspaceStorage.ts */
export const STORAGE_KEYS = {
  roleSession: "wm_role_session_v1",
  employerPosts: "wm_employer_shift_posts_v1",
  employeeApps: "wm_employee_shift_applications_v1",
  workspaces: "wm_employee_shift_workspaces_v1",
} as const;

export const E2E_IDS = {
  postId: "e2e-post-001",
  appApplied: "e2e-app-applied-001",
  appApplied2: "e2e-app-applied-002",
  appShortlisted: "e2e-app-shortlisted-001",
  workspaceId: "e2e-ws-001",
} as const;

const WORKSPACES_CHANGED = "wm:employee-shift-workspaces-changed";

type SeedOptions = {
  /** Include applied applications so KPI Applied tile is clickable */
  withAppliedApps?: boolean;
  /** Include a completed workspace missing employer rating (PendingActionsHub) */
  withPendingReview?: boolean;
  /** Seed global availability pool (Phase 1 — does not surface on employer home) */
  availabilityBroadcasts?: Array<{
    workerWmId: string;
    workerName: string;
    selectedDates: string[];
  }>;
  /** Override seeded post startAt to local midnight of this ISO date (YYYY-MM-DD) */
  postStartIso?: string;
};

/**
 * Seeds deterministic demo data into localStorage + sessionStorage before navigation.
 * Uses applications storage for Applied counts (immune to post-sync stripping).
 */
export async function seedEmployerShiftDemo(
  page: Page,
  options: SeedOptions = { withAppliedApps: true },
): Promise<void> {
  const now = Date.now();

  await page.addInitScript(
    ({ keys, ids, opts, seedNow }) => {
      sessionStorage.setItem(keys.roleSession, "employer");

      const posts = [
        {
          id: ids.postId,
          companyName: "E2E Demo Corp",
          jobName: "Warehouse Helper",
          category: "Warehouse",
          experience: "helper",
          payPerDay: 800,
          payBasis: "per_day",
          locationName: "Kochi, Kerala",
          locationAddress: "",
          distanceKm: 5,
          startAt: opts.postStartIso
            ? new Date(`${opts.postStartIso}T09:00:00`).getTime()
            : seedNow + 86_400_000,
          endAt: seedNow + 172_800_000,
          description: "",
          shiftTiming: "",
          mapsLink: "",
          vacancies: 5,
          waitingBuffer: 2,
          analysisStatus: "not_started",
          shortlistIds: opts.withAppliedApps ? [ids.appShortlisted] : [],
          waitingIds: [],
          confirmedIds: [],
          rejectedIds: [],
          status: "active",
          mustHave: ["Can lift 20kg"],
          goodToHave: ["Forklift license"],
          isHiddenFromSearch: false,
        },
      ];

      const apps = opts.withAppliedApps
        ? [
            {
              id: ids.appApplied,
              postId: ids.postId,
              createdAt: seedNow - 3_600_000,
              status: "applied",
              mustHaveAnswers: {},
              goodToHaveAnswers: {},
              notes: {},
              profileSnapshot: {
                uniqueId: "WM-E2E-001",
                fullName: "Rahul Kumar",
                city: "Kochi",
                experience: "fresher_ok",
                skills: ["loading"],
              },
            },
            {
              id: ids.appApplied2,
              postId: ids.postId,
              createdAt: seedNow - 7_200_000,
              status: "applied",
              mustHaveAnswers: {},
              goodToHaveAnswers: {},
              notes: {},
              profileSnapshot: {
                uniqueId: "WM-E2E-003",
                fullName: "Arjun Nair",
                city: "Ernakulam",
                experience: "helper",
                skills: ["forklift"],
              },
            },
            {
              id: ids.appShortlisted,
              postId: ids.postId,
              createdAt: seedNow - 5_400_000,
              status: "shortlisted",
              mustHaveAnswers: {},
              goodToHaveAnswers: {},
              notes: {},
              profileSnapshot: {
                uniqueId: "WM-E2E-002",
                fullName: "Sanjay Pillai",
                city: "Kochi",
                experience: "experienced",
                skills: ["warehouse"],
              },
            },
          ]
        : [];

      localStorage.setItem(keys.employerPosts, JSON.stringify(posts));
      localStorage.setItem(keys.employeeApps, JSON.stringify(apps));

      if (opts.availabilityBroadcasts?.length) {
        const pool = opts.availabilityBroadcasts.map((entry) => ({
          workerWmId: entry.workerWmId,
          workerName: entry.workerName,
          selectedDates: entry.selectedDates,
          broadcastAt: seedNow,
          expiresAt: seedNow + 172_800_000,
        }));
        localStorage.setItem("wm_all_availability_broadcasts_v1", JSON.stringify(pool));
      }

      if (opts.withPendingReview) {
        const workspaces = [
          {
            id: ids.workspaceId,
            postId: ids.postId,
            appId: ids.appShortlisted,
            workerWmId: "WM-E2E-002",
            workerName: "Sanjay Pillai",
            companyName: "E2E Demo Corp",
            jobName: "Warehouse Helper",
            category: "other",
            locationName: "Kochi, Kerala",
            startAt: seedNow - 172_800_000,
            endAt: seedNow - 86_400_000,
            status: "completed",
            lastActivityAt: seedNow - 86_400_000,
            unreadCount: 0,
            updates: [],
          },
        ];
        localStorage.setItem(keys.workspaces, JSON.stringify(workspaces));
      } else {
        localStorage.removeItem(keys.workspaces);
      }
    },
    {
      keys: STORAGE_KEYS,
      ids: E2E_IDS,
      opts: {
        withAppliedApps: options.withAppliedApps ?? true,
        withPendingReview: options.withPendingReview ?? false,
        availabilityBroadcasts: options.availabilityBroadcasts ?? [],
        postStartIso: options.postStartIso,
      },
      seedNow: now,
    },
  );
}

/** Inject pending review workspace after page load (for zero-state → visible hub test). */
export async function injectPendingReviewWorkspace(page: Page): Promise<void> {
  const now = Date.now();

  await page.evaluate(
    ({ keys, ids, eventName, seedNow }) => {
      const workspaces = [
        {
          id: ids.workspaceId,
          postId: ids.postId,
          appId: ids.appShortlisted,
          workerWmId: "WM-E2E-002",
          workerName: "Sanjay Pillai",
          companyName: "E2E Demo Corp",
          jobName: "Warehouse Helper",
          category: "other",
          locationName: "Kochi, Kerala",
          startAt: seedNow - 172_800_000,
          endAt: seedNow - 86_400_000,
          status: "completed",
          lastActivityAt: seedNow - 86_400_000,
          unreadCount: 0,
          updates: [],
        },
      ];

      localStorage.setItem(keys.workspaces, JSON.stringify(workspaces));
      window.dispatchEvent(new Event(eventName));
    },
    {
      keys: STORAGE_KEYS,
      ids: E2E_IDS,
      eventName: WORKSPACES_CHANGED,
      seedNow: now,
    },
  );
}

/** Activate pulse chain on the PendingActionsHub CTA (dev Vite module import). */
export async function activatePendingHubPulse(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const mod = await import("/src/features/pulse/pulseStore.ts");
    mod.usePulseStore.getState().setChain(["pending-shift-shift-rating"], {
      severity: "warning",
    });
  });
}

export async function gotoEmployerShiftHome(page: Page): Promise<void> {
  await page.goto("/#/employer/shift");
  await page.getByRole("button", { name: "New Shift" }).waitFor({ state: "visible" });
}

export async function gotoPostDashboard(page: Page): Promise<void> {
  await page.goto(`/#/employer/shift/post/${E2E_IDS.postId}`);
  await page.getByText("Warehouse Helper").first().waitFor({ state: "visible" });
}
