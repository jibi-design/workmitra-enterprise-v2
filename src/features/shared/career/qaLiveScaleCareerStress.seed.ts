/**
 * Career Live Scale Stress seed — 10 employers × 100 candidates each (= 1,000).
 * Career domain ONLY — never writes Shift Jobs keys.
 * Browser / Playwright headed visual audit.
 */

import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import {
  careerEmployerScopedKey,
  sanitizeCareerEmployerScopeId,
} from "./careerEmployerScope";
import {
  resolveCareerEmployeeScopedKey,
  sanitizeCareerEmployeeScopeId,
} from "./careerEmployeeScope";

export const CAREER_SCALE_EMPLOYERS = 10;
export const CAREER_SCALE_CANDIDATES_PER_EMPLOYER = 100;
export const CAREER_SCALE_TOTAL_CANDIDATES =
  CAREER_SCALE_EMPLOYERS * CAREER_SCALE_CANDIDATES_PER_EMPLOYER;

export const CAREER_SCALE_EMP_PREFIX = "ML_CAREER_SCALE_EMP_";
export const CAREER_SCALE_WRK_PREFIX = "ML_CAREER_SCALE_WRK_";
export const CAREER_SCALE_REGISTRY_KEY = "wm_qa_career_scale_employer_registry_v1";

const DEPARTMENTS = [
  "Operations",
  "Engineering",
  "Sales",
  "Support",
  "Finance",
  "HR",
  "Logistics",
  "Product",
  "Marketing",
  "Legal",
] as const;

/** Stage mix so Applied / Shortlist / Interview / Offer surfaces all mount under load. */
const STAGE_CYCLE = [
  "applied",
  "applied",
  "applied",
  "applied",
  "applied",
  "shortlisted",
  "shortlisted",
  "interview",
  "offered",
  "offer_accepted",
] as const;

export type CareerLiveScaleStressSeedResult = {
  employers: number;
  candidatesPerEmployer: number;
  totalCandidates: number;
  totalApplications: number;
  sampleEmployerId: string;
  samplePostId: string;
  sampleAppliedAppId: string;
  sampleShortlistAppId: string;
  sampleInterviewAppId: string;
  sampleOfferedAppId: string;
  sampleWorkerMlId: string;
  departments: string[];
};

export function careerScaleEmployerId(index1Based: number): string {
  return `${CAREER_SCALE_EMP_PREFIX}${index1Based}`;
}

export function careerScaleWorkerId(globalIndex1Based: number): string {
  return `${CAREER_SCALE_WRK_PREFIX}${String(globalIndex1Based).padStart(4, "0")}`;
}

export function careerScalePostId(employerIndex1Based: number): string {
  return `career_scale_post_${employerIndex1Based}`;
}

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function clearCareerScaleKeys(): void {
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (
      key.includes("career") ||
      key.startsWith(CAREER_SCALE_REGISTRY_KEY) ||
      key.includes("CAREER_SCALE") ||
      key.includes("career_scale")
    ) {
      doomed.push(key);
    }
  }
  for (const key of doomed) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

function assumeCareerScaleEmployer(employerId: string, companyName: string): void {
  const cur = employerSettingsStorage.get();
  employerSettingsStorage.save({
    ...cur,
    companyName,
    uniqueId: employerId,
    companyUniqueId: employerId,
    employerOrgId: employerId,
    fullName: cur.fullName || "Career Scale Employer",
    email: cur.email || `career.scale.${employerId.toLowerCase()}@mitralabs.test`,
    phone: cur.phone || "9876500001",
    industryType: cur.industryType || "Professional Services",
    companySize: cur.companySize || "11–50",
    locationCity: cur.locationCity || "City A",
    locationState: cur.locationState || "Region",
    companyDescription: cur.companyDescription || "Career scale stress tenant",
    registrationNo: cur.registrationNo || "",
    notificationsEnabled: true,
    hrManagementEnabled: false,
    language: "en",
    hapticFeedback: true,
    globalMute: false,
    quietHoursEnabled: false,
    quietFrom: "22:00",
    quietTo: "07:00",
    transferStatus: "none",
    businessAdminIds: cur.businessAdminIds ?? [],
    previousHandles: cur.previousHandles ?? [],
    contactVerified: true,
    verificationLevel: 1,
  });
  window.dispatchEvent(new Event("wm:career-employer-scope-changed"));
}

