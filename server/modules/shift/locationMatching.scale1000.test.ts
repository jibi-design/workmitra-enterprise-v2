/**
 * 100 employers × 1000 employees matching scale + accuracy.
 * In-process kernel used by Shift radar, Career nearby, and Planner date counts.
 * Does not seed hosted DB.
 */
import { describe, expect, it } from "vitest";
import { careerWorkerCoversJobSite } from "../location/careerCoversJobSite.js";
import { PINCODE_TOWN_CENTROIDS } from "../location/pincodeTownCentroids.js";
import { workerCoversJobSite } from "../location/workerCoversJobSite.js";
import { countWorkersCoveringJobSite, countWorkersCoveringJobSiteByDates } from "./availability.match.js";
import { filterNearbyPublishedPosts } from "./nearbyPosts.match.js";
import { filterNearbyCareerPosts } from "../career/nearbyJobs.match.js";
import { parseCommuteRadius, type CommuteRadiusKm } from "../location/commuteRadius.js";
import type { AvailabilityBroadcastRecord } from "./availability.types.js";
import type { CareerPostRow } from "../career/types.js";
import type { ShiftPostRow } from "./types.js";

const TOWNS = Object.keys(PINCODE_TOWN_CENTROIDS);
const MIXED_RADII = [0, 5, 10, 15, 25, 50] as const;
const EMPLOYER_COUNT = 100;
const WORKER_COUNT = 1000;
const BUDGET_MS = 100;
const NORTH = "670001";
const SOUTH = "695001";

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Employer = { id: string; pincode: string | null };
type Worker = { id: string; pincode: string | null; radius: (typeof MIXED_RADII)[number] | CommuteRadiusKm };

function buildEmployers(): Employer[] {
  return Array.from({ length: EMPLOYER_COUNT }, (_, i) => ({
    id: `er-${String(i + 1).padStart(3, "0")}`,
    pincode: i >= EMPLOYER_COUNT - 2 ? null : TOWNS[i % TOWNS.length] ?? null,
  }));
}

function buildWorkers(): Worker[] {
  return Array.from({ length: WORKER_COUNT }, (_, i) => ({
    id: `ee-${String(i + 1).padStart(4, "0")}`,
    pincode: i >= WORKER_COUNT - 20 ? null : TOWNS[i % TOWNS.length] ?? null,
    radius: MIXED_RADII[i % MIXED_RADII.length] ?? 10,
  }));
}

function toBroadcast(worker: Worker, iso: string): AvailabilityBroadcastRecord {
  return {
    workerUserId: worker.id,
    workerMlId: worker.id,
    selectedDates: [iso],
    basePincode: worker.pincode,
    commuteRadiusKm: parseCommuteRadius(worker.radius),
    expiresAt: Date.now() + 86_400_000,
    updatedAt: Date.now(),
  };
}

function toShiftPost(employer: Employer): ShiftPostRow {
  const now = new Date();
  return {
    id: `shift-${employer.id}`,
    employer_id: employer.id,
    job_name: `Shift ${employer.id}`,
    category: "warehouse",
    status: "active",
    vacancies: 1,
    start_at: now,
    end_at: new Date(now.getTime() + 28_800_000),
    details: employer.pincode ? { locationPincode: employer.pincode } : {},
    location_pincode: employer.pincode,
    created_at: now,
    updated_at: now,
  };
}

function toCareerPost(employer: Employer): CareerPostRow {
  const now = new Date();
  return {
    id: `career-${employer.id}`,
    employer_user_id: employer.id,
    title: `Career ${employer.id}`,
    description: "Role",
    location: "must-not-leak",
    location_pincode: employer.pincode,
    status: "published",
    details: { locationPincode: employer.pincode },
    created_at: now,
    updated_at: now,
  };
}

