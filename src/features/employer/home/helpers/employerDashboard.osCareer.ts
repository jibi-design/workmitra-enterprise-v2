/** Career-lane snapshot + tracker mapping for Employer OS dashboard. */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { CareerApplication, CareerJobPost } from "../../careerJobs/types/careerTypes";
import {
  EMPLOYER_PIPELINE_STEPPER_STAGES,
  type EmployerPipelineRow,
} from "./employerDashboard.helpers";
import type {
  EmployerOsDomainSnapshot,
  EmployerOsStageDef,
  EmployerOsTrackerRow,
} from "./employerDashboard.osTypes";

export const CAREER_OS_STAGES: readonly EmployerOsStageDef[] = EMPLOYER_PIPELINE_STEPPER_STAGES.map(
  (stage) => ({ key: stage, label: stage }),
);

export function computeCareerOsSnapshot(
  posts: readonly CareerJobPost[],
  apps: readonly CareerApplication[],
): EmployerOsDomainSnapshot {
  const open = posts.filter((post) => post.status === "active").length;
  const pending = apps.filter(
    (app) => app.stage === "applied" || app.stage === "shortlisted",
  ).length;
  const interviews = apps.filter((app) => app.stage === "interview").length;
  return {
    domain: "career",
    title: "Career Jobs",
    openLabel: "Active roles",
    openCount: open,
    pendingLabel: "In pipeline",
    pendingCount: pending,
    confirmedLabel: "Interviews",
    confirmedCount: interviews,
    extraLabel: "Total applications",
    extraCount: apps.length,
  };
}

export function careerPipelineToOsRows(
  rows: readonly EmployerPipelineRow[],
): EmployerOsTrackerRow[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.candidateName,
    subtitle: row.jobTitle,
    stage: row.stage,
    updatedAt: row.updatedAt,
    href: ROUTE_PATHS.employerCareerCandidateDetail
      .replace(":postId", row.jobId)
      .replace(":appId", row.id),
  }));
}
