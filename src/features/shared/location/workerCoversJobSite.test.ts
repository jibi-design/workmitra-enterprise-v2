import { describe, expect, it } from "vitest";
import { workerCoversJobSite } from "./workerCoversJobSite";

describe("workerCoversJobSite", () => {
  it("fail-closes when either pincode is missing or invalid", () => {
    expect(
      workerCoversJobSite({
        workerPincode: "",
        commuteRadiusKm: 15,
        jobPincode: "670001",
      }),
    ).toBe(false);
    expect(
      workerCoversJobSite({
        workerPincode: "670001",
        commuteRadiusKm: 15,
        jobPincode: "abc",
      }),
    ).toBe(false);
  });

  it("matches the same pincode even at 0 km", () => {
    expect(
      workerCoversJobSite({
        workerPincode: "670001",
        commuteRadiusKm: 0,
        jobPincode: "670001",
      }),
    ).toBe(true);
  });

  it("does not match a distant district inside 15 km", () => {
    expect(
      workerCoversJobSite({
        workerPincode: "670001",
        commuteRadiusKm: 15,
        jobPincode: "671121",
      }),
    ).toBe(false);
  });

  it("matches a nearby town when radius covers the centroid distance", () => {
    expect(
      workerCoversJobSite({
        workerPincode: "670001",
        commuteRadiusKm: 15,
        jobPincode: "670002",
      }),
    ).toBe(true);
  });
});
