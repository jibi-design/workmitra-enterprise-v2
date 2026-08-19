import { describe, expect, it } from "vitest";
import { filterNearbyPublishedPosts } from "./nearbyPosts.match.js";
import type { ShiftPostRow } from "./types.js";

function post(id: string, pincode: string | null, status: ShiftPostRow["status"] = "active"): ShiftPostRow {
  return {
    id,
    employer_id: "e1",
    job_name: "Shift",
    category: "general",
    status,
    vacancies: 1,
    start_at: new Date(),
    end_at: new Date(Date.now() + 3600_000),
    details: pincode ? { locationPincode: pincode } : {},
    location_pincode: pincode,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

describe("filterNearbyPublishedPosts", () => {
  it("returns empty when the employee has no base pincode", () => {
    expect(
      filterNearbyPublishedPosts({
        workerPincode: "",
        commuteRadiusKm: 15,
        posts: [post("a", "670001")],
      }),
    ).toEqual([]);
  });

  it("matches the same pincode at 0 km", () => {
    const rows = filterNearbyPublishedPosts({
      workerPincode: "670001",
      commuteRadiusKm: 0,
      posts: [post("same", "670001"), post("far", "671121")],
    });
    expect(rows.map((row) => row.id)).toEqual(["same"]);
  });

  it("includes a nearby town when radius grows from 0 km to 15 km", () => {
    const posts = [post("town", "670002")];
    expect(
      filterNearbyPublishedPosts({
        workerPincode: "670001",
        commuteRadiusKm: 0,
        posts,
      }),
    ).toHaveLength(0);
    expect(
      filterNearbyPublishedPosts({
        workerPincode: "670001",
        commuteRadiusKm: 15,
        posts,
      }),
    ).toHaveLength(1);
  });
});