/**
 * Seed 10 employers × 100 candidates (1,000 total) for Career live visual stress.
 */
export function applyCareerLiveScaleStressSeed(
  employerCount = CAREER_SCALE_EMPLOYERS,
  candidatesPerEmployer = CAREER_SCALE_CANDIDATES_PER_EMPLOYER,
): CareerLiveScaleStressSeedResult {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("applyCareerLiveScaleStressSeed requires browser localStorage");
  }

  const safeEmployers = Math.max(1, Math.min(employerCount, 10));
  const safeCandidates = Math.max(1, Math.min(candidatesPerEmployer, 100));
  const now = Date.now();
  const scheduledDate = new Date(now + 3 * 86_400_000).toISOString().slice(0, 10);

  clearCareerScaleKeys();

  const registry: Array<{ id: string; companyName: string; postId: string }> = [];
  const searchable: Record<string, unknown>[] = [];
  let totalApplications = 0;

  let sampleAppliedAppId = "";
  let sampleShortlistAppId = "";
  let sampleInterviewAppId = "";
  let sampleOfferedAppId = "";
  let sampleWorkerMlId = careerScaleWorkerId(1);

  for (let emp = 1; emp <= safeEmployers; emp += 1) {
    const employerId = careerScaleEmployerId(emp);
    const scopeId = sanitizeCareerEmployerScopeId(employerId);
    const department = DEPARTMENTS[(emp - 1) % DEPARTMENTS.length] ?? "Operations";
    const companyName = `Career Scale Co #${emp}`;
    const jobTitle = `Scale ${department} Lead #${emp}`;
    const postId = careerScalePostId(emp);

    const post = {
      id: postId,
      employerId,
      employerOrgId: employerId,
      companyName,
      jobTitle,
      department,
      jobType: "full-time",
      workMode: emp % 2 === 0 ? "hybrid" : "onsite",
      location: `City ${(emp % 5) + 1}`,
      vacancies: 5,
      probationPeriod: "none",
      salaryMin: 25000 + emp * 500,
      salaryMax: 45000 + emp * 500,
      salaryPeriod: "monthly",
      experienceMin: 0,
      experienceMax: 8,
      noticePeriodDays: 30,
      qualifications: ["Graduate"],
      skills: ["operations", "communication", "leadership"],
      description: `Career scale stress post for ${companyName}.`,
      responsibilities: ["Lead team", "Ship outcomes"],
      interviewRounds: 1,
      roundConfigs: [{ round: 1, label: "Screening", mode: "phone" }],
      status: "open",
      createdAt: now - emp * 60_000,
      updatedAt: now,
      closingDate: now + 30 * 86_400_000,
      screeningQuestions: [{ id: `q_${emp}`, text: "Can you join in 30 days?" }],
      totalApplications: safeCandidates,
      shortlisted: 0,
      inInterview: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
    };

    const apps: Record<string, unknown>[] = [];
    let shortlisted = 0;
    let inInterview = 0;
    let offered = 0;
    let hired = 0;

    for (let c = 1; c <= safeCandidates; c += 1) {
      const globalWorker = (emp - 1) * safeCandidates + c;
      const workerMlId = careerScaleWorkerId(globalWorker);
      const workerName = `Career Scale Worker ${globalWorker}`;
      const stage = STAGE_CYCLE[(emp + c) % STAGE_CYCLE.length] ?? "applied";
      const appId = `cscale_app_${emp}_${c}`;

      const roundResults: Record<string, unknown>[] = [];
      if (stage === "interview") {
        roundResults.push({
          round: 1,
          label: "Screening",
          status: "scheduled",
          feedback: "",
          interviewMode: "phone",
          scheduledDate,
          scheduledTime: "11:00",
          location: "HQ",
          meetingLink: "",
          rsvpStatus: "pending",
        });
        inInterview += 1;
      } else if (stage === "offered" || stage === "offer_accepted") {
        roundResults.push({
          round: 1,
          label: "Screening",
          status: "passed",
          feedback: "ok",
          interviewMode: "phone",
          completedAt: now - 86_400_000,
        });
        if (stage === "offered") offered += 1;
        if (stage === "offer_accepted") hired += 1;
      } else if (stage === "shortlisted") {
        shortlisted += 1;
      }

      const app: Record<string, unknown> = {
        id: appId,
        jobId: postId,
        employeeId: workerMlId,
        employeeName: workerName,
        employeePhone: `98${String(70000000 + globalWorker).slice(-8)}`,
        employeeEmail: `cscale${globalWorker}@mitralabs.test`,
        resumeSummary: `Scale resume ${globalWorker} — ${department} experience.`,
        coverNote: `Interested in ${jobTitle}`,
        expectedSalary: 30000 + (c % 10) * 500,
        noticePeriod: "30 days",
        profileSnapshot: {
          uniqueId: workerMlId,
          fullName: workerName,
          city: `City ${(c % 5) + 1}`,
          experience: "experienced",
          skills: ["operations", "communication"],
          languages: ["English"],
        },
        stage,
        currentRound: stage === "interview" ? 1 : 0,
        roundResults,
        appliedAt: now - emp * 1000 - c,
        updatedAt: now - c,
        employerNotes: "",
        screeningAnswers: { [`q_${emp}`]: c % 3 === 0 ? "no" : "yes" },
      };

      if (stage === "offered" || stage === "offer_accepted") {
        app.offeredAt = now - 2 * 86_400_000;
        app.offerDetails = {
          jobTitle,
          salary: 32000 + emp * 100,
          salaryPeriod: "monthly",
          startDate: scheduledDate,
          noticePeriodDays: 30,
          message: `Scale offer for ${workerName}`,
        };
      }
      if (stage === "offer_accepted") {
        app.offerAcceptedAt = now - 86_400_000;
      }

      apps.push(app);
      totalApplications += 1;

      if (emp === 1) {
        if (stage === "applied" && !sampleAppliedAppId) sampleAppliedAppId = appId;
        if (stage === "shortlisted" && !sampleShortlistAppId) sampleShortlistAppId = appId;
        if (stage === "interview" && !sampleInterviewAppId) {
          sampleInterviewAppId = appId;
          sampleWorkerMlId = workerMlId;
        }
        if (stage === "offered" && !sampleOfferedAppId) {
          sampleOfferedAppId = appId;
          sampleWorkerMlId = workerMlId;
        }
      }

      // Employee projections only for action surfaces (interview/offer) — quota-safe.
      // Employer ATS still holds all 100 candidates per tenant.
      if (stage === "interview" || stage === "offered" || stage === "offer_accepted") {
        const eeKey = resolveCareerEmployeeScopedKey(
          "career_applications_v1",
          sanitizeCareerEmployeeScopeId(workerMlId),
        );
        safeSet(eeKey, JSON.stringify([app]));
        safeSet(`${eeKey}__migrated_v1`, "1");
      }
    }

    post.shortlisted = shortlisted;
    post.inInterview = inInterview;
    post.offered = offered;
    post.hired = hired;

    const postsKey = careerEmployerScopedKey("career_posts_v1", scopeId);
    const appsKey = careerEmployerScopedKey("career_applications_v1", scopeId);
    safeSet(postsKey, JSON.stringify([post]));
    safeSet(`${postsKey}__migrated_v1`, "1");
    safeSet(appsKey, JSON.stringify(apps));
    safeSet(`${appsKey}__migrated_v1`, "1");

    searchable.push({
      id: post.id,
      companyName: post.companyName,
      jobTitle: post.jobTitle,
      department: post.department,
      jobType: post.jobType,
      workMode: post.workMode,
      location: post.location,
      salaryMin: post.salaryMin,
      salaryMax: post.salaryMax,
      salaryPeriod: post.salaryPeriod,
      experienceMin: post.experienceMin,
      experienceMax: post.experienceMax,
      skills: post.skills,
      description: post.description,
      status: post.status,
      closingDate: post.closingDate,
      interviewRounds: post.interviewRounds,
      createdAt: post.createdAt,
    });

    registry.push({ id: employerId, companyName, postId });

    // Resume draft on employer 1 for draft-surface presence under load
    if (emp === 1) {
      const draft = {
        id: "career_create_draft",
        step: 2,
        basic: {
          companyName,
          jobTitle: `${jobTitle} Draft`,
          department,
          jobType: "full-time",
          workMode: "hybrid",
          location: "City A",
          vacancies: "2",
          probationPeriod: "none",
        },
        req: {
          salaryMin: "25000",
          salaryMax: "40000",
          salaryPeriod: "monthly",
          experienceMin: "0",
          experienceMax: "5",
          noticePeriodDays: "30",
          noticePeriodCustomDays: "30",
          qualifications: "Graduate",
          skills: "Operations\nCommunication",
          description: "Career scale draft under load.",
          responsibilities: "Lead ops",
          closingDate: now + 30 * 86_400_000,
        },
        interview: {
          roundConfigs: [{ round: 1, label: "Screening", mode: "phone" }],
        },
        screeningQuestions: [{ id: "q_draft", text: "Can you join soon?" }],
        savedAt: now - 60_000,
        updatedAt: now,
      };
      const draftKey = careerEmployerScopedKey("career_create_draft_v1", scopeId);
      safeSet(draftKey, JSON.stringify(draft));
      safeSet("wm_employer_career_create_draft_v1", JSON.stringify(draft));
    }
  }

  safeSet(CAREER_SCALE_REGISTRY_KEY, JSON.stringify(registry));
  safeSet("wm_employee_career_posts_search_v1", JSON.stringify(searchable));
  safeSet("wm_employer_career_posts_v1", JSON.stringify(searchable));

  // Legacy employee apps mirror for sample action worker (Accept Offer / Interview RSVP)
  try {
    const sampleEeKey = resolveCareerEmployeeScopedKey(
      "career_applications_v1",
      sanitizeCareerEmployeeScopeId(sampleWorkerMlId),
    );
    const raw = localStorage.getItem(sampleEeKey);
    if (raw) safeSet("wm_employee_career_applications_v1", raw);
  } catch {
    /* ignore */
  }

  // Assume tenant 1 for the live employer session
  const sampleEmployerId = careerScaleEmployerId(1);
  const samplePostId = careerScalePostId(1);
  assumeCareerScaleEmployer(sampleEmployerId, "Career Scale Co #1");

  for (const ev of [
    "wm:employer-career-posts-changed",
    "wm:employee-career-applications-changed",
    "wm:employer-career-create-draft-changed",
    "wm:career-employer-scope-changed",
    "wm:pending-actions-changed",
  ]) {
    window.dispatchEvent(new Event(ev));
  }

  return {
    employers: safeEmployers,
    candidatesPerEmployer: safeCandidates,
    totalCandidates: safeEmployers * safeCandidates,
    totalApplications,
    sampleEmployerId,
    samplePostId,
    sampleAppliedAppId: sampleAppliedAppId || `cscale_app_1_1`,
    sampleShortlistAppId: sampleShortlistAppId || `cscale_app_1_6`,
    sampleInterviewAppId: sampleInterviewAppId || `cscale_app_1_8`,
    sampleOfferedAppId: sampleOfferedAppId || `cscale_app_1_9`,
    sampleWorkerMlId,
    departments: [...DEPARTMENTS],
  };
}

/** Switch active Career employer tenant for multi-tenant headed walkthrough. */
export function assumeCareerScaleEmployerByIndex(index1Based: number): string {
  const id = careerScaleEmployerId(index1Based);
  assumeCareerScaleEmployer(id, `Career Scale Co #${index1Based}`);
  return id;
}
