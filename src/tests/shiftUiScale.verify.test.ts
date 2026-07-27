/**
 * Shift UI scale verification — 500 applicants + virtual list DOM budget.
 * Run: npm test -- src/tests/shiftUiScale.verify.test.ts
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { act } from "react";
import { EmployerShiftCandidateList } from "../features/employer/shiftJobs/components/EmployerShiftCandidateList";
import { ShiftSearchResultsList } from "../features/employee/shiftJobs/components/ShiftSearchResultsList";
import {
  countApplicationsForPostIndexed,
  invalidateAppsByPostIndex,
} from "../features/employer/shiftJobs/helpers/appsByPostIndex";
import { EMPLOYEE_APPS_KEY } from "../features/employer/shiftJobs/helpers/dashboardHelpers.apps";
import type { EmployeeShiftApplication } from "../features/employer/shiftJobs/storage/employerShift.types";
import type { ShiftPostDemo } from "../features/employee/shiftJobs/types/shiftSearch.types";

const POST_ID = "scale_post_500";
const SCALE = 500;

function makeApps(count: number): EmployeeShiftApplication[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `scale_app_${i}`,
    postId: POST_ID,
    status: "applied",
    createdAt: Date.now() - i,
    profileSnapshot: { uniqueId: `WMID_${i}`, fullName: `Worker ${i}` },
    mustHaveAnswers: {},
    goodToHaveAnswers: {},
    notes: {},
  }));
}

function makePosts(count: number): ShiftPostDemo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `scale_search_${i}`,
    companyName: `Co ${i}`,
    jobName: `Role ${i}`,
    category: "general",
    experience: "fresher_ok",
    payPerDay: 500,
    locationName: "City",
    distanceKm: 1,
    startAt: Date.now() + 86_400_000,
    endAt: Date.now() + 172_800_000,
    mustHave: [],
    goodToHave: [],
    vacancies: 2,
    waitingBuffer: 0,
    analysisStatus: "not_started",
    confirmedIds: [],
    shortlistIds: [],
    waitingIds: [],
    rejectedIds: [],
    status: "active",
    settings: { backupSlots: 0, autoPromoteBackup: false, notifyBackup: false },
  }));
}

describe("Shift UI scale @ 500", () => {
  let host: HTMLDivElement;
  let root: Root;
  const snapshot: Record<string, string | null> = {};

  beforeEach(() => {
    snapshot[EMPLOYEE_APPS_KEY] = localStorage.getItem(EMPLOYEE_APPS_KEY);
    invalidateAppsByPostIndex();
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);

    // jsdom lacks layout; give virtualizer a measurable scroll parent size.
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get() {
        return 560;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get() {
        return 560;
      },
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
    if (snapshot[EMPLOYEE_APPS_KEY] == null) localStorage.removeItem(EMPLOYEE_APPS_KEY);
    else localStorage.setItem(EMPLOYEE_APPS_KEY, snapshot[EMPLOYEE_APPS_KEY]);
    invalidateAppsByPostIndex();
  });

  it("indexes 500 apps in O(1) KPI lookups", () => {
    const apps = makeApps(SCALE);
    localStorage.setItem(EMPLOYEE_APPS_KEY, JSON.stringify(apps));
    invalidateAppsByPostIndex();

    const start = performance.now();
    let total = 0;
    for (let i = 0; i < 20; i += 1) {
      total += countApplicationsForPostIndexed(POST_ID, "applied");
    }
    const elapsed = performance.now() - start;

    expect(countApplicationsForPostIndexed(POST_ID, "applied")).toBe(SCALE);
    expect(total).toBe(SCALE * 20);
    expect(elapsed).toBeLessThan(50);
  });

  it("candidate virtual list mounts << 500 DOM cards", async () => {
    const apps = makeApps(SCALE);
    const noop = () => undefined;

    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(EmployerShiftCandidateList, {
            postId: POST_ID,
            useSmartGroups: false,
            appliedApps: apps,
            tabApps: apps,
            tab: "applied",
            priorityTags: {},
            quickQuestions: [],
            compareIds: new Set<string>(),
            onToggleCompare: noop,
            onOpenCompare: noop,
            onPriorityTag: noop,
            onRequestTabChange: noop,
            cardActions: {
              isBusy: false,
              onMoveToShortlist: noop,
              onMoveToWaiting: noop,
              onConfirm: noop,
              onOpenGroup: noop,
              onRemove: noop,
              onReplace: noop,
            },
          }),
        ),
      );
    });

    // Allow virtualizer to measure
    await act(async () => {
      await Promise.resolve();
    });

    const rows = host.querySelectorAll("[data-candidate-row]");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(24);
    expect(rows.length).toBeLessThan(SCALE);
  });

  it("search virtual list mounts << 500 result cards", async () => {
    const posts = makePosts(SCALE);
    const noop = () => undefined;

    await act(async () => {
      root.render(
        createElement(ShiftSearchResultsList, {
          discoverableCount: SCALE,
          filteredPosts: posts,
          hasFilters: false,
          quickApplyEnabled: false,
          appliedIds: new Set<string>(),
          onOpenDetails: noop,
          onQuickApply: noop,
          onClearFilters: noop,
          onOpenProfile: noop,
        }),
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    const cards = host.querySelectorAll("[data-shift-result-card]");
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(24);
    expect(cards.length).toBeLessThan(SCALE);
  });

  it("storage/saga handles 500 concurrent applications without crash", async () => {
    const { runBatch } = await import("./stress-test-simulation");
    const result = await runBatch(SCALE);
    expect(result.scale).toBe(SCALE);
    expect(result.storageQuotaExceeded).toBe(false);
    expect(result.bottleneck).not.toBe("CRASHED");
  }, 60_000);
});
