import { describe, expect, it } from "vitest";
import {
  CAREER_COMMUTE_ANYWHERE,
  parseCareerCommuteRadius,
} from "./careerCommuteRadius";
import { careerWorkerCoversJobSite } from "./careerCoversJobSite";
import { workerCoversJobSite } from "./workerCoversJobSite";

describe("parseCareerCommuteRadius", () => {
  it("accepts 10, 25, 50, and Anywhere", () => {
    expect(parseCareerCommuteRadius(10)).toBe(10);
    expect(parseCareerCommuteRadius(25)).toBe(25);
    expect(parseCareerCommuteRadius(50)).toBe(50);
    expect(parseCareerCommuteRadius(-1)).toBe(CAREER_COMMUTE_ANYWHERE);
    expect(parseCareerCommuteRadius("anywhere")).toBe(CAREER_COMMUTE_ANYWHERE);
  });

  it("defaults unknown values to 10", () => {
    expect(parseCareerCommuteRadius(15)).toBe(10);
    expect(parseCareerCommuteRadius("all-india")).toBe(10);
  });
});

describe("careerWorkerCoversJobSite", () => {
  it("fail-closes when a work area code is missing", () => {
    expect(
      careerWorkerCoversJobSite({
        workerPincode: "",
        commuteRadiusKm: CAREER_COMMUTE_ANYWHERE,
        jobPincode: "670001",
      }),
    ).toBe(false);
  });

  it("keeps 25 km on Career while Shift clamps unknown 25 to 10", () => {
    expect(parseCareerCommuteRadius(25)).toBe(25);
    expect(
      workerCoversJobSite({
        workerPincode: "670001",
        commuteRadiusKm: 25,
        jobPincode: "670001",
      }),
    ).toBe(true);
  });

  it("Anywhere matches any two valid work area codes without dates", () => {
    expect(
      careerWorkerCoversJobSite({
        workerPincode: "670001",
        commuteRadiusKm: CAREER_COMMUTE_ANYWHERE,
        jobPincode: "110001",
      }),
    ).toBe(true);
  });
});
