/**
 * Phase 1 — Candidate Availability ↔ Employer Sync (radar / badge / nearby).
 * Run: npm test -- src/tests/phase1.availabilitySync.case1.test.ts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  availabilityStorage,
  getRolling7Days,
} from "../features/employee/shiftJobs/storage/availabilityStorage";
import {
  ALL_KEY,
  BROADCAST_KEY,
  CHANGED,
} from "../features/employee/shiftJobs/storage/availabilityStorage.helpers";
import {
  readLocalWorkersRadarMetricsSnapshot,
  subscribeLocalWorkersRadarMetrics,
} from "../features/employer/shiftJobs/helpers/localWorkersRadar.helpers";
import { favoritesStorage } from "../features/employer/shiftJobs/storage/favoritesStorage";
import { employerSettingsStorage } from "../features/employer/company/storage/employerSettings.storage";

const WORKER_ML_ID = "ML_QA_CASE1_WORKER";
const WORKER_NAME = "QA Case1 Worker";
const CITY = "City A";
const PINCODE = "670001";

let profileGetSpy: ReturnType<typeof vi.spyOn> | undefined;

function seedMatchingLocation(): void {
  profileGetSpy?.mockRestore();
  profileGetSpy = vi.spyOn(employerSettingsStorage, "get").mockReturnValue({
    ...employerSettingsStorage.EMPTY_PROFILE,
    locationPincode: PINCODE,
    locationCity: CITY,
  });
}

function workerLocation() {
  return { city: CITY, basePincode: PINCODE, commuteRadius: 15 as const };
}

function clearAvailabilityKeys(): void {
  profileGetSpy?.mockRestore();
  profileGetSpy = undefined;
  localStorage.removeItem(BROADCAST_KEY);
  localStorage.removeItem(ALL_KEY);
  localStorage.removeItem("wm_employer_shift_favorites_v1");
  localStorage.removeItem("wm_employer_profile_v1");
  localStorage.removeItem("wm_employer_settings_v1");
}

function middayEpochForIso(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0).getTime();
}

describe("Phase 1 — TEST CASE 1: Candidate Availability & Employer Sync", () => {
  beforeEach(() => {
    clearAvailabilityKeys();
  });

  afterEach(() => {
    clearAvailabilityKeys();
  });

  it("dispatches wm:availability-broadcasts-changed on save and clear", () => {
    const rolling = getRolling7Days();
    const dayA = rolling[1]?.iso;
    expect(dayA).toBeTruthy();

    const fires: string[] = [];
    const onChanged = () => fires.push(CHANGED);
    window.addEventListener(CHANGED, onChanged);

    availabilityStorage.saveMyAvailability({
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      selectedDates: [dayA!],
      ...workerLocation(),
    });

    expect(fires.length).toBeGreaterThanOrEqual(1);
    expect(fires[0]).toBe(CHANGED);

    fires.length = 0;
    availabilityStorage.clearMyBroadcast();
    expect(fires.length).toBeGreaterThanOrEqual(1);

    window.removeEventListener(CHANGED, onChanged);
  });

  it("syncs radar + favorite label + nearby count immediately after toggle (no reload)", () => {
    const rolling = getRolling7Days();
    const dayA = rolling[1]!.iso;
    const dayB = rolling[2]!.iso;
    const shiftStartAt = middayEpochForIso(dayA);

    seedMatchingLocation();
    favoritesStorage.addManual({ workerMlId: WORKER_ML_ID, workerName: WORKER_NAME });

    let eventCount = 0;
    const unsubEvent = availabilityStorage.subscribe(() => {
      eventCount += 1;
    });

    let radarNotifyCount = 0;
    const unsubRadar = subscribeLocalWorkersRadarMetrics(() => {
      radarNotifyCount += 1;
    });

    // Baseline — empty pool
    expect(readLocalWorkersRadarMetricsSnapshot()).toEqual({
      totalAvailableCount: 0,
      favoriteAvailableCount: 0,
    });
    expect(availabilityStorage.getAvailabilityDaysLabel(WORKER_ML_ID)).toBeNull();
    expect(availabilityStorage.countWorkersFreeOnIsoDate(dayA)).toBe(0);

    // Employee toggle path (same as ShiftAvailabilityBroadcastCard)
    availabilityStorage.toggleMyDate(dayA, {
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      ...workerLocation(),
    });

    expect(eventCount).toBeGreaterThanOrEqual(1);
    expect(radarNotifyCount).toBeGreaterThanOrEqual(1);

    // a) LocalWorkersRadarCard reader
    const radarAfterSave = readLocalWorkersRadarMetricsSnapshot();
    expect(radarAfterSave.totalAvailableCount).toBe(1);
    expect(radarAfterSave.favoriteAvailableCount).toBe(1);

    // b) FavoriteWorkerAvailabilityBadge reader
    const badgeLabel = availabilityStorage.getAvailabilityDaysLabel(WORKER_ML_ID);
    expect(badgeLabel).toBeTruthy();
    expect(typeof badgeLabel).toBe("string");

    // c) ShiftCreateNearbyAvailabilityCard reader
    expect(availabilityStorage.countWorkersFreeOnIsoDate(dayA)).toBe(1);
    expect(availabilityStorage.countWorkersFreeOnIsoDateNear(dayA, PINCODE)).toBe(1);
    expect(availabilityStorage.isWorkerFreeOnDate(WORKER_ML_ID, shiftStartAt)).toBe(true);

    // Add second day — nearby for dayA still 1; label still present
    availabilityStorage.toggleMyDate(dayB, {
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      ...workerLocation(),
    });
    expect(availabilityStorage.getMySelectedDates().sort()).toEqual([dayA, dayB].sort());
    expect(availabilityStorage.countWorkersFreeOnIsoDate(dayA)).toBe(1);
    expect(availabilityStorage.countWorkersFreeOnIsoDate(dayB)).toBe(1);
    expect(readLocalWorkersRadarMetricsSnapshot().totalAvailableCount).toBe(1);

    unsubEvent();
    unsubRadar();
  });

  it("clears dates and drops radar / badge / nearby counts to 0", () => {
    const dayA = getRolling7Days()[1]!.iso;
    seedMatchingLocation();
    favoritesStorage.addManual({ workerMlId: WORKER_ML_ID, workerName: WORKER_NAME });

    availabilityStorage.saveMyAvailability({
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      selectedDates: [dayA],
      ...workerLocation(),
    });

    expect(readLocalWorkersRadarMetricsSnapshot().totalAvailableCount).toBe(1);
    expect(availabilityStorage.countWorkersFreeOnIsoDate(dayA)).toBe(1);

    let clearEvents = 0;
    const unsub = availabilityStorage.subscribe(() => {
      clearEvents += 1;
    });

    // Empty selection → clearMyBroadcast (card path when last day untoggled)
    availabilityStorage.toggleMyDate(dayA, {
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      ...workerLocation(),
    });

    expect(clearEvents).toBeGreaterThanOrEqual(1);
    expect(availabilityStorage.getMySelectedDates()).toEqual([]);
    expect(availabilityStorage.getAllActive()).toEqual([]);
    expect(readLocalWorkersRadarMetricsSnapshot()).toEqual({
      totalAvailableCount: 0,
      favoriteAvailableCount: 0,
    });
    expect(availabilityStorage.getAvailabilityDaysLabel(WORKER_ML_ID)).toBeNull();
    expect(availabilityStorage.countWorkersFreeOnIsoDate(dayA)).toBe(0);

    unsub();
  });

  it("resolves favorite badge lookup case-insensitively (ML id)", () => {
    const dayA = getRolling7Days()[1]!.iso;
    availabilityStorage.saveMyAvailability({
      workerMlId: "ml_qa_case1_mixed",
      workerName: WORKER_NAME,
      selectedDates: [dayA],
      ...workerLocation(),
    });

    // Employer favorites / UI often normalize to uppercase
    expect(availabilityStorage.getAvailabilityDaysLabel("ML_QA_CASE1_MIXED")).toBeTruthy();
    expect(availabilityStorage.getForWorker("ML_QA_CASE1_MIXED")?.selectedDates).toContain(dayA);
  });

  it("notifies subscribers synchronously (no artificial delay)", () => {
    const dayA = getRolling7Days()[1]!.iso;
    seedMatchingLocation();
    const order: string[] = [];

    const unsub = availabilityStorage.subscribe(() => {
      order.push("subscriber");
      expect(availabilityStorage.countWorkersFreeOnIsoDate(dayA)).toBe(1);
      expect(readLocalWorkersRadarMetricsSnapshot().totalAvailableCount).toBe(1);
    });

    order.push("before-save");
    availabilityStorage.saveMyAvailability({
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      selectedDates: [dayA],
      ...workerLocation(),
    });
    order.push("after-save");

    expect(order).toEqual(["before-save", "subscriber", "after-save"]);
    unsub();
  });

  it("fail-closes radar when employer pincode is missing", () => {
    const dayA = getRolling7Days()[1]!.iso;
    availabilityStorage.saveMyAvailability({
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      selectedDates: [dayA],
      ...workerLocation(),
    });
    expect(readLocalWorkersRadarMetricsSnapshot().totalAvailableCount).toBe(0);
    expect(availabilityStorage.countWorkersFreeOnIsoDateNear(dayA, "")).toBe(0);
  });
});

describe("Phase 1 — radar snapshot cache invalidates on pool write", () => {
  beforeEach(() => {
    clearAvailabilityKeys();
  });

  afterEach(() => {
    clearAvailabilityKeys();
  });

  it("returns a fresh metrics object when pool raw changes", () => {
    const dayA = getRolling7Days()[1]!.iso;
    seedMatchingLocation();
    const before = readLocalWorkersRadarMetricsSnapshot();
    expect(before.totalAvailableCount).toBe(0);

    availabilityStorage.saveMyAvailability({
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      selectedDates: [dayA],
      ...workerLocation(),
    });

    const after = readLocalWorkersRadarMetricsSnapshot();
    expect(after.totalAvailableCount).toBe(1);
    expect(after).not.toBe(before);
  });

  it("returns stable selectedDates reference until broadcast raw changes", () => {
    const dayA = getRolling7Days()[1]!.iso;
    expect(availabilityStorage.getMySelectedDates()).toBe(availabilityStorage.getMySelectedDates());

    availabilityStorage.saveMyAvailability({
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      selectedDates: [dayA],
      ...workerLocation(),
    });

    const a = availabilityStorage.getMySelectedDates();
    const b = availabilityStorage.getMySelectedDates();
    expect(a).toBe(b);
    expect(a).toEqual([dayA]);
  });
});
