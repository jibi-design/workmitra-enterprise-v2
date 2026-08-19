import { expect, type Page } from "@playwright/test";

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
    workerMlId: string;
    workerName: string;
    selectedDates: string[];
    basePincode?: string;
    commuteRadius?: number;
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
          locationName: "City A",
          locationPincode: "670001",
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
                uniqueId: "ML-E2E2-CND-AAA2",
                fullName: "Worker A",
                city: "City A",
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
                uniqueId: "ML-E2E2-CND-AAA4",
                fullName: "Worker B",
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
                uniqueId: "ML-E2E2-CND-AAA3",
                fullName: "Sanjay Pillai",
                city: "City A",
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
          workerMlId: entry.workerMlId,
          workerName: entry.workerName,
          selectedDates: entry.selectedDates,
          broadcastAt: seedNow,
          expiresAt: seedNow + 172_800_000,
          basePincode: entry.basePincode ?? "670001",
          commuteRadius: entry.commuteRadius ?? 15,
        }));
        localStorage.setItem("wm_all_availability_broadcasts_v1", JSON.stringify(pool));
      }

      if (opts.withPendingReview) {
        const workspaces = [
          {
            id: ids.workspaceId,
            postId: ids.postId,
            appId: ids.appShortlisted,
            workerMlId: "ML-E2E2-CND-AAA3",
            workerName: "Sanjay Pillai",
            companyName: "E2E Demo Corp",
            jobName: "Warehouse Helper",
            category: "other",
            locationName: "City A",
            startAt: seedNow - 172_800_000,
            endAt: seedNow - 86_400_000,
            status: "completed",
            lastActivityAt: seedNow - 86_400_000,
            unreadCount: 0,
            updates: [],
          },
        ];
        localStorage.setItem(keys.workspaces, JSON.stringify(workspaces));
        try {
          const scopedKey = `wm_employer_${(JSON.parse(localStorage.getItem("wm_employer_profile_v1") || "{}").uniqueId || "unknown_employer").replace(/[^a-zA-Z0-9_-]/g, "_")}_shift_workspaces_v1`;
          localStorage.setItem(scopedKey, JSON.stringify(workspaces));
        } catch {
          localStorage.setItem(
            "wm_employer_unknown_employer_shift_workspaces_v1",
            JSON.stringify(workspaces),
          );
        }
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
    async ({ ids, seedNow, profile }) => {
      if (!localStorage.getItem("wm_employer_profile_v1")) {
        localStorage.setItem("wm_employer_profile_v1", JSON.stringify(profile));
        localStorage.setItem("wm:employer-profile", JSON.stringify(profile));
      }

      const { saveWorkspaces } =
        await import("/src/features/employer/shiftJobs/storage/shiftWorkspaceStorage.ts");

      const workspaces = [
        {
          id: ids.workspaceId,
          postId: ids.postId,
          appId: ids.appShortlisted,
          workerMlId: "ML-E2E2-CND-AAA3",
          workerName: "Sanjay Pillai",
          companyName: "E2E Demo Corp",
          jobName: "Warehouse Helper",
          category: "other",
          locationName: "City A",
          startAt: seedNow - 172_800_000,
          endAt: seedNow - 86_400_000,
          status: "completed",
          lastActivityAt: seedNow - 86_400_000,
          unreadCount: 0,
          updates: [],
        },
      ];

      saveWorkspaces(workspaces);
      window.dispatchEvent(new Event("wm:pending-actions-changed"));
    },
    {
      ids: E2E_IDS,
      seedNow: now,
      profile: {
        companyName: "E2E Demo Corp",
        locationCity: "City A",
        locationState: "Kerala",
        locationPincode: "670001",
        contactVerified: true,
        uniqueId: "ML-E2E-EMP-AAA1",
        phone: "+919876543210",
        email: "employer@e2e.local",
      },
    },
  );
}

/** Expand compact employer pending banner and open the shift worker review row. */
export async function openEmployerShiftReviewFromHub(page: Page): Promise<void> {
  const banner = page.getByTestId("employer-pending-actions-banner");
  await expect(banner).toBeVisible({ timeout: 15_000 });
  await banner.getByRole("button", { name: /Worker review pending/i }).click();
}

/** Role home — compact PendingActionsHub only renders when review count > 0. */
export async function seedEmployeePendingShiftReview(page: Page): Promise<void> {
  const now = Date.now();
  const workerMlId = "ML-E2E2-EMP-REVW";

  await page.evaluate(
    async ({ seedNow, worker }) => {
      localStorage.setItem(
        "wm_employee_profile_v1",
        JSON.stringify({
          uniqueId: worker.mlId,
          fullName: worker.name,
          city: "City A",
          skills: ["loading"],
          experience: "helper",
          preferShiftJobs: true,
          preferCareerJobs: false,
        }),
      );

      const { writeShiftWorkspaces } =
        await import("/src/features/employee/shiftJobs/storage/shiftWorkspace.persistence.ts");

      writeShiftWorkspaces([
        {
          id: "e2e-emp-review-ws",
          postId: "e2e-post-001",
          appId: "e2e-app-applied-001",
          workerMlId: worker.mlId,
          workerName: worker.name,
          companyName: "E2E Demo Corp",
          jobName: "Warehouse Helper",
          category: "other",
          locationName: "City A",
          startAt: seedNow - 172_800_000,
          endAt: seedNow - 86_400_000,
          status: "completed",
          lastActivityAt: seedNow - 86_400_000,
          unreadCount: 0,
          updates: [],
        },
      ]);
      window.dispatchEvent(new Event("wm:pending-actions-changed"));
    },
    { seedNow: now, worker: { mlId: workerMlId, name: "Review Worker" } },
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
