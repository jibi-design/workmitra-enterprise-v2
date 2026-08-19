import { describe, expect, it } from "vitest";
import { filterPlannerEntriesNearWorker } from "./plannerNearby.filter";
import type { PlannerPublicIndexEntry } from "../../../shared/planner/plannerPublic";

function entry(id: string, locationPincode?: string): PlannerPublicIndexEntry {
  return {
    planId: id,
    planName: id,
    companyName: "Co",
    locationName: "must-not-matter",
    locationPincode,
    category: "Construction",
    experience: "helper",
    dayCount: 1,
    openDayCount: 1,
    payMin: 0,
    payMax: 0,
    slotDates: ["2026-08-20"],
    postIdsByDate: {},
    slotIdsByDate: {},
    payByDate: {},
    workersByDate: {},
    publishedAt: 1,
    status: "active",
    schemaVersion: 1,
  };
}

describe("filterPlannerEntriesNearWorker", () => {
  it("keeps same work area and excludes far sites at 0 km", () => {
    const rows = filterPlannerEntriesNearWorker({
      entries: [entry("near", "670001"), entry("far", "695001"), entry("none")],
      workerPincode: "670001",
      commuteRadiusKm: 0,
    });
    expect(rows.map((row) => row.planId)).toEqual(["near"]);
  });
});
