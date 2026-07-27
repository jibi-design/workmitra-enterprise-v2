import { expect, type Page } from "@playwright/test";

/** Deterministic IDs for the Shift Full Circuit baseline run */
export const SHIFT_CIRCUIT_IDS = {
  postId: "e2e-circuit-post-001",
  companyName: "Circuit Logistics",
  jobName: "Night Warehouse Helper",
  workerMlId: "ML-E2E2-SFT-SHFT",
  workerName: "Circuit Worker",
} as const;

export const SHIFT_CIRCUIT_BROADCAST = "E2E baseline broadcast — report to gate at 18:00";

const SPLASH_SESSION_KEY = "wm_splash_intro_played_v1";

/** Domain data + pulse queue — safe to mirror across dual browser contexts */
export const SHIFT_CIRCUIT_DATA_KEYS = [
  "wm_employer_shift_posts_v1",
  "wm_employee_shift_applications_v1",
  "wm_employee_shift_workspaces_v1",
  "wm_employee_profile_v1",
  "wm:employer-profile",
  "wm_ratings_employer_to_worker_v1",
  "wm_ratings_worker_to_employer_v1",
  "wm_vault_shift_history_v1",
  "wm_pulse_event_queue_v1",
] as const;

/** Bell stores — only sync when the source role authored them (e.g. employer pushBroadcast). */
export const SHIFT_CIRCUIT_NOTIFICATION_KEYS = [
  "wm_employee_notifications_v1",
  "wm_employer_notifications_v1",
] as const;

/** Full mirror set for steps that intentionally copy bell state (broadcast, completion). */
export const SHIFT_CIRCUIT_SHARED_KEYS = [
  ...SHIFT_CIRCUIT_DATA_KEYS,
  ...SHIFT_CIRCUIT_NOTIFICATION_KEYS,
] as const;

const STORAGE_SYNC_EVENTS = [
  "wm:employer-shift-posts-changed",
  "wm:employee-shift-applications-changed",
  "wm:employee-shift-workspaces-changed",
  "wm:employee-notifications-changed",
  "wm:employer-notifications-changed",
  "wm:vault-shift-history-changed",
  "wm:ratings-changed",
  "wm:pulse-event-queue-changed",
] as const;

type CircuitWorkspace = {
  id: string;
  postId: string;
  status: string;
  updates?: Array<{ title?: string; body?: string; kind?: string }>;
};

type CircuitApplication = {
  id: string;
  postId: string;
  status: string;
};

type CircuitNotification = {
  title: string;
  body?: string;
};

export async function initRoleContext(page: Page, role: "employer" | "employee"): Promise<void> {
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
              uniqueId: SHIFT_CIRCUIT_IDS.workerMlId,
              fullName: SHIFT_CIRCUIT_IDS.workerName,
              city: "Kochi",
              skills: ["loading"],
              experience: "fresher",
              languages: ["Malayalam"],
              preferShiftJobs: true,
              preferCareerJobs: false,
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
}

/** Step 1 — seed a single open shift post (no applications yet) into both contexts */
export async function seedShiftCircuitPost(page: Page): Promise<void> {
  const now = Date.now();

  await page.addInitScript(
    ({ ids, seedNow }) => {
      if (sessionStorage.getItem("wm_e2e_shift_circuit_seeded") === "1") {
        return;
      }

      sessionStorage.setItem("wm_e2e_shift_circuit_seeded", "1");

      const posts = [
        {
          id: ids.postId,
          companyName: ids.companyName,
          jobName: ids.jobName,
          category: "Warehouse",
          experience: "helper",
          payPerDay: 900,
          payBasis: "per_day",
          locationName: "Kochi, Kerala",
          locationAddress: "",
          distanceKm: 4,
          startAt: seedNow + 86_400_000,
          endAt: seedNow + 259_200_000,
          description: "Circuit baseline shift post for E2E handshake audit.",
          shiftTiming: "18:00 – 02:00",
          mapsLink: "",
          vacancies: 2,
          waitingBuffer: 1,
          analysisStatus: "not_started",
          shortlistIds: [],
          waitingIds: [],
          confirmedIds: [],
          rejectedIds: [],
          status: "active",
          mustHave: ["Can lift 20kg"],
          goodToHave: ["Forklift license"],
          isHiddenFromSearch: false,
        },
      ];

      localStorage.setItem("wm_employer_shift_posts_v1", JSON.stringify(posts));
      localStorage.removeItem("wm_employee_shift_applications_v1");
      localStorage.removeItem("wm_employee_shift_workspaces_v1");
      localStorage.removeItem("wm_employee_notifications_v1");
      localStorage.removeItem("wm_employer_notifications_v1");
      localStorage.removeItem("wm_vault_shift_history_v1");
      localStorage.removeItem("wm_pulse_event_queue_v1");
    },
    { ids: SHIFT_CIRCUIT_IDS, seedNow: now },
  );
}

