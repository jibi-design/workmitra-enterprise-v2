/** Hybrid A2 S6 — RatingDomain planner + entity-vs-agent gates */

import { beforeEach, describe, expect, it } from "vitest";
import { ratingStorage } from "../ratingStorage";
import { ER_KEY, WR_KEY } from "../ratingStorage.constants";
import {
  buildPlannerRatingJobId,
  guardPlannerReputationSubject,
  isPublicReputationDomain,
} from "../plannerRating.helpers";
import { submitPlannerEmployerRating, submitPlannerWorkerRating } from "../submitPlannerRatingSaga";
import { recordPlannerEpochInVault } from "../../../features/employee/workVault/services/plannerVaultHistory.service";
import { getVaultPlannerHistoryForWorker } from "../../../features/employee/workVault/storage/vaultPlannerHistory.storage";
import { getVaultSectionData } from "../../../features/employee/workVault/services/vaultDataAggregator";

const ENTITY = "ML-ENT-AGENCY-001";
const SITE_MGR = "ML-SITE-MGR-9";
const WORKER = "ML-PLAN-RATE-001";
const PLAN = "dp_rate_s6";

describe("planner rating helpers (Hybrid A2 S6)", () => {
  it("builds epoch-scoped job ids", () => {
    expect(buildPlannerRatingJobId(PLAN, 2)).toBe(`plan_${PLAN}_e2`);
    expect(buildPlannerRatingJobId(PLAN)).toBe(PLAN);
  });

  it("rejects site manager as reputation subject", () => {
    const bad = guardPlannerReputationSubject(SITE_MGR, {
      rosterPlanId: PLAN,
      siteManagerId: SITE_MGR,
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.reason).toBe("site_manager_as_subject");

    const good = guardPlannerReputationSubject(ENTITY, {
      rosterPlanId: PLAN,
      siteManagerId: SITE_MGR,
      epochIndex: 0,
    });
    expect(good.ok).toBe(true);
  });

  it("marks planner as non-public reputation domain", () => {
    expect(isPublicReputationDomain("shift")).toBe(true);
    expect(isPublicReputationDomain("career")).toBe(true);
    expect(isPublicReputationDomain("planner")).toBe(false);
  });
});

describe("submitPlannerRatingSaga (Hybrid A2 S6)", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "wm_employee_profile_v1",
      JSON.stringify({ uniqueId: WORKER, fullName: "Rate Worker", skills: [] }),
    );
    recordPlannerEpochInVault({
      planId: PLAN,
      assignmentId: `${PLAN}_${WORKER}`,
      employeeMlId: WORKER,
      employeeName: "Rate Worker",
      employerMlId: ENTITY,
      companyName: "Agency Co",
      planName: "Roster Plan",
      epochIndex: 0,
      epochStart: Date.parse("2026-08-01T00:00:00Z"),
      epochEnd: Date.parse("2026-08-30T00:00:00Z"),
      daysScheduled: 20,
      daysCompleted: 18,
      attendanceRate: 90,
      reliabilityScore: 88,
      siteManagerId: SITE_MGR,
    });
  });

  it("saves planner employer rating against legal entity and syncs vault", () => {
    const result = submitPlannerEmployerRating({
      employerMlId: ENTITY,
      workerMlId: WORKER,
      stars: 5,
      tags: ["Reliable"],
      hireAgain: true,
      meta: { rosterPlanId: PLAN, epochIndex: 0, siteManagerId: SITE_MGR },
    });
    expect(result.ok).toBe(true);

    const all = ratingStorage.getAllERRatings();
    expect(all).toHaveLength(1);
    expect(all[0]?.domain).toBe("planner");
    expect(all[0]?.employerMlId).toBe(ENTITY);
    expect(all[0]?.meta?.siteManagerId).toBe(SITE_MGR);
    expect(all[0]?.jobId).toBe(`plan_${PLAN}_e0`);

    const vault = getVaultPlannerHistoryForWorker(WORKER)[0];
    expect(vault?.employerRating).toBe(5);
    expect(vault?.vaultFinalized).toBe(true);
  });

  it("blocks site-manager-as-subject submissions", () => {
    const result = submitPlannerEmployerRating({
      employerMlId: SITE_MGR,
      workerMlId: WORKER,
      stars: 4,
      tags: [],
      hireAgain: false,
      meta: { rosterPlanId: PLAN, epochIndex: 0, siteManagerId: SITE_MGR },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("site_manager_as_subject");
    expect(localStorage.getItem(ER_KEY)).toBeNull();
  });

  it("excludes planner ratings from public worker/employer summaries", () => {
    submitPlannerEmployerRating({
      employerMlId: ENTITY,
      workerMlId: WORKER,
      stars: 5,
      tags: ["Reliable"],
      hireAgain: true,
      meta: { rosterPlanId: PLAN, epochIndex: 0 },
    });
    submitPlannerWorkerRating({
      workerMlId: WORKER,
      employerMlId: ENTITY,
      stars: 4,
      tags: ["Paid on time"],
      workAgain: true,
      meta: { rosterPlanId: PLAN, epochIndex: 0 },
    });

    ratingStorage.saveEmployerRating({
      domain: "shift",
      employerMlId: "ML-SHIFT-ER",
      workerMlId: WORKER,
      jobId: "shift_1",
      stars: 3,
      tags: [],
      hireAgain: true,
    });

    const publicSummary = ratingStorage.getWorkerSummary(WORKER);
    expect(publicSummary.totalRatings).toBe(1);
    expect(publicSummary.averageStars).toBe(3);

    const plannerSummary = ratingStorage.getWorkerSummaryForDomain(WORKER, "planner");
    expect(plannerSummary.totalRatings).toBe(1);
    expect(plannerSummary.averageStars).toBe(5);

    const employerPublic = ratingStorage.getEmployerSummary(ENTITY);
    expect(employerPublic.totalRatings).toBe(0);

    const employerPlanner = ratingStorage.getEmployerSummaryForDomain(ENTITY, "planner");
    expect(employerPlanner.totalRatings).toBe(1);
    expect(employerPlanner.averageStars).toBe(4);

    const section = getVaultSectionData();
    expect(section.performance.overallRating).toBe(3);
    expect(section.references.some((r) => r.source === "planner")).toBe(true);
    expect(localStorage.getItem(WR_KEY)).toBeTruthy();
  });
});
