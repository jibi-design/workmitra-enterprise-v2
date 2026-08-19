import { describe, expect, it } from "vitest";
import { CAREER_COMMUTE_ANYWHERE } from "../location/careerCommuteRadius.js";
import { countCandidatesCoveringJobSite } from "./candidatesRadar.match.js";
import { filterNearbyCareerPosts } from "./nearbyJobs.match.js";
import type { CareerPostRow } from "./types.js";

function post(patch: Partial<CareerPostRow> & Pick<CareerPostRow, "id">): CareerPostRow {
  return {
    employer_user_id: "er-1",
    title: "Role",
    description: "Desc",
    location: "must-not-leak",
    location_pincode: "670001",
    status: "published",
    details: { locationPincode: "670001", city: "must-not-leak" },
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...patch,
  };
}

describe("career nearby + radar match", () => {
  it("returns empty when the worker has no work area code", () => {
    expect(
      filterNearbyCareerPosts({
        workerPincode: "",
        commuteRadiusKm: 10,
        posts: [post({ id: "a" })],
      }),
    ).toEqual([]);
  });

  it("does not depend on availability dates", () => {
    const rows = filterNearbyCareerPosts({
      workerPincode: "670001",
      commuteRadiusKm: 10,
      posts: [post({ id: "a" })],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("a");
    expect(rows[0]?.distanceKm).toBe(0);
    expect(JSON.stringify(rows)).not.toContain("670001");
    expect(JSON.stringify(rows)).not.toContain("must-not-leak");
  });

  it("counts covering candidates only, never identities", () => {
    expect(
      countCandidatesCoveringJobSite({
        jobPincode: "670001",
        profiles: [
          { userId: "u1", basePincode: "670001", careerCommuteRadiusKm: 10 },
          { userId: "u1", basePincode: "670001", careerCommuteRadiusKm: 10 },
          { userId: "u2", basePincode: null, careerCommuteRadiusKm: CAREER_COMMUTE_ANYWHERE },
        ],
      }),
    ).toBe(1);
  });
});
