import { describe, expect, it } from "vitest";
import {
  computeCandidateMetrics,
  computeMatchPercent,
  computeProfileCompleteness,
  mapApplicationStatus,
} from "./candidateDashboard.helpers";
import type { AppLite } from "../../careerJobs/types/careerApplicationTypes";
import type { CareerSearchPost } from "../../careerJobs/helpers/careerSearchTypes";
import type { EmployeeProfile } from "../../profile/storage/employeeProfile.storage";

function app(partial: Partial<AppLite> & Pick<AppLite, "id" | "jobId" | "stage">): AppLite {
  return {
    appliedAt: 1,
    updatedAt: 2,
    currentRound: 0,
    totalPassed: 0,
    totalScheduled: 0,
    employeeName: "A",
    coverNote: "",
    noticePeriod: "Immediate",
    expectedSalary: 0,
    ...partial,
  };
}

describe("candidateDashboard.helpers", () => {
  it("maps stages to pipeline badges", () => {
    expect(mapApplicationStatus("applied")).toBe("In Review");
    expect(mapApplicationStatus("shortlisted")).toBe("Shortlisted");
    expect(mapApplicationStatus("interview")).toBe("Interview");
  });

  it("counts metrics from apps + saved", () => {
    const metrics = computeCandidateMetrics(
      [
        app({ id: "1", jobId: "j1", stage: "applied" }),
        app({ id: "2", jobId: "j2", stage: "shortlisted" }),
        app({ id: "3", jobId: "j3", stage: "interview", totalScheduled: 1 }),
      ],
      4,
    );
    expect(metrics).toEqual({ applied: 3, shortlisted: 1, interviews: 1, saved: 4 });
  });

  it("scores match percent from overlapping skills", () => {
    const profile = {
      fullName: "Test",
      city: "City A",
      skills: ["React", "TypeScript"],
      experience: "1-3" as const,
      languages: ["en"],
      preferShiftJobs: false,
      preferCareerJobs: true,
      availability: {
        weekdays: true,
        weekends: false,
        morning: true,
        afternoon: true,
        evening: false,
      },
    } satisfies EmployeeProfile;
    const post = {
      id: "p1",
      companyName: "Co",
      jobTitle: "FE",
      department: "Eng",
      jobType: "full-time",
      workMode: "hybrid",
      location: "City A",
      salaryMin: 1,
      salaryMax: 2,
      salaryPeriod: "yearly",
      experienceMin: 1,
      experienceMax: 3,
      qualifications: [],
      skills: ["React", "Node"],
      description: "",
      responsibilities: [],
      interviewRounds: 1,
      closingDate: Date.now() + 1e9,
      createdAt: Date.now(),
    } satisfies CareerSearchPost;
    expect(computeMatchPercent(profile, post)).toBeGreaterThan(40);
  });

  it("reports missing profile fields", () => {
    const result = computeProfileCompleteness({
      fullName: "",
      city: "",
      skills: [],
      experience: "fresher",
      languages: [],
      preferShiftJobs: true,
      preferCareerJobs: true,
      availability: {
        weekdays: true,
        weekends: false,
        morning: true,
        afternoon: false,
        evening: false,
      },
    });
    expect(result.percent).toBeLessThan(50);
    expect(result.missing.length).toBeGreaterThan(0);
  });
});