type ShiftCircuitSyncOptions = {
  /** When false, bell keys are not copied (prevents clobber after pulse consume on target). */
  readonly includeNotifications?: boolean;
  /** When true, skip pulse-queue change event so the target shell does not race manual consume. */
  readonly skipPulseQueueDispatch?: boolean;
};

export async function syncShiftCircuitStorage(
  source: Page,
  target: Page,
  options: ShiftCircuitSyncOptions = {},
): Promise<void> {
  const includeNotifications = options.includeNotifications ?? true;
  const keys = includeNotifications ? SHIFT_CIRCUIT_SHARED_KEYS : SHIFT_CIRCUIT_DATA_KEYS;
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
    { data: snapshot, events },
  );
}

export async function readEmployeeUnreadCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("wm_employee_notifications_v1");
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

export async function readCircuitNotifications(
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
      .filter((item): item is { title: string; body?: string } => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof (item as { title?: unknown }).title === "string"
        );
      })
      .map((item) => ({ title: item.title, body: item.body }));
  }, key);
}

export async function readCircuitWorkspaces(page: Page): Promise<CircuitWorkspace[]> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("wm_employee_shift_workspaces_v1");
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CircuitWorkspace[]) : [];
  });
}

export async function readCircuitApplications(page: Page): Promise<CircuitApplication[]> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("wm_employee_shift_applications_v1");
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CircuitApplication[]) : [];
  });
}

export function notificationIncludes(
  notifications: CircuitNotification[],
  titlePattern: RegExp,
): boolean {
  return notifications.some((item) => titlePattern.test(item.title));
}

export async function ensureCircuitWorkerIdentity(page: Page): Promise<void> {
  await page.evaluate(({ workerMlId, workerName }) => {
    const profileRaw = localStorage.getItem("wm_employee_profile_v1");
    if (profileRaw) {
      const profile = JSON.parse(profileRaw) as Record<string, unknown>;
      if (!profile.uniqueId) {
        profile.uniqueId = workerMlId;
        localStorage.setItem("wm_employee_profile_v1", JSON.stringify(profile));
      }
    }

    const apps = JSON.parse(
      localStorage.getItem("wm_employee_shift_applications_v1") ?? "[]",
    ) as Array<{ profileSnapshot?: { uniqueId?: string; fullName?: string } }>;

    if (apps[0]) {
      apps[0].profileSnapshot = {
        ...apps[0].profileSnapshot,
        uniqueId: apps[0].profileSnapshot?.uniqueId || workerMlId,
        fullName: apps[0].profileSnapshot?.fullName || workerName,
      };
      localStorage.setItem("wm_employee_shift_applications_v1", JSON.stringify(apps));
    }

    const workspaces = JSON.parse(
      localStorage.getItem("wm_employee_shift_workspaces_v1") ?? "[]",
    ) as Array<{ workerMlId?: string; workerName?: string }>;

    if (workspaces[0]) {
      workspaces[0].workerMlId = workspaces[0].workerMlId || workerMlId;
      workspaces[0].workerName = workspaces[0].workerName || workerName;
      localStorage.setItem("wm_employee_shift_workspaces_v1", JSON.stringify(workspaces));
      window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));
    }
  }, SHIFT_CIRCUIT_IDS);
}

export async function gotoEmployerPostDashboard(page: Page): Promise<void> {
  await page.goto(`/#/employer/shift/post/${SHIFT_CIRCUIT_IDS.postId}`);
  await page.getByText(SHIFT_CIRCUIT_IDS.jobName).first().waitFor({ state: "visible" });
}

