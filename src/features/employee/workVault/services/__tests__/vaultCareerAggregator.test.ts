// src/features/employee/workVault/services/__tests__/vaultCareerAggregator.test.ts
// Phase B — Career Aggregator: experience merge, dedup, stats, employment detection.

import { describe, it, expect, beforeEach } from "vitest";
import {
  aggregateCareerExperience,
  aggregateCareerStats,
  aggregateCareerReferences,
  detectCareerEmploymentStatus,
} from "../vaultCareerAggregator";

/* ── Storage Keys ── */
const MINI_HR_KEY = "wm_career_employment_v1";
const FULL_HR_KEY = "wm_employment_lifecycle_v1";
const CAREER_POSTS_KEY = "wm_employer_career_posts_v1";
const CAREER_APPS_KEY = "wm_employee_career_applications_v1";
const CAREER_WS_KEY = "wm_employee_career_workspaces_v1";

/* ── Helpers ── */
function seed(key: string, data: Record<string, unknown>[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

beforeEach(() => { localStorage.clear(); });

/* ═══ Career Experience Aggregation ═══ */
describe("aggregateCareerExperience", () => {
  it("returns empty for no data", () => {
    expect(aggregateCareerExperience()).toEqual([]);
  });

  it("returns Mini-HR completed records", () => {
    seed(MINI_HR_KEY, [{
      careerPostId: "p1", companyName: "Corp", jobTitle: "Dev",
      department: "IT", status: "completed", joinedAt: 1000,
      completedAt: 2000, exitType: "resigned",
    }]);
    const result = aggregateCareerExperience();
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe("Corp");
  });

  it("returns Mini-HR active records", () => {
    seed(MINI_HR_KEY, [{
      careerPostId: "p1", companyName: "Corp", jobTitle: "Dev",
      status: "working", joinedAt: 1000,
    }]);
    const result = aggregateCareerExperience();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("hired");
    expect(result[0].endedAt).toBeNull();
  });

  it("Full HR takes priority over Mini-HR for same postId", () => {
    seed(FULL_HR_KEY, [{
      careerPostId: "p1", companyName: "FullHR Corp", jobTitle: "Senior Dev",
      status: "active", joinedAt: 5000,
    }]);
    seed(MINI_HR_KEY, [{
      careerPostId: "p1", companyName: "MiniHR Corp", jobTitle: "Dev",
      status: "working", joinedAt: 1000,
    }]);
    const result = aggregateCareerExperience();
    // Full HR active comes first in combine order → dedup keeps it
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe("FullHR Corp");
  });

  it("deduplicates by jobId", () => {
    seed(MINI_HR_KEY, [
      { careerPostId: "p1", companyName: "A", jobTitle: "Dev", status: "completed", joinedAt: 1000, completedAt: 2000, exitType: "resigned" },
    ]);
    seed(CAREER_APPS_KEY, [
      { jobId: "p1", stage: "hired", appliedAt: 500 },
    ]);
    seed(CAREER_POSTS_KEY, [
      { id: "p1", companyName: "A", jobTitle: "Dev" },
    ]);
    // p1 is in Mini-HR AND apps fallback — should appear only once
    const result = aggregateCareerExperience();
    expect(result).toHaveLength(1);
  });

  it("includes fallback hired apps not in any employment system", () => {
    seed(CAREER_APPS_KEY, [
      { jobId: "p_fallback", stage: "hired", appliedAt: 500 },
    ]);
    seed(CAREER_POSTS_KEY, [
      { id: "p_fallback", companyName: "FallbackCo", jobTitle: "Helper" },
    ]);
    const result = aggregateCareerExperience();
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe("FallbackCo");
  });

  it("sorts by endedAt then hiredAt descending", () => {
    seed(MINI_HR_KEY, [
      { careerPostId: "p1", companyName: "Old", jobTitle: "A", status: "completed", joinedAt: 100, completedAt: 500, exitType: "resigned" },
      { careerPostId: "p2", companyName: "New", jobTitle: "B", status: "completed", joinedAt: 200, completedAt: 1000, exitType: "resigned" },
    ]);
    const result = aggregateCareerExperience();
    expect(result[0].companyName).toBe("New");
  });

  it("handles corrupted storage gracefully", () => {
    localStorage.setItem(MINI_HR_KEY, "BAD");
    localStorage.setItem(CAREER_APPS_KEY, "BAD");
    expect(aggregateCareerExperience()).toEqual([]);
  });
});

/* ═══ Career Stats ═══ */
describe("aggregateCareerStats", () => {
  it("returns zeros for empty data", () => {
    const stats = aggregateCareerStats();
    expect(stats.totalCareerPositions).toBe(0);
    expect(stats.verifiedPositions).toBe(0);
    expect(stats.uniqueCompanies).toEqual([]);
  });

  it("counts hired apps as total positions", () => {
    seed(CAREER_APPS_KEY, [
      { jobId: "p1", stage: "hired" },
      { jobId: "p2", stage: "hired" },
      { jobId: "p3", stage: "applied" },
    ]);
    expect(aggregateCareerStats().totalCareerPositions).toBe(2);
  });

  it("counts Mini-HR completed as verified", () => {
    seed(MINI_HR_KEY, [
      { careerPostId: "p1", companyName: "A", status: "completed" },
      { careerPostId: "p2", companyName: "B", status: "working" },
    ]);
    expect(aggregateCareerStats().verifiedPositions).toBe(1);
  });

  it("merges companies from all sources (case-insensitive)", () => {
    seed(MINI_HR_KEY, [{ careerPostId: "p1", companyName: "TechCorp", status: "completed" }]);
    seed(CAREER_APPS_KEY, [{ jobId: "p2", stage: "hired" }]);
    seed(CAREER_POSTS_KEY, [{ id: "p2", companyName: "techcorp" }]);
    const stats = aggregateCareerStats();
    expect(stats.uniqueCompanies).toHaveLength(1);
  });
});

/* ═══ Career References ═══ */
describe("aggregateCareerReferences", () => {
  it("returns Full HR verified exits with ratings", () => {
    seed(FULL_HR_KEY, [{
      careerPostId: "p1", companyName: "Corp", status: "exited",
      verified: true, employerRating: 4.5,
    }]);
    const refs = aggregateCareerReferences();
    expect(refs).toHaveLength(1);
    expect(refs[0].rating).toBe(4.5);
    expect(refs[0].source).toBe("career");
  });

  it("excludes unverified exits", () => {
    seed(FULL_HR_KEY, [{
      careerPostId: "p1", companyName: "Corp", status: "exited",
      verified: false, employerRating: 4,
    }]);
    expect(aggregateCareerReferences()).toHaveLength(0);
  });

  it("excludes exits with no rating", () => {
    seed(FULL_HR_KEY, [{
      careerPostId: "p1", companyName: "Corp", status: "exited",
      verified: true, employerRating: 0,
    }]);
    expect(aggregateCareerReferences()).toHaveLength(0);
  });
});

/* ═══ Employment Status Detection ═══ */
describe("detectCareerEmploymentStatus", () => {
  it("detects Mini-HR working (highest priority)", () => {
    seed(MINI_HR_KEY, [{
      status: "working", companyName: "MiniCo", jobTitle: "Dev",
    }]);
    const result = detectCareerEmploymentStatus();
    expect(result.isEmployed).toBe(true);
    expect(result.currentCompany).toBe("MiniCo");
  });

  it("falls back to Full HR active", () => {
    seed(FULL_HR_KEY, [{
      status: "active", companyName: "FullCo", jobTitle: "Lead",
    }]);
    const result = detectCareerEmploymentStatus();
    expect(result.isEmployed).toBe(true);
    expect(result.currentCompany).toBe("FullCo");
  });

  it("falls back to career workspaces", () => {
    seed(CAREER_WS_KEY, [{
      status: "active", companyName: "WsCo", jobTitle: "Intern",
    }]);
    const result = detectCareerEmploymentStatus();
    expect(result.isEmployed).toBe(true);
    expect(result.currentCompany).toBe("WsCo");
  });

  it("Mini-HR takes priority over Full HR", () => {
    seed(MINI_HR_KEY, [{ status: "working", companyName: "Mini", jobTitle: "A" }]);
    seed(FULL_HR_KEY, [{ status: "active", companyName: "Full", jobTitle: "B" }]);
    expect(detectCareerEmploymentStatus().currentCompany).toBe("Mini");
  });

  it("returns not employed when all empty", () => {
    const result = detectCareerEmploymentStatus();
    expect(result.isEmployed).toBe(false);
    expect(result.currentCompany).toBe("");
  });
});