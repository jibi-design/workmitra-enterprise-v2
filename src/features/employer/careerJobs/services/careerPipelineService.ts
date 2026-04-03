// src/features/employer/careerJobs/services/careerPipelineService.ts
//
// Candidate pipeline management for Career Jobs.
// Self-contained: Shortlist → Interview → Offer → Hire.
// Workspace creation on hire. Employer notes.
// HR Management integration: Phase 2 (commented out).

import { ROUTE_PATHS } from "../../../../app/router/routePaths";

import type {
  CareerJobPost,
  CareerWorkspace,
  CareerWorkspaceUpdate,
  RoundResult,
  RoundResultStatus,
  InterviewScheduleInput,
} from "../types/careerTypes";

import { uid } from "../helpers/careerStorageUtils";

import {
  CAREER_POSTS_CHANGED,
  CAREER_APPS_CHANGED,
  CAREER_WORKSPACES_CHANGED,
  CAREER_ACTIVITY_CHANGED,
} from "../helpers/careerStorageUtils";

import {
  readCareerPosts,
  writeCareerPosts,
  readCareerApps,
  writeCareerApps,
  readCareerWorkspaces,
  writeCareerWorkspaces,
} from "../helpers/careerNormalizers";

import {
  pushCareerActivity,
  pushEmployeeCareerNotification,
  hasSimilarCareerNote,
} from "../helpers/careerNotifications";

import {
  canTransition,
  syncToEmployeeCareerSearch,
} from "../helpers/careerValidation";

import { getCareerPost } from "./careerPostService";
import { employmentLifecycleStorage } from "../../../employee/employment/storage/employmentLifecycle.storage";
import { myStaffStorage } from "../../myStaff/storage/myStaff.storage";
import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";

/* ------------------------------------------------ */
/* Workspace Helpers                                */
/* ------------------------------------------------ */
function findCareerWorkspaceByJobId(jobId: string): CareerWorkspace | null {
  return readCareerWorkspaces().find((w) => w.jobId === jobId) ?? null;
}

function createCareerWorkspace(post: CareerJobPost): string {
  const existing = findCareerWorkspaceByJobId(post.id);
  if (existing) return existing.id;

  const now = Date.now();
  const wsId = uid("cws");

  const welcomeUpdate: CareerWorkspaceUpdate = {
    id: uid("cu"),
    createdAt: now,
    kind: "system",
    title: "Welcome to your new role",
    body: `Congratulations! You have been hired as ${post.jobTitle} at ${post.companyName}. This workspace is your official channel for onboarding and communication.`,
  };

  const ws: CareerWorkspace = {
    id: wsId,
    jobId: post.id,
    companyName: post.companyName,
    jobTitle: post.jobTitle,
    department: post.department,
    location: post.location,
    status: "onboarding",
    lastActivityAt: now,
    unreadCount: 1,
    updates: [welcomeUpdate],
    hiredAt: now,
  };

  writeCareerWorkspaces([ws, ...readCareerWorkspaces()].slice(0, 100));
  return wsId;
}

/* ------------------------------------------------ */
/* Shortlist Candidate (applied → shortlisted)      */
/* ------------------------------------------------ */
export function shortlistCandidate(postId: string, appId: string): boolean {
  const apps = readCareerApps();
  const app = apps.find((a) => a.id === appId && a.jobId === postId);
  if (!app || !canTransition(app.stage, "shortlisted")) return false;

  const post = getCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  writeCareerApps(apps.map((a) =>
    a.id === appId ? { ...a, stage: "shortlisted" as const, updatedAt: now } : a
  ));

  pushCareerActivity({
    postId,
    kind: "candidate_shortlisted",
    title: "Candidate shortlisted",
    body: `${app.employeeName} shortlisted for ${post.jobTitle}.`,
    route: ROUTE_PATHS.employerCareerCandidateDetail.replace(":postId", postId).replace(":appId", appId),
  });

  pushEmployeeCareerNotification(
    "Shortlisted",
    `Your application for ${post.jobTitle} at ${post.companyName} has been shortlisted.`,
    ROUTE_PATHS.employeeCareerApplications,
  );

  return true;
}