export async function gotoEmployeePostApply(page: Page): Promise<void> {
  await page.goto(`/#/employee/shift/post/${SHIFT_CIRCUIT_IDS.postId}`);
  await page.getByText(SHIFT_CIRCUIT_IDS.jobName).first().waitFor({ state: "visible" });
}

export async function consumeShiftCircuitPulse(
  page: Page,
  role: "employer" | "employee",
): Promise<{ consumed: number; chainLength: number }> {
  return page.evaluate(async (pulseRole) => {
    localStorage.setItem("wm:pulse-nav-enabled", "true");
    const navStore = await import("/src/features/pulse/pulseNavStore.ts");
    navStore.usePulseNavStore.setState({ enabled: true });

    const bridge = await import("/src/features/pulse/pulseEventBridge.ts");
    const consumed = bridge.consumeQueuedPulseEventsForRole(pulseRole);

    const store = await import("/src/features/pulse/pulseStore.ts");
    return {
      consumed,
      chainLength: store.usePulseStore.getState().chain.length,
    };
  }, role);
}

/** Sync domain + pulse queue only — never copy bell keys or dispatch queue-changed. */
export async function syncDataOnly(source: Page, target: Page): Promise<void> {
  await syncShiftCircuitStorage(source, target, {
    includeNotifications: false,
    skipPulseQueueDispatch: true,
  });
}

export type ShiftPulseDeliveryResult = {
  readonly consumed: number;
  readonly chainLength: number;
};

export async function syncAndDeliverPulse(
  source: Page,
  target: Page,
  targetRole: "employer" | "employee",
): Promise<ShiftPulseDeliveryResult> {
  await syncDataOnly(source, target);
  return consumeShiftCircuitPulse(target, targetRole);
}

/** @deprecated Use syncAndDeliverPulse — kept for incremental migration */
export const syncAndDeliverShiftCircuitPulse = syncAndDeliverPulse;

const PULSE_ARRIVAL_LOCK_MS = 2500;

/**
 * Pillar 2 robot proof — destination arrival: solid success glow then auto-dim (~2.5s).
 * Requires a mounted PulseNode for `pending-shift-shift-rating` (PendingActionsHub).
 * Advances via store API (not CTA click) so navigation does not unmount the LED mid-lock.
 */
export async function assertPulseArrivalLock(page: Page): Promise<void> {
  await page.evaluate(async () => {
    localStorage.setItem("wm:pulse-nav-enabled", "true");
    const navStore = await import("/src/features/pulse/pulseNavStore.ts");
    navStore.usePulseNavStore.setState({ enabled: true });

    const store = await import("/src/features/pulse/pulseStore.ts");
    store.usePulseStore.getState().setChain(["pending-shift-shift-rating"], {
      severity: "info",
    });
  });

  const pulseHost = page.locator('[data-pulse-node-id="pending-shift-shift-rating"]');
  await expect(pulseHost).toBeVisible({ timeout: 15_000 });
  await expect(pulseHost).toHaveAttribute("data-pulse-active", "true");

  await page.evaluate(async () => {
    const store = await import("/src/features/pulse/pulseStore.ts");
    store.usePulseStore.getState().advanceChain();
  });

  const arrival = page.locator(".wm-led-arrival, .wm-breathe-arrival").first();
  await expect(arrival, "Arrival lock class must mount after destination advance").toBeVisible({
    timeout: 3_000,
  });

  await expect
    .poll(
      async () => {
        return arrival.evaluate((el) => {
          const core = el.querySelector(".wm-led__core") ?? el;
          return Number.parseFloat(window.getComputedStyle(core).opacity);
        });
      },
      { timeout: 1_500, message: "Arrival glow must start solid (opacity ~1)" },
    )
    .toBeGreaterThan(0.85);

  await expect
    .poll(
      async () => {
        const count = await page.locator(".wm-led-arrival, .wm-breathe-arrival").count();
        if (count === 0) return 0;
        return arrival.evaluate((el) => {
          const core = el.querySelector(".wm-led__core") ?? el;
          return Number.parseFloat(window.getComputedStyle(core).opacity);
        });
      },
      {
        timeout: PULSE_ARRIVAL_LOCK_MS + 1_500,
        message: `Arrival lock must auto-fade by ~${PULSE_ARRIVAL_LOCK_MS}ms`,
      },
    )
    .toBeLessThan(0.08);
}
