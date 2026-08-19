/**
 * Server matching scale proof: 50 employers × 100 employees across Kerala town pins.
 * Uses the same functions as workers-radar + nearby-posts APIs. No GPS. Fail-closed.
 */
import { describe, expect, it } from "vitest";
import { PINCODE_TOWN_CENTROIDS } from "../location/pincodeTownCentroids.js";
import { workerCoversJobSite } from "../location/workerCoversJobSite.js";
import { countWorkersCoveringJobSite } from "./availability.match.js";
import { filterNearbyPublishedPosts } from "./nearbyPosts.match.js";
import type { AvailabilityBroadcastRecord } from "./availability.types.js";
import type { ShiftPostRow } from "./types.js";

const TOWNS = Object.keys(PINCODE_TOWN_CENTROIDS);
const RADII = [0, 5, 10, 15] as const;
const EMPLOYER_COUNT = 50;
const WORKER_COUNT = 100;

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Employer = { id: string; pincode: string | null };
type Worker = { id: string; pincode: string | null; radius: (typeof RADII)[number] };

function buildEmployers(): Employer[] {
  return Array.from({ length: EMPLOYER_COUNT }, (_, i) => ({
    id: `emp-${String(i + 1).padStart(2, "0")}`,
    pincode: i >= EMPLOYER_COUNT - 2 ? null : TOWNS[i % TOWNS.length] ?? null,
  }));
}

function buildWorkers(): Worker[] {
  return Array.from({ length: WORKER_COUNT }, (_, i) => ({
    id: `wkr-${String(i + 1).padStart(3, "0")}`,
    pincode: i >= WORKER_COUNT - 10 ? null : TOWNS[i % TOWNS.length] ?? null,
    radius: RADII[i % RADII.length] ?? 10,
  }));
}

function toBroadcast(worker: Worker, iso: string): AvailabilityBroadcastRecord {
  return {
    workerUserId: worker.id,
    workerMlId: worker.id,
    selectedDates: [iso],
    basePincode: worker.pincode,
    commuteRadiusKm: worker.radius,
    expiresAt: Date.now() + 86_400_000,
    updatedAt: Date.now(),
  };
}

function toPost(employer: Employer): ShiftPostRow {
  const now = new Date();
  return {
    id: `post-${employer.id}`,
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

function oracle(worker: Worker, jobPincode: string | null): boolean {
  return workerCoversJobSite({
    workerPincode: worker.pincode,
    commuteRadiusKm: worker.radius,
    jobPincode,
  });
}

describe("location matching scale — 50 employers × 100 employees", () => {
  const iso = todayIso();
  const employers = buildEmployers();
  const workers = buildWorkers();
  const broadcasts = workers.map((worker) => toBroadcast(worker, iso));
  const posts = employers.map(toPost);

  it("seeds 50 employers and 100 employees across distinct town pincodes", () => {
    expect(employers).toHaveLength(50);
    expect(workers).toHaveLength(100);
    expect(new Set(TOWNS).size).toBeGreaterThanOrEqual(20);
    expect(employers.filter((row) => !row.pincode)).toHaveLength(2);
    expect(workers.filter((row) => !row.pincode)).toHaveLength(10);
  });

  it("employer radar counts only workers whose commute covers that job pincode", () => {
    const radar = employers.map((employer) => ({
      employerId: employer.id,
      pincode: employer.pincode,
      count: countWorkersCoveringJobSite({
        broadcasts,
        jobPincode: employer.pincode,
        isoDate: iso,
      }),
      expected: workers.filter((worker) => oracle(worker, employer.pincode)).length,
    }));

    for (const row of radar) {
      expect(row.count, `${row.employerId} pin=${row.pincode}`).toBe(row.expected);
    }

    const noPin = radar.filter((row) => !row.pincode);
    expect(noPin).toHaveLength(2);
    expect(noPin.every((row) => row.count === 0)).toBe(true);

    const matched = radar.reduce((sum, row) => sum + row.count, 0);
    expect(matched).toBeGreaterThan(0);
    expect(matched).toBeLessThan(EMPLOYER_COUNT * WORKER_COUNT);

    const kannur = countWorkersCoveringJobSite({
      broadcasts,
      jobPincode: "670001",
      isoDate: iso,
    });
    const kasargod = countWorkersCoveringJobSite({
      broadcasts,
      jobPincode: "671121",
      isoDate: iso,
    });
    const trivandrum = countWorkersCoveringJobSite({
      broadcasts,
      jobPincode: "695001",
      isoDate: iso,
    });
    expect(kannur).not.toBe(kasargod);
    expect(kannur).not.toBe(trivandrum);
    expect(kasargod).not.toBe(trivandrum);

    // eslint-disable-next-line no-console -- scale proof numbers for operator report
    console.log(
      `scale-proof pairs=${EMPLOYER_COUNT * WORKER_COUNT} matched=${matched} unmatched=${EMPLOYER_COUNT * WORKER_COUNT - matched} kannur=${kannur} kasargod=${kasargod} tvm=${trivandrum}`,
    );
  });

  it("employee nearby feed only shows posts their radius covers", () => {
    for (const worker of workers) {
      const nearby = filterNearbyPublishedPosts({
        posts,
        workerPincode: worker.pincode,
        commuteRadiusKm: worker.radius,
      });
      const expectedIds = posts
        .filter((post) => oracle(worker, post.location_pincode))
        .map((post) => post.id)
        .sort();
      expect(nearby.map((post) => post.id).sort(), worker.id).toEqual(expectedIds);
      if (!worker.pincode) expect(nearby).toEqual([]);
    }
  });

  it("far cities stay isolated at 0 km; same pin always matches", () => {
    const kannur0: Worker = { id: "iso-kannur", pincode: "670001", radius: 0 };
    const kasargod0: Worker = { id: "iso-ksd", pincode: "671121", radius: 0 };
    const tvm0: Worker = { id: "iso-tvm", pincode: "695001", radius: 0 };

    expect(oracle(kannur0, "670001")).toBe(true);
    expect(oracle(kannur0, "670002")).toBe(false);
    expect(oracle(kannur0, "671121")).toBe(false);
    expect(oracle(kannur0, "695001")).toBe(false);
    expect(oracle(kannur0, "682001")).toBe(false);
    expect(oracle(kasargod0, "670001")).toBe(false);
    expect(oracle(tvm0, "670001")).toBe(false);

    const kannur15: Worker = { id: "iso-kannur-15", pincode: "670001", radius: 15 };
    expect(oracle(kannur15, "670002")).toBe(true);
    expect(oracle(kannur15, "671121")).toBe(false);
    expect(oracle(kannur15, "695001")).toBe(false);
  });

  it("radar payload is a blind count — no worker ids in the match result", () => {
    const result = {
      count: countWorkersCoveringJobSite({
        broadcasts,
        jobPincode: "670001",
        isoDate: iso,
      }),
    };
    expect(Object.keys(result)).toEqual(["count"]);
    expect(JSON.stringify(result)).not.toContain("wkr-");
    expect(JSON.stringify(result)).not.toContain("Hidden");
  });
});