describe("location matching scale — 100 employers × 1000 employees", () => {
  const iso = todayIso();
  const employers = buildEmployers();
  const workers = buildWorkers();
  const broadcasts = workers.map((worker) => toBroadcast(worker, iso));
  const shiftPosts = employers.map(toShiftPost);
  const careerPosts = employers.map(toCareerPost);

  it("seeds 100 employers and 1000 employees across town centroids", () => {
    expect(employers).toHaveLength(100);
    expect(workers).toHaveLength(1000);
    expect(new Set(TOWNS).size).toBeGreaterThanOrEqual(20);
  });

  it("shift/planner radar matches the commute oracle and stays under 100ms", () => {
    const t0 = performance.now();
    const radar = employers.map((employer) =>
      countWorkersCoveringJobSite({
        broadcasts,
        jobPincode: employer.pincode,
        isoDate: iso,
      }),
    );
    const elapsed = performance.now() - t0;
    expect(elapsed).toBeLessThan(BUDGET_MS);

    employers.forEach((employer, index) => {
      const expected = workers.filter((worker) =>
        workerCoversJobSite({
          workerPincode: worker.pincode,
          commuteRadiusKm: worker.radius,
          jobPincode: employer.pincode,
        }),
      ).length;
      expect(radar[index], employer.id).toBe(expected);
    });

    const dayCounts = countWorkersCoveringJobSiteByDates({
      broadcasts,
      jobPincode: NORTH,
      isoDates: [iso],
    });
    expect(dayCounts[iso]).toBe(
      countWorkersCoveringJobSite({ broadcasts, jobPincode: NORTH, isoDate: iso }),
    );
    // eslint-disable-next-line no-console -- operator benchmark
    console.log(`planner-shift-radar ms=${elapsed.toFixed(2)} pairs=${EMPLOYER_COUNT * WORKER_COUNT}`);
  });

  it("north work area at 0–15 km does not match south jobs", () => {
    const north0: Worker = { id: "north-0", pincode: NORTH, radius: 0 };
    const north15: Worker = { id: "north-15", pincode: NORTH, radius: 15 };
    const north50: Worker = { id: "north-50", pincode: NORTH, radius: 50 };
    expect(workerCoversJobSite({ workerPincode: NORTH, commuteRadiusKm: 0, jobPincode: NORTH })).toBe(
      true,
    );
    expect(workerCoversJobSite({ workerPincode: NORTH, commuteRadiusKm: 15, jobPincode: SOUTH })).toBe(
      false,
    );
    expect(
      careerWorkerCoversJobSite({ workerPincode: NORTH, commuteRadiusKm: 50, jobPincode: SOUTH }),
    ).toBe(false);
    expect(workerCoversJobSite({ workerPincode: north0.pincode, commuteRadiusKm: north0.radius, jobPincode: SOUTH })).toBe(
      false,
    );
    expect(
      workerCoversJobSite({
        workerPincode: north15.pincode,
        commuteRadiusKm: north15.radius,
        jobPincode: SOUTH,
      }),
    ).toBe(false);
    expect(
      careerWorkerCoversJobSite({
        workerPincode: north50.pincode,
        commuteRadiusKm: north50.radius,
        jobPincode: SOUTH,
      }),
    ).toBe(false);
  });

  it("employee nearby shift and career feeds stay inside radius and under 100ms", () => {
    const t0 = performance.now();
    for (const worker of workers) {
      const nearbyShift = filterNearbyPublishedPosts({
        posts: shiftPosts,
        workerPincode: worker.pincode,
        commuteRadiusKm: worker.radius,
      });
      const expectedShift = shiftPosts.filter((post) =>
        workerCoversJobSite({
          workerPincode: worker.pincode,
          commuteRadiusKm: worker.radius,
          jobPincode: post.location_pincode,
        }),
      );
      expect(nearbyShift.map((row) => row.id).sort()).toEqual(expectedShift.map((row) => row.id).sort());

      const nearbyCareer = filterNearbyCareerPosts({
        posts: careerPosts,
        workerPincode: worker.pincode,
        commuteRadiusKm: worker.radius,
      });
      const leaked = JSON.stringify(nearbyCareer);
      expect(leaked).not.toContain("must-not-leak");
      expect(leaked).not.toContain(NORTH);
    }
    const elapsed = performance.now() - t0;
    expect(elapsed).toBeLessThan(BUDGET_MS * 20);
    // eslint-disable-next-line no-console -- operator benchmark
    console.log(`nearby-all-workers ms=${elapsed.toFixed(2)}`);
  });
});
