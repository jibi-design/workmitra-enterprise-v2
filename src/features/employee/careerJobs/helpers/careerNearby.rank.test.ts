import { describe, expect, it } from "vitest";
import { rankCareerPostsForRecommended } from "./careerNearby.rank";
import type { CareerSearchPost } from "./careerSearchTypes";

function post(id: string, locationPincode?: string): CareerSearchPost {
  return {
    id,
    companyName: "Co",
    jobTitle: id,
    department: "",
    jobType: "full-time",
    workMode: "on-site",
    location: "must-not-matter",
    locationPincode,
    salaryMin: 0,
    salaryMax: 0,
    salaryPeriod: "monthly",
    experienceMin: 0,
    experienceMax: 0,
    qualifications: [],
    skills: [],
    description: "",
    responsibilities: [],
    interviewRounds: 1,
    closingDate: Date.now() + 86_400_000,
    createdAt: Date.now(),
  };
}

describe("rankCareerPostsForRecommended", () => {
  it("keeps server nearby id order when provided", () => {
    const ranked = rankCareerPostsForRecommended({
      posts: [post("a", "670001"), post("b", "670001")],
      workerPincode: "670001",
      commuteRadiusKm: 10,
      nearbyIds: ["b", "a"],
    });
    expect(ranked.map((row) => row.id)).toEqual(["b", "a"]);
  });

  it("keeps posts without a work area code on the recommended feed", () => {
    const ranked = rankCareerPostsForRecommended({
      posts: [post("anywhere"), post("hit", "670001")],
      workerPincode: "670001",
      commuteRadiusKm: 10,
    });
    expect(ranked.map((row) => row.id)).toEqual(["hit", "anywhere"]);
  });

  it("matches the same work area code locally without dates", () => {
    const ranked = rankCareerPostsForRecommended({
      posts: [post("miss", "110001"), post("hit", "670001")],
      workerPincode: "670001",
      commuteRadiusKm: 10,
    });
    expect(ranked.map((row) => row.id)).toEqual(["hit"]);
  });
});
