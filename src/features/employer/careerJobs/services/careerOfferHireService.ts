// App name: Job Mitra
// File name: careerOfferHireService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\services\careerOfferHireService.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  readCareerApps,
  readCareerPosts,
  writeCareerApps,
  writeCareerPosts,
} from "../helpers/careerNormalizers";
import { hasSimilarCareerNote, pushCareerActivity } from "../helpers/careerNotifications";
import { canTransition, syncToEmployeeCareerSearch } from "../helpers/careerValidation";
import type { CareerOfferInput } from "../types/careerTypes";
import {
  activateCareerHire,
  captureCareerHireActivationSnapshots,
  rollbackCareerHireActivationSnapshots,
} from "./careerHireActivationService";
import { getCareerPost } from "./careerPostService";

const MAX_OFFER_SALARY = 999_999_999;
const ALLOWED_OFFER_NOTICE_DAYS = new Set([0, 7, 14, 30]);

export type HireCandidateSagaResult =
  | { ok: true; workspaceId: string }
  | {
      ok: false;
      reason:
        | "not_found"
        | "invalid_stage"
        | "offer_not_accepted"
        | "post_inactive"
        | "invalid_offer"
        | "application_write_error"
        | "activation_error"
        | "post_write_error"
        | "search_sync_error";
    };

function getDateOnlyMs(value: string): number | null {
  if (!value.trim()) return null;

  const date = new Date(`${value}T00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return date.getTime();
}

function getTodayStartMs(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);

  return date.getTime();
}

export function isValidCareerOfferDetails(
  offerDetails: CareerOfferInput,
  now = Date.now(),
): boolean {
  const title = offerDetails.jobTitle.trim();
  const startDateMs = getDateOnlyMs(offerDetails.startDate);
  const todayStartMs = getTodayStartMs(now);

  if (title.length < 2 || title.length > 100) return false;
  if (!Number.isFinite(offerDetails.salary)) return false;
  if (!Number.isInteger(offerDetails.salary)) return false;
  if (offerDetails.salary <= 0 || offerDetails.salary > MAX_OFFER_SALARY) return false;
  if (offerDetails.salaryPeriod !== "monthly" && offerDetails.salaryPeriod !== "yearly")
    return false;
  if (startDateMs === null || startDateMs < todayStartMs) return false;
  if (!ALLOWED_OFFER_NOTICE_DAYS.has(offerDetails.noticePeriodDays)) return false;
  if ((offerDetails.message?.trim().length ?? 0) > 300) return false;

  return true;
}

export function sendOffer(postId: string, appId: string, offerDetails: CareerOfferInput): boolean {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);

  if (!app || !canTransition(app.stage, "offered")) return false;

  const post = getCareerPost(postId);
  if (!post || post.status !== "active") return false;

  const now = Date.now();

  if (!isValidCareerOfferDetails(offerDetails, now)) return false;

  const appWrite = writeCareerApps(
    apps.map((item) =>
      item.id === appId
        ? {
            ...item,
            stage: "offered" as const,
            offeredAt: now,
            updatedAt: now,
            offerDetails,
          }
        : item,
    ),
  );

  if (!appWrite.ok) return false;

  pushCareerActivity({
    postId,
    kind: "offer_sent",
    title: "Offer sent",
    body: `Offer sent to ${app.employeeName} for ${post.jobTitle}.`,
    route: ROUTE_PATHS.employerCareerCandidateDetail
      .replace(":postId", postId)
      .replace(":appId", appId),
  });

  const signature = `[CAREER_OFFER:${postId}:${appId}]`;

  if (!hasSimilarCareerNote(signature)) {
    notifyCrossRole({
      type: "CAREER_OFFER_EXTENDED",
      domain: "career",
      affectedUserRole: "employee",
      postId,
      appId,
      severity: "urgent",
      title: "Job offer received!",
      body: `${signature} ${post.companyName} has offered you the role of ${offerDetails.jobTitle}. Salary: ${offerDetails.salary.toLocaleString()} (${offerDetails.salaryPeriod}). Start date: ${offerDetails.startDate}.${offerDetails.message ? ` Note: ${offerDetails.message}` : ""}`,
      route: ROUTE_PATHS.employeeCareerApplications,
    });
  }

  return true;
}

export function hireCandidate(postId: string, appId: string): HireCandidateSagaResult {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);

  if (!app) return { ok: false, reason: "not_found" };

  if (app.stage === "offered") {
    return { ok: false, reason: "offer_not_accepted" };
  }

  if (!canTransition(app.stage, "hired")) {
    return { ok: false, reason: "invalid_stage" };
  }

  const post = getCareerPost(postId);
  if (!post || post.status !== "active") return { ok: false, reason: "post_inactive" };

  const now = Date.now();

  if (!app.offerDetails || !isValidCareerOfferDetails(app.offerDetails, now)) {
    return { ok: false, reason: "invalid_offer" };
  }

  const priorApps = apps;
  const priorPosts = readCareerPosts();
  const activationSnapshots = captureCareerHireActivationSnapshots();

  const updatedApp = {
    ...app,
    stage: "hired" as const,
    hiredAt: now,
    updatedAt: now,
  };

  const appWrite = writeCareerApps(apps.map((item) => (item.id === appId ? updatedApp : item)));
  if (!appWrite.ok) return { ok: false, reason: "application_write_error" };

  const activation = activateCareerHire(post, updatedApp);
  if (!activation.ok) {
    writeCareerApps(priorApps);
    return { ok: false, reason: "activation_error" };
  }

  const nextPosts = priorPosts.map((item) =>
    item.id === postId ? { ...item, status: "filled" as const, updatedAt: now } : item,
  );

  const postWrite = writeCareerPosts(nextPosts);
  if (!postWrite.ok) {
    rollbackCareerHireActivationSnapshots(activationSnapshots);
    writeCareerApps(priorApps);
    return { ok: false, reason: "post_write_error" };
  }

  const searchWrite = syncToEmployeeCareerSearch(nextPosts);
  if (!searchWrite.ok) {
    writeCareerPosts(priorPosts);
    rollbackCareerHireActivationSnapshots(activationSnapshots);
    writeCareerApps(priorApps);
    return { ok: false, reason: "search_sync_error" };
  }

  pushCareerActivity({
    postId,
    kind: "candidate_hired",
    title: "Candidate hired",
    body: `${app.employeeName} hired as ${post.jobTitle}. Workspace created.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  const signature = `[CAREER_HIRED:${postId}:${appId}]`;

  if (!hasSimilarCareerNote(signature)) {
    notifyCrossRole({
      type: "CAREER_HIRED",
      domain: "career",
      affectedUserRole: "employee",
      postId,
      appId,
      title: "Congratulations! You are hired!",
      body: `${signature} You have been hired as ${post.jobTitle} at ${post.companyName}. Your onboarding workspace is ready.`,
      route: ROUTE_PATHS.employeeCareerWorkspace.replace(":workspaceId", activation.workspaceId),
    });
  }

  return { ok: true, workspaceId: activation.workspaceId };
}
