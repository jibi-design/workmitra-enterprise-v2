import { describe, expect, it } from "vitest";
import { filterPostsNearWorker } from "./nearbyJobs.filter";

describe("filterPostsNearWorker", () => {
  it("returns empty when the employee has no base pincode", () => {
    expect(
      filterPostsNearWorker({
        workerPincode: "",
        commuteRadiusKm: 15,
        posts: [{ id: "a", locationPincode: "670001" }],
      }),
    ).toEqual([]);
  });

  it("keeps an exact pincode match at 0 km", () => {
    const rows = filterPostsNearWorker({
      workerPincode: "670001",
      commuteRadiusKm: 0,
      posts: [
        { id: "same", locationPincode: "670001" },
        { id: "far", locationPincode: "671121" },
      ],
    });
    expect(rows.map((row) => row.id)).toEqual(["same"]);
  });

  it("adds a nearby town after radius grows from 0 km to 15 km", () => {
    const posts = [{ id: "town", locationPincode: "670002" }];
    expect(
      filterPostsNearWorker({
        workerPincode: "670001",
        commuteRadiusKm: 0,
        posts,
      }),
    ).toHaveLength(0);
    expect(
      filterPostsNearWorker({
        workerPincode: "670001",
        commuteRadiusKm: 15,
        posts,
      }),
    ).toHaveLength(1);
  });
});