/* ------------------------------------------------ */
/* Reject Candidate (any valid stage → rejected)    */
/* ------------------------------------------------ */
export function rejectCandidate(postId: string, appId: string, reason: string): boolean {
  const apps = readCareerApps();
  const app = apps.find((a) => a.id === appId && a.jobId === postId);
  if (!app || !canTransition(app.stage, "rejected")) return false;

  const post = getCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  const requiresReason = app.stage === "interview" || app.stage === "offered";
  const finalReason = requiresReason && !reason.trim() ? "Not specified" : reason.trim();

  writeCareerApps(apps.map((a) =>
    a.id === appId
      ? { ...a, stage: "rejected" as const, rejectionReason: finalReason || undefined, rejectedAt: now, updatedAt: now }
      : a
  ));

  pushCareerActivity({
    postId,
    kind: "candidate_rejected",
    title: "Candidate rejected",
    body: `${app.employeeName} rejected.${finalReason ? ` Reason: ${finalReason}.` : ""}`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  pushEmployeeCareerNotification(
    "Application update",
    `Your application for ${post.jobTitle} at ${post.companyName} was not successful.${finalReason ? ` Reason: ${finalReason}` : ""}`,
    ROUTE_PATHS.employeeCareerApplications,
  );

  return true;
}

/* ------------------------------------------------ */
/* Schedule Interview                               */
/* ------------------------------------------------ */
export function scheduleInterview(
  postId: string,
  appId: string,
  roundNumber: number,
  details: InterviewScheduleInput,
): boolean {
  const apps = readCareerApps();
  const app = apps.find((a) => a.id === appId && a.jobId === postId);
  if (!app) return false;
  if (app.stage !== "shortlisted" && app.stage !== "interview") return false;

  const post = getCareerPost(postId);
  if (!post) return false;
  if (roundNumber < 1 || roundNumber > post.interviewRounds) return false;

  const roundConfig = post.roundConfigs.find((rc) => rc.round === roundNumber);
  const roundLabel = roundConfig?.label ?? `Round ${roundNumber}`;

  const newResult: RoundResult = {
    round: roundNumber, label: roundLabel, status: "scheduled", feedback: "",
    interviewMode: details.mode, scheduledDate: details.scheduledDate,
    scheduledTime: details.scheduledTime, location: details.location, meetingLink: details.meetingLink,
  };

  const now = Date.now();
  const updatedResults = [
    ...app.roundResults.filter((r) => r.round !== roundNumber),
    newResult,
  ].sort((a, b) => a.round - b.round);

  writeCareerApps(apps.map((a) =>
    a.id === appId
      ? { ...a, stage: "interview" as const, currentRound: roundNumber, roundResults: updatedResults, updatedAt: now }
      : a
  ));

  pushCareerActivity({
    postId,
    kind: "interview_scheduled",
    title: `${roundLabel} scheduled`,
    body: `${app.employeeName} - ${details.scheduledDate} at ${details.scheduledTime}. Mode: ${details.mode}.`,
    route: ROUTE_PATHS.employerCareerCandidateDetail.replace(":postId", postId).replace(":appId", appId),
  });

  pushEmployeeCareerNotification(
    "Interview scheduled",
    `${roundLabel} for ${post.jobTitle} at ${post.companyName}. Date: ${details.scheduledDate}, Time: ${details.scheduledTime}. Mode: ${details.mode}.${details.location ? ` Location: ${details.location}.` : ""}`,
    ROUTE_PATHS.employeeCareerApplications,
  );

  return true;
}

/* ------------------------------------------------ */
/* Record Interview Result (passed / failed)        */
/* Phase 2: HR auto-move commented out              */
/* ------------------------------------------------ */
export function recordInterviewResult(
  postId: string,
  appId: string,
  roundNumber: number,
  result: "passed" | "failed",
  feedback: string,
): boolean {
  const apps = readCareerApps();
  const app = apps.find((a) => a.id === appId && a.jobId === postId);
  if (!app || app.stage !== "interview") return false;

  const post = getCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  const updatedResults = app.roundResults.map((r) =>
    r.round === roundNumber
      ? { ...r, status: result as RoundResultStatus, feedback, completedAt: now }
      : r
  );

  writeCareerApps(apps.map((a) =>
    a.id === appId ? { ...a, roundResults: updatedResults, updatedAt: now } : a
  ));

  const roundConfig = post.roundConfigs.find((rc) => rc.round === roundNumber);
  const roundLabel = roundConfig?.label ?? `Round ${roundNumber}`;

  pushCareerActivity({
    postId,
    kind: result === "passed" ? "interview_passed" : "interview_failed",
    title: `${roundLabel}: ${result === "passed" ? "Passed" : "Not passed"}`,
    body: `${app.employeeName}.${feedback ? ` Feedback: ${feedback}` : ""}`,
    route: ROUTE_PATHS.employerCareerCandidateDetail.replace(":postId", postId).replace(":appId", appId),
  });

  if (result === "passed") {
    const isLastRound = roundNumber === post.interviewRounds;
    const allPreviousPassed = updatedResults
      .filter((r) => r.round < roundNumber)
      .every((r) => r.status === "passed");

    pushEmployeeCareerNotification(
      "Interview result",
      `You passed ${roundLabel} for ${post.jobTitle} at ${post.companyName}.${isLastRound ? " All rounds completed!" : " Next round details will follow."}`,
      ROUTE_PATHS.employeeCareerApplications,
    );

    if (isLastRound && allPreviousPassed) {
      /* Phase 2 — HR Management auto-move (disabled for launch)
      const hrOn = employerSettingsStorage.get().hrManagementEnabled === true;
      if (hrOn) {
        hrManagementStorage.moveToHR({
          careerPostId: postId, applicationId: appId,
          employeeUniqueId: app.profileSnapshot?.uniqueId ?? "",
          employeeName: app.employeeName, jobTitle: post.jobTitle,
          department: post.department, location: post.location,
        });
        pushEmployeeCareerNotification(
          "All interviews cleared!",
          `Congratulations! You cleared all interview rounds for ${post.jobTitle} at ${post.companyName}. Your employer is preparing your offer through HR Management.`,
          ROUTE_PATHS.employeeCareerApplications,
        );
        pushCareerActivity({
          postId, kind: "interview_passed",
          title: "Moved to HR Management",
          body: `${app.employeeName} cleared all rounds — moved to HR section for offer processing.`,
          route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
        });
      } else { */
        pushEmployeeCareerNotification(
          "You cleared the interview!",
          `Congratulations! You cleared all interviews for ${post.jobTitle} at ${post.companyName}. Your employer will send you an offer soon.`,
          ROUTE_PATHS.employeeCareerApplications,
        );
      /* } */
    }
  } else {
    pushEmployeeCareerNotification(
      "Interview result",
      `${roundLabel} for ${post.jobTitle} at ${post.companyName}: Unfortunately, you did not pass this round.${feedback ? ` Feedback: ${feedback}` : ""}`,
      ROUTE_PATHS.employeeCareerApplications,
    );
  }

  return true;
}

/* ------------------------------------------------ */
/* Send Offer (interview → offered)                 */
/* ------------------------------------------------ */
export function sendOffer(postId: string, appId: string, offerDetails: import("../types/careerTypes").CareerOfferInput): boolean {
  const apps = readCareerApps();
  const app = apps.find((a) => a.id === appId && a.jobId === postId);
  if (!app || !canTransition(app.stage, "offered")) return false;

  const post = getCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  writeCareerApps(apps.map((a) =>
    a.id === appId ? { ...a, stage: "offered" as const, offeredAt: now, updatedAt: now, offerDetails } : a
  ));

  pushCareerActivity({
    postId,
    kind: "offer_sent",
    title: "Offer sent",
    body: `Offer sent to ${app.employeeName} for ${post.jobTitle}.`,
    route: ROUTE_PATHS.employerCareerCandidateDetail.replace(":postId", postId).replace(":appId", appId),
  });

  const signature = `[CAREER_OFFER:${postId}:${appId}]`;
  if (!hasSimilarCareerNote(signature)) {
    pushEmployeeCareerNotification(
      "Job offer received!",
      `${signature} ${post.companyName} has offered you the role of ${offerDetails.jobTitle}. Salary: ${offerDetails.salary.toLocaleString()} (${offerDetails.salaryPeriod}). Start date: ${offerDetails.startDate}.${offerDetails.message ? ` Note: ${offerDetails.message}` : ""}`,
      ROUTE_PATHS.employeeCareerApplications,
    );
  }

  return true;
}

/* ------------------------------------------------ */
/* Hire Candidate (offered → hired + workspace)     */
/* ------------------------------------------------ */
export function hireCandidate(postId: string, appId: string): string | null {
  const apps = readCareerApps();
  const app = apps.find((a) => a.id === appId && a.jobId === postId);
  if (!app || !canTransition(app.stage, "hired")) return null;

  const post = getCareerPost(postId);
  if (!post) return null;

  const now = Date.now();
  writeCareerApps(apps.map((a) =>
    a.id === appId ? { ...a, stage: "hired" as const, hiredAt: now, updatedAt: now } : a
  ));

  const wsId = createCareerWorkspace(post);

  /* Mark post as filled */
  const posts = readCareerPosts();
  const nextPosts = posts.map((p) =>
    p.id === postId ? { ...p, status: "filled" as const, updatedAt: now } : p
  );
  writeCareerPosts(nextPosts);
  syncToEmployeeCareerSearch(nextPosts);

  pushCareerActivity({
    postId,
    kind: "candidate_hired",
    title: "Candidate hired",
    body: `${app.employeeName} hired as ${post.jobTitle}. Workspace created.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  /* Add to My Staff */
  myStaffStorage.addStaff({
    employeeUniqueId: app.profileSnapshot?.uniqueId ?? "",
    employeeName: app.employeeName,
    jobTitle: post.jobTitle,
    category: post.department || "General",
    employmentType: "full_time",
    joinedAt: now,
    status: "active",
    addMethod: "via_app",
    careerPostId: postId,
    employeeConfirmed: true,
  });

  /* Create employment lifecycle record */
  employmentLifecycleStorage.createEmployment({
    careerPostId: postId,
    companyName: post.companyName,
    jobTitle: post.jobTitle,
    department: post.department,
    location: post.location,
    joinedAt: now,
    status: "active",
    verified: true,
    hireMethod: "via_app",
  });

  /* Create mini-HR employment record (Session 17) */
  const erProfile = employerSettingsStorage.get();
  employmentStorage.create({
    careerPostId: postId,
    employeeId: app.employeeId,
    employeeName: app.employeeName,
    employeeWmId: app.profileSnapshot?.uniqueId ?? "",
    employerId: post.employerId,
    companyName: post.companyName,
    employerWmId: erProfile.uniqueId ?? "",
    jobTitle: post.jobTitle,
    department: post.department,
    salaryMin: app.offerDetails?.salary ?? post.salaryMin,
    salaryMax: app.offerDetails?.salary ?? post.salaryMax,
    salaryPeriod: app.offerDetails?.salaryPeriod ?? post.salaryPeriod,
    noticePeriodDays: (app.offerDetails?.noticePeriodDays ?? 0) as 0 | 7 | 14 | 30,
  });

  const signature = `[CAREER_HIRED:${postId}:${appId}]`;
  if (!hasSimilarCareerNote(signature)) {
    pushEmployeeCareerNotification(
      "Congratulations! You are hired!",
      `${signature} You have been hired as ${post.jobTitle} at ${post.companyName}. Your onboarding workspace is ready.`,
      ROUTE_PATHS.employeeCareerWorkspace.replace(":workspaceId", wsId),
    );
  }

  return wsId;
}

/* ------------------------------------------------ */
/* Update Employer Notes                            */
/* ------------------------------------------------ */
export function updateEmployerNotes(postId: string, appId: string, notes: string): boolean {
  const apps = readCareerApps();
  const app = apps.find((a) => a.id === appId && a.jobId === postId);
  if (!app) return false;

  writeCareerApps(apps.map((a) =>
    a.id === appId ? { ...a, employerNotes: notes, updatedAt: Date.now() } : a
  ));

  return true;
}

/* ------------------------------------------------ */
/* Event Constants                                  */
/* ------------------------------------------------ */
export const CAREER_EVENTS = {
  careerPostsChanged:    CAREER_POSTS_CHANGED,
  careerAppsChanged:     CAREER_APPS_CHANGED,
  careerWorkspacesChanged: CAREER_WORKSPACES_CHANGED,
  careerActivityChanged: CAREER_ACTIVITY_CHANGED,
} as const;