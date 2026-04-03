// src/features/employee/careerJobs/services/careerApplyService.ts
//
// Employee-side career application service.
// Apply, withdraw, duplicate check, profile snapshot.
// Writes to wm_employee_career_applications_v1 (shared with employer dashboard).

import type {
  CareerApplication,
  CareerApplicationProfileSnapshot,
} from "../../../employer/careerJobs/types/careerTypes";

import {
  CAREER_APPS_KEY,
  uid,
  safeParse,
  safeWrite,
  notifyCareerAppsChanged,
} from "../../../employer/careerJobs/helpers/careerStorageUtils";

import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";

// ─────────────────────────────────────────────────────────────────────────────
// Read Applications (employee-side)
// ─────────────────────────────────────────────────────────────────────────────

function readAllApps(): CareerApplication[] {
  const raw = localStorage.getItem(CAREER_APPS_KEY);
  return safeParse<CareerApplication>(raw);
}

function writeAllApps(apps: CareerApplication[]): void {
  safeWrite(CAREER_APPS_KEY, apps);
  notifyCareerAppsChanged();
}

// ─────────────────────────────────────────────────────────────────────────────
// Duplicate Check
// ─────────────────────────────────────────────────────────────────────────────

export function hasExistingApplication(jobId: string): CareerApplication | null {
  const apps = readAllApps();
  const match = apps.find(
    (a) => a.jobId === jobId && a.stage !== "withdrawn",
  );
  return match ?? null;
}

export function getMyApplicationForJob(jobId: string): CareerApplication | null {
  const apps = readAllApps();
  const sorted = apps
    .filter((a) => a.jobId === jobId)
    .sort((a, b) => b.appliedAt - a.appliedAt);
  return sorted[0] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Profile Snapshot
// ─────────────────────────────────────────────────────────────────────────────

function buildProfileSnapshot(): CareerApplicationProfileSnapshot {
  const profile = employeeProfileStorage.get();
  return {
    uniqueId: profile.uniqueId || undefined,
    fullName: profile.fullName.trim() || undefined,
    city: profile.city.trim() || undefined,
    experience: profile.experience || undefined,
    skills: profile.skills.length > 0 ? profile.skills : undefined,
    languages: profile.languages.length > 0 ? profile.languages : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Apply
// ─────────────────────────────────────────────────────────────────────────────

export type CareerApplyInput = {
  jobId: string;
  coverNote: string;
  expectedSalary: number;
  noticePeriod: string;
  resumeSummary?: string;
  screeningAnswers?: Record<string, "yes" | "no">;
};

export function applyToCareerJob(input: CareerApplyInput): CareerApplication | null {
  // Duplicate guard
  const existing = hasExistingApplication(input.jobId);
  if (existing) return null;

  const profile = employeeProfileStorage.get();
  const now = Date.now();

  const app: CareerApplication = {
    id: uid("capp"),
    jobId: input.jobId,
    employeeId: profile.uniqueId ?? "employee_demo",
    employeeName: profile.fullName.trim() || "Applicant",
    employeePhone: profile.phoneMasked ?? "",
    resumeSummary: input.resumeSummary?.trim() ?? "",
    coverNote: input.coverNote.trim(),
    expectedSalary: input.expectedSalary,
    noticePeriod: input.noticePeriod.trim() || "Immediate",
    profileSnapshot: buildProfileSnapshot(),
    stage: "applied",
    currentRound: 0,
    roundResults: [],
    appliedAt: now,
    updatedAt: now,
    employerNotes: "",
    screeningAnswers: input.screeningAnswers,
  };

  const all = readAllApps();
  writeAllApps([app, ...all]);

  return app;
}

// ─────────────────────────────────────────────────────────────────────────────
// Withdraw
// ─────────────────────────────────────────────────────────────────────────────

export function acceptCareerOffer(jobId: string): boolean {
  const apps = readAllApps();
  const app = apps.find((a) => a.jobId === jobId && a.stage === "offered");
  if (!app) return false;
  const now = Date.now();
  writeAllApps(apps.map((a) =>
    a.id === app.id ? { ...a, stage: "hired" as const, hiredAt: now, updatedAt: now } : a
  ));
  return true;
}

export function declineCareerOffer(jobId: string): boolean {
  const apps = readAllApps();
  const app = apps.find((a) => a.jobId === jobId && a.stage === "offered");
  if (!app) return false;
  const now = Date.now();
  writeAllApps(apps.map((a) =>
    a.id === app.id ? { ...a, stage: "withdrawn" as const, withdrawnAt: now, updatedAt: now } : a
  ));
  return true;
}

export function withdrawCareerApplication(jobId: string): boolean {
  const apps = readAllApps();
  const app = apps.find(
    (a) => a.jobId === jobId && a.stage !== "withdrawn" && a.stage !== "hired",
  );
  if (!app) return false;

  const now = Date.now();
  writeAllApps(
    apps.map((a) =>
      a.id === app.id
        ? { ...a, stage: "withdrawn" as const, withdrawnAt: now, updatedAt: now }
        : a,
    ),
  );

  return true;
}