/**
 * Stress QA — 50 bulk candidates seed + pulse fan-out.
 * Run: npm test -- src/tests/qaBulkCandidates.stress.test.ts
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  applyQaBulkCandidateSeed,
  buildQaBulkAvailabilityPool,
  buildQaBulkFavorites,
  qaBulkWorkerId,
  QA_BULK_POST_ID,
} from "../features/shared/shift/qaBulkCandidates.seed";
import { availabilityStorage } from "../features/employee/shiftJobs/storage/availabilityStorage";
import { readLocalWorkersRadarMetricsSnapshot } from "../features/employer/shiftJobs/helpers/localWorkersRadar.helpers";
import { favoritesStorage } from "../features/employer/shiftJobs/storage/favoritesStorage";
import { enqueueAvailabilityMatchPulsesForShift } from "../features/employer/shiftJobs/services/shiftAvailabilityMatchPulse.service";
import { sendShiftDirectInvite } from "../features/employer/shiftJobs/services/shiftDirectInvite.service";
import { shiftDirectInviteStorage } from "../features/employer/shiftJobs/storage/shiftDirectInvite.storage";
import { getRolling7Days } from "../features/employee/shiftJobs/storage/availabilityStorage.helpers";
import { shiftAvailabilityPulseQueueStorage } from "../features/employee/shiftJobs/storage/shiftAvailabilityPulseQueue.storage";

describe("QA Stress — 50 bulk candidates", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("builds 50 favorites and ~45 availability broadcasts", () => {
    const favs = buildQaBulkFavorites(50);
    const pool = buildQaBulkAvailabilityPool(50);
    expect(favs).toHaveLength(50);
    expect(pool.length).toBe(45); // every 10th skipped
    expect(favs[24]?.workerMlId).toBe(qaBulkWorkerId(25));
    expect(favs[49]?.workerMlId).toBe(qaBulkWorkerId(50));
  });

  it("applies seed and radar/favorites/badge readers stay consistent", () => {
    const t0 = performance.now();
    const seed = applyQaBulkCandidateSeed(50);
    const applyMs = performance.now() - t0;

    expect(seed.favoriteCount).toBe(50);
    expect(seed.poolCount).toBe(45);
    expect(favoritesStorage.getAll()).toHaveLength(50);

    const t1 = performance.now();
    const radar = readLocalWorkersRadarMetricsSnapshot();
    const radarMs = performance.now() - t1;

    expect(radar.totalAvailableCount).toBe(45);
    expect(radar.favoriteAvailableCount).toBe(45);

    const t2 = performance.now();
    for (let i = 1; i <= 50; i += 1) {
      void availabilityStorage.getAvailabilityDaysLabel(qaBulkWorkerId(i));
    }
    const labelsMs = performance.now() - t2;

    expect(applyMs).toBeLessThan(200);
    expect(radarMs).toBeLessThan(50);
    expect(labelsMs).toBeLessThan(100);
  });

  it("sends direct invites to #25 and #50", () => {
    applyQaBulkCandidateSeed(50);

    expect(
      sendShiftDirectInvite({
        postId: QA_BULK_POST_ID,
        workerMlId: qaBulkWorkerId(25),
        workerName: "Bulk #25",
      }),
    ).toBe(true);

    expect(
      sendShiftDirectInvite({
        postId: QA_BULK_POST_ID,
        workerMlId: qaBulkWorkerId(50),
        workerName: "Bulk #50",
      }),
    ).toBe(true);

    expect(shiftDirectInviteStorage.getPendingForWorker(qaBulkWorkerId(25))).toHaveLength(1);
    expect(shiftDirectInviteStorage.getPendingForWorker(qaBulkWorkerId(50))).toHaveLength(1);

    const invite50 = shiftDirectInviteStorage.getPendingForWorker(qaBulkWorkerId(50))[0]!;
    shiftDirectInviteStorage.markDeclined(invite50.id);
    expect(shiftDirectInviteStorage.getPendingForWorker(qaBulkWorkerId(50))).toHaveLength(0);
  });

  it("enqueues availability match pulses for free workers on publish date", () => {
    applyQaBulkCandidateSeed(50);
    const day1 = getRolling7Days()[1]!.iso;
    const [y, m, d] = day1.split("-").map(Number);
    const startAt = new Date(y, m - 1, d, 9, 0, 0, 0).getTime();

    const t0 = performance.now();
    const enqueued = enqueueAvailabilityMatchPulsesForShift({
      postId: QA_BULK_POST_ID,
      startAt,
      endAt: startAt + 8 * 3_600_000,
    });
    const ms = performance.now() - t0;

    expect(enqueued).toBeGreaterThan(20);
    expect(enqueued).toBeLessThanOrEqual(45);
    expect(ms).toBeLessThan(50);

    // Worker #50 has no broadcast (every 10th skipped) — should not consume a pulse
    expect(shiftAvailabilityPulseQueueStorage.consumeForWorker(qaBulkWorkerId(50))).toBeNull();
  });
});
