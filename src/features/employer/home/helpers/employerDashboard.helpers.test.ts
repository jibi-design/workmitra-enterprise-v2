import { describe, expect, it } from "vitest";
import {
  buildEmployerActiveJobs,
  buildEmployerInterviewRows,
  computeEmployerDashMetrics,
  computeEmployerMatchPercent,
  computeEmployerPipelineStageCounts,
  mapEmployerPipelineStage,
} from "./employerDashboard.helpers";
import type { CareerApplication, CareerJobPost } from "../../careerJobs/types/careerTypes";

function post(partial: Partial<CareerJobPost> & Pick<CareerJobPost, "id" | "jobTitle">): CareerJobPost {
  return {
    employerId: "er1",
    companyName: "Acme",
    department: "Eng",
    jobType: "full-time",
    workMode: "hybrid",
    location: "City A",
    vacancies: 1,
    probationPeriod: "3m",
    salaryMin: 1,
    salaryMax: 2,
    salaryPeriod: "yearly",
    experienceMin: 1,
    experienceMax: 3,
    qualifications: [],
    skills: ["React", "TypeScript"],
    description: "",
    responsibilities: [],
    interviewRounds: 1,
    roundConfigs: [],
    status: "active",
    createdAt: 1,
    updatedAt: 2,
    closingDate: Date.now() + 1e8,
    isTemplate: false,
    totalApplications: 0,
    shortlisted: 0,
    inInterview: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
    ...partial,
  };
}

function app(
  partial: Partial<CareerApplication> & Pick<CareerApplication, "id" | "jobId" | "stage">,
): CareerApplication {
  return {
    employeeId: "ee1",
    employeeName: "Alex",
    employeePhone: "123",
    employeeEmail: "a@b.c",
    resumeSummary: "",
    coverNote: "",
    expectedSalary: 0,
    noticePeriod: "Immediate",
    currentRound: 0,
    roundResults: [],
    appliedAt: 1,
    updatedAt: 2,
    employerNotes: "",
    ...partial,
  };
}

describe("employerDashboard.helpers", () => {
  it("maps stages for pipeline badges", () => {
    expect(mapEmployerPipelineStage("applied")).toBe("Applied");
    expect(mapEmployerPipelineStage("shortlisted")).toBe("Shortlisted");
    expect(mapEmployerPipelineStage("hired")).toBe("Hired");
    expect(mapEmployerPipelineStage("rejected")).toBe("Rejected");
  });

  it("computes header metrics", () => {
    const metrics = computeEmployerDashMetrics(
      [post({ id: "p1", jobTitle: "FE", status: "active" }), post({ id: "p2", jobTitle: "BE", status: "draft" })],
      [
        app({ id: "a1", jobId: "p1", stage: "applied" }),
        app({ id: "a2", jobId: "p1", stage: "shortlisted" }),
        app({
          id: "a3",
          jobId: "p1",
          stage: "interview",
          roundResults: [
            {
              round: 1,
              label: "R1",
              status: "scheduled",
              feedback: "",
              interviewMode: "video",
              scheduledDate: "2026-08-10",
              scheduledTime: "10:00",
            },
          ],
        }),
      ],
      "2026-08-10",
    );
    expect(metrics.activePosts).toBe(1);
    expect(metrics.totalApplicants).toBe(3);
    expect(metrics.shortlisted).toBe(1);
    expect(metrics.interviews).toBe(1);
    expect(metrics.todayInterviews).toBe(1);
  });

  it("counts funnel stages and skips rejected", () => {
    const counts = computeEmployerPipelineStageCounts([
      app({ id: "a1", jobId: "p1", stage: "applied" }),
      app({ id: "a2", jobId: "p1", stage: "shortlisted" }),
      app({ id: "a3", jobId: "p1", stage: "interview" }),
      app({ id: "a4", jobId: "p1", stage: "hired" }),
      app({ id: "a5", jobId: "p1", stage: "rejected" }),
    ]);
    expect(counts).toEqual({ Applied: 1, Shortlisted: 1, Interview: 1, Hired: 1 });
  });

  it("scores match percent from overlapping skills", () => {
    const score = computeEmployerMatchPercent(
      post({ id: "p1", jobTitle: "FE" }),
      app({
        id: "a1",
        jobId: "p1",
        stage: "applied",
        profileSnapshot: { skills: ["React", "CSS"], city: "City A" },
      }),
    );
    expect(score).toBeGreaterThan(30);
  });

  it("lists active and draft jobs with applicant counts", () => {
    const rows = buildEmployerActiveJobs([
      post({ id: "p1", jobTitle: "FE", status: "active", totalApplications: 4 }),
      post({ id: "p2", jobTitle: "Draft role", status: "draft", totalApplications: 0 }),
      post({ id: "p3", jobTitle: "Closed", status: "closed", totalApplications: 9 }),
    ]);
    expect(rows.map((r) => r.id)).toEqual(["p1", "p2"]);
    expect(rows[0]?.applicants).toBe(4);
    expect(rows[1]?.status).toBe("draft");
  });

  it("builds scheduled interview rows", () => {
    const p = post({ id: "p1", jobTitle: "FE" });
    const rows = buildEmployerInterviewRows(
      [
        app({
          id: "a1",
          jobId: "p1",
          stage: "interview",
          roundResults: [
            {
              round: 1,
              label: "Screen",
              status: "scheduled",
              feedback: "",
              interviewMode: "phone",
              scheduledDate: "2026-08-12",
              scheduledTime: "09:00",
            },
          ],
        }),
      ],
      new Map([[p.id, p]]),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.roundLabel).toBe("Screen");
  });
});
