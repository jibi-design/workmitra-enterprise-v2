/**
 * Master Testing Roadmap — Phase 2
 * Step 3: Employer Favorites
 * Step 4: Direct Invite Flow (send / pending / decline / accept local path)
 *
 * Run: npm test -- src/tests/phase2.favoritesDirectInvite.test.ts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  availabilityStorage,
  getRolling7Days,
} from "../features/employee/shiftJobs/storage/availabilityStorage";
import {
  ALL_KEY,
  BROADCAST_KEY,
} from "../features/employee/shiftJobs/storage/availabilityStorage.helpers";
import { readLocalWorkersRadarMetricsSnapshot } from "../features/employer/shiftJobs/helpers/localWorkersRadar.helpers";
import { favoritesStorage } from "../features/employer/shiftJobs/storage/favoritesStorage";
import {
  sendShiftDirectInvite,
  acceptShiftDirectInvite,
} from "../features/employer/shiftJobs/services/shiftDirectInvite.service";
import { shiftDirectInviteStorage } from "../features/employer/shiftJobs/storage/shiftDirectInvite.storage";
import {
  EMP_POSTS_KEY,
  EMPLOYEE_APPS_KEY,
  EMPLOYEE_WORKSPACES_KEY,
} from "../features/employer/shiftJobs/storage/employerShift.keys";
import type { ShiftPost } from "../features/employer/shiftJobs/storage/employerShift.types";
import { upsertSiteMembershipTruth } from "../features/shiftOps/storage/siteMembershipTruth.storage";
import { getEmployerShiftPost } from "../features/employer/shiftJobs/storage/employerShift.postActions.crud";
import { employerSettingsStorage } from "../features/employer/company/storage/employerSettings.storage";
import { resolveShiftEmployerScopedKey } from "../features/shared/shift/shiftEmployerScope";

const WORKER_ML_ID = "ML_QA_PHASE2_WORKER";
const WORKER_NAME = "QA Phase2 Worker";
const POST_ID = "qa_phase2_shift_post_1";
const SITE_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const FAV_KEY = "wm_employer_shift_favorites_v1";
const INVITE_KEY = "wm_shift_direct_invites_v1";
const MEMBERSHIP_KEY = "wm_shift_ops_site_membership_truth_v1";
const FAV_CHANGED = "wm:employer-shift-favorites-changed";
const INVITE_CHANGED = "wm:shift-direct-invites-changed";
const PINCODE = "670001";

let profileGetSpy: ReturnType<typeof vi.spyOn> | undefined;

function seedMatchingLocation(): void {
  profileGetSpy?.mockRestore();
  profileGetSpy = vi.spyOn(employerSettingsStorage, "get").mockReturnValue({
    ...employerSettingsStorage.EMPTY_PROFILE,
    locationPincode: PINCODE,
    locationCity: "City A",
  });
}

function workerLocation() {
  return { city: "City A", basePincode: PINCODE, commuteRadius: 15 as const };
}

function makeActivePost(overrides?: Partial<ShiftPost>): ShiftPost {
  const now = Date.now();
  return {
    id: POST_ID,
    companyName: "QA Phase2 Co",
    jobName: "Warehouse Helper",
    category: "general",
    experience: "fresher_ok",
    payPerDay: 900,
    locationName: "City A",
    locationPincode: PINCODE,
    distanceKm: 2,
    startAt: now + 86_400_000,
    endAt: now + 86_400_000 + 8 * 3_600_000,
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
    siteId: SITE_ID,
    settings: {
      backupSlots: 0,
      autoPromoteBackup: false,
      notifyBackup: false,
    },
    ...overrides,
  };
}

function seedPost(post: ShiftPost): void {
  localStorage.setItem(resolveShiftEmployerScopedKey("shift_posts_v1"), JSON.stringify([post]));
  window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
}

function clearPhase2Keys(): void {
  profileGetSpy?.mockRestore();
  profileGetSpy = undefined;
  const extra = [
    resolveShiftEmployerScopedKey("shift_posts_v1"),
    resolveShiftEmployerScopedKey("shift_favorites_v1"),
    resolveShiftEmployerScopedKey("shift_direct_invites_v1"),
    `${resolveShiftEmployerScopedKey("shift_posts_v1")}__migrated_v1`,
    `${resolveShiftEmployerScopedKey("shift_favorites_v1")}__migrated_v1`,
    `${resolveShiftEmployerScopedKey("shift_direct_invites_v1")}__migrated_v1`,
  ];
  for (const key of [
    FAV_KEY,
    INVITE_KEY,
    MEMBERSHIP_KEY,
    EMP_POSTS_KEY,
    EMPLOYEE_APPS_KEY,
    EMPLOYEE_WORKSPACES_KEY,
    BROADCAST_KEY,
    ALL_KEY,
    "wm_employee_notifications_v1",
    "wm_employer_notifications_v1",
    ...extra,
  ]) {
    localStorage.removeItem(key);
  }
}

describe("Phase 2 — Step 3: Employer Favorites", () => {
  beforeEach(() => {
    clearPhase2Keys();
  });

  afterEach(() => {
    clearPhase2Keys();
  });

  it("adds favorite by Mitra Labs ID and fires wm:employer-shift-favorites-changed", () => {
    const fires: string[] = [];
    const onChanged = () => fires.push(FAV_CHANGED);
    window.addEventListener(FAV_CHANGED, onChanged);

    const added = favoritesStorage.addManual({
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
    });

    expect(added).toBe(true);
    expect(favoritesStorage.isFavorite(WORKER_ML_ID)).toBe(true);
    expect(favoritesStorage.find(WORKER_ML_ID)?.workerName).toBe(WORKER_NAME);
    expect(fires.length).toBeGreaterThanOrEqual(1);

    // Duplicate add rejected
    expect(favoritesStorage.addManual({ workerMlId: WORKER_ML_ID, workerName: WORKER_NAME })).toBe(
      false,
    );

    window.removeEventListener(FAV_CHANGED, onChanged);
  });

  it("favoriteAvailableCount rises when favorited worker broadcasts availability", () => {
    const dayA = getRolling7Days()[1]!.iso;
    seedMatchingLocation();
    favoritesStorage.addManual({ workerMlId: WORKER_ML_ID, workerName: WORKER_NAME });

    expect(readLocalWorkersRadarMetricsSnapshot().favoriteAvailableCount).toBe(0);

    availabilityStorage.saveMyAvailability({
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      selectedDates: [dayA],
      ...workerLocation(),
    });

    const metrics = readLocalWorkersRadarMetricsSnapshot();
    expect(metrics.totalAvailableCount).toBe(1);
    expect(metrics.favoriteAvailableCount).toBe(1);
    expect(availabilityStorage.getAvailabilityDaysLabel(WORKER_ML_ID)).toBeTruthy();
  });

  it("removes favorite and drops favoriteAvailableCount while total stays", () => {
    const dayA = getRolling7Days()[1]!.iso;
    seedMatchingLocation();
    favoritesStorage.addManual({ workerMlId: WORKER_ML_ID, workerName: WORKER_NAME });
    availabilityStorage.saveMyAvailability({
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      selectedDates: [dayA],
      ...workerLocation(),
    });

    expect(readLocalWorkersRadarMetricsSnapshot().favoriteAvailableCount).toBe(1);

    favoritesStorage.remove(WORKER_ML_ID);
    expect(favoritesStorage.isFavorite(WORKER_ML_ID)).toBe(false);
    expect(readLocalWorkersRadarMetricsSnapshot()).toEqual({
      totalAvailableCount: 1,
      favoriteAvailableCount: 0,
    });
  });
});

describe("Phase 2 — Step 4: Direct Invite Flow", () => {
  beforeEach(() => {
    clearPhase2Keys();
    seedPost(makeActivePost());
  });

  afterEach(() => {
    clearPhase2Keys();
  });

  it("sendShiftDirectInvite creates pending invite and fires change event", () => {
    const fires: string[] = [];
    const onChanged = () => fires.push(INVITE_CHANGED);
    window.addEventListener(INVITE_CHANGED, onChanged);

    const ok = sendShiftDirectInvite({
      postId: POST_ID,
      workerMlId: WORKER_ML_ID.toLowerCase(),
      workerName: WORKER_NAME,
    });

    expect(ok).toBe(true);
    expect(fires.length).toBeGreaterThanOrEqual(1);

    const pending = shiftDirectInviteStorage.getPendingForWorker(WORKER_ML_ID);
    expect(pending).toHaveLength(1);
    expect(pending[0]?.postId).toBe(POST_ID);
    expect(pending[0]?.status).toBe("pending");
    expect(pending[0]?.workerMlId).toBe(WORKER_ML_ID);

    window.removeEventListener(INVITE_CHANGED, onChanged);
  });

  it("rejects send when post is missing or inactive", () => {
    expect(
      sendShiftDirectInvite({
        postId: "missing_post",
        workerMlId: WORKER_ML_ID,
        workerName: WORKER_NAME,
      }),
    ).toBe(false);

    seedPost(makeActivePost({ status: "cancelled" }));
    expect(
      sendShiftDirectInvite({
        postId: POST_ID,
        workerMlId: WORKER_ML_ID,
        workerName: WORKER_NAME,
      }),
    ).toBe(false);
  });

  it("re-send expires prior pending invite for same worker+post", () => {
    sendShiftDirectInvite({
      postId: POST_ID,
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
    });
    const firstId = shiftDirectInviteStorage.getPendingForWorker(WORKER_ML_ID)[0]!.id;

    sendShiftDirectInvite({
      postId: POST_ID,
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
    });

    const all = shiftDirectInviteStorage.getAll();
    const first = all.find((i) => i.id === firstId);
    expect(first?.status).toBe("expired");
    expect(shiftDirectInviteStorage.getPendingForWorker(WORKER_ML_ID)).toHaveLength(1);
  });

  it("decline removes invite from pending list", () => {
    sendShiftDirectInvite({
      postId: POST_ID,
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
    });
    const inviteId = shiftDirectInviteStorage.getPendingForWorker(WORKER_ML_ID)[0]!.id;

    shiftDirectInviteStorage.markDeclined(inviteId);
    expect(shiftDirectInviteStorage.getPendingForWorker(WORKER_ML_ID)).toHaveLength(0);
    expect(shiftDirectInviteStorage.getAll().find((i) => i.id === inviteId)?.status).toBe(
      "declined",
    );
  });

  it("acceptShiftDirectInvite confirms worker when site membership truth exists (AUTH off)", async () => {
    upsertSiteMembershipTruth({
      siteId: SITE_ID,
      workerMlId: WORKER_ML_ID,
      membershipId: "mem_qa_phase2_1",
      status: "active",
    });

    sendShiftDirectInvite({
      postId: POST_ID,
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
    });
    const inviteId = shiftDirectInviteStorage.getPendingForWorker(WORKER_ML_ID)[0]!.id;

    const result = await acceptShiftDirectInvite({
      inviteId,
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      city: "City A",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.appId).toBeTruthy();
    expect(shiftDirectInviteStorage.getAll().find((i) => i.id === inviteId)?.status).toBe(
      "accepted",
    );

    const post = getEmployerShiftPost(POST_ID);
    expect(post?.confirmedIds).toContain(result.appId);
    expect(shiftDirectInviteStorage.getPendingForWorker(WORKER_ML_ID)).toHaveLength(0);
  });

  it("accept fails when invite is for a different worker", async () => {
    upsertSiteMembershipTruth({
      siteId: SITE_ID,
      workerMlId: WORKER_ML_ID,
      membershipId: "mem_qa_phase2_2",
      status: "active",
    });

    sendShiftDirectInvite({
      postId: POST_ID,
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
    });
    const inviteId = shiftDirectInviteStorage.getPendingForWorker(WORKER_ML_ID)[0]!.id;

    const result = await acceptShiftDirectInvite({
      inviteId,
      workerMlId: "ML_OTHER_WORKER",
      workerName: "Other",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toMatch(/different worker/i);
  });
});
