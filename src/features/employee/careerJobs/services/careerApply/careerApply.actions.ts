// Career apply — queries and mutations (apply, offer, withdraw).

import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
} from "../../../../career/services/careerGateApi.service";
import {
  applyServerTruthAfterApply,
  hydrateCareerApplicationsFromServer,
  requireCareerServerApplicationId,
  requireCareerServerPostId,
} from "../../../../career/services/careerDbTruth.service";
import { queuePulseEventForAffectedUser } from "../../../../../features/pulse/pulseEventBridge";
import { pushCareerActivity } from "../../../../career/services/careerEmployerPublic";
import { uid } from "../../../../career/helpers/careerStoragePublic";
import {
  getCareerPost,
  isValidCareerOfferDetails,
  canTransition,
} from "../../../../career/services/careerEmployerPublic";
import { employeeProfileStorage } from "../../../profile/storage/employeeProfile.storage";
import type { CareerApplication } from "../../../../career/types/careerDomainTypes";
import {
  buildProfileSnapshot,
  getCurrentEmployeeId,
  readAllApps,
  writeAllApps,
} from "./careerApply.storage";
import {
  canDeclineOfferStage,
  canWithdrawApplicationStage,
  isValidApplyInput,
  normalizeExpectedSalary,
  normalizeNoticePeriod,
} from "./careerApply.validation";
import type { AcceptCareerOfferResult, CareerApplyInput } from "./careerApply.types";
import { sanitizeUserText } from "../../../../../shared/security/sanitizeUserText";

export function hasExistingApplication(jobId: string): CareerApplication | null {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readAllApps();
  const match = apps.find(
    (app) =>
      app.jobId === jobId &&
      app.employeeId === currentEmployeeId &&
      app.stage !== "withdrawn" &&
      app.stage !== "offer_declined" &&
      app.stage !== "rejected",
  );
  return match ?? null;
}

export function getMyApplicationForJob(jobId: string): CareerApplication | null {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readAllApps();
  const sorted = apps
    .filter((app) => app.jobId === jobId && app.employeeId === currentEmployeeId)
    .sort((a, b) => b.appliedAt - a.appliedAt);
  return sorted[0] ?? null;
}

export async function applyToCareerJob(input: CareerApplyInput): Promise<CareerApplication | null> {
  const post = getCareerPost(input.jobId);
  if (!post) return null;

  const now = Date.now();
  if (!isValidApplyInput(input, post, now)) return null;

  const existing = hasExistingApplication(input.jobId);
  if (existing) return null;

  const profile = employeeProfileStorage.get();
  const employeeId = getCurrentEmployeeId();

  const app: CareerApplication = {
    id: uid("capp"),
    jobId: input.jobId,
    employeeId,
    employeeName: profile.fullName.trim() || "Applicant",
    employeePhone: input.employeePhone?.trim() ?? "",
    employeeEmail: input.employeeEmail?.trim() ?? "",
    resumeSummary: sanitizeUserText(input.resumeSummary?.trim() ?? "", 2000),
    coverNote: sanitizeUserText(input.coverNote.trim(), 600),
    expectedSalary: normalizeExpectedSalary(input.expectedSalary),
    noticePeriod: normalizeNoticePeriod(input.noticePeriod),
    profileSnapshot: buildProfileSnapshot(),
    stage: "applied",
    currentRound: 0,
    roundResults: [],
    appliedAt: Date.now(),
    updatedAt: Date.now(),
    employerNotes: "",
    screeningAnswers: post.screeningQuestions?.length ? input.screeningAnswers : undefined,
  };

  const priorApps = readAllApps();
  const writeResult = writeAllApps([app, ...priorApps]);
  if (!writeResult.ok) return null;

  if (isCareerApiSyncEnabled()) {
    const serverPostId = requireCareerServerPostId(input.jobId);
    if (!serverPostId) {
      writeAllApps(priorApps);
      return null;
    }

    try {
      const serverApp = await careerGateApi.applyToJob(serverPostId, {
        cover_note: app.coverNote,
      });
      const merged = applyServerTruthAfterApply(app.id, serverApp);
      queuePulseEventForAffectedUser({
        type: "CAREER_APPLICATION_SUBMITTED",
        domain: "career",
        affectedUserRole: "employer",
        targetId: app.jobId,
        postId: app.jobId,
        appId: merged?.id ?? app.id,
        severity: "urgent",
      });
      return merged ?? app;
    } catch {
      writeAllApps(priorApps);
      return null;
    }
  }

  queuePulseEventForAffectedUser({
    type: "CAREER_APPLICATION_SUBMITTED",
    domain: "career",
    affectedUserRole: "employer",
    targetId: app.jobId,
    postId: app.jobId,
    appId: app.id,
    severity: "urgent",
  });

  return app;
}

export async function acceptCareerOffer(jobId: string): Promise<AcceptCareerOfferResult> {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readAllApps();
  const app = apps.find((item) => item.jobId === jobId && item.employeeId === currentEmployeeId);

  if (!app) return { ok: false, reason: "not_found" };
  if (app.stage !== "offered" || !canTransition(app.stage, "offer_accepted")) {
    return { ok: false, reason: "invalid_stage" };
  }

  const post = getCareerPost(jobId);
  if (!post || post.status !== "active") return { ok: false, reason: "post_inactive" };

  const now = Date.now();
  if (!app.offerDetails || !isValidCareerOfferDetails(app.offerDetails, now)) {
    return { ok: false, reason: "invalid_offer" };
  }

  const priorApps = apps;
  const updatedApp: CareerApplication = {
    ...app,
    stage: "offer_accepted",
    offerAcceptedAt: now,
    updatedAt: now,
  };

  const appWrite = writeAllApps(apps.map((item) => (item.id === app.id ? updatedApp : item)));
  if (!appWrite.ok) return { ok: false, reason: "application_write_error" };

  if (isCareerApiSyncEnabled()) {
    const serverAppId = requireCareerServerApplicationId(app.id);
    if (!serverAppId) {
      writeAllApps(priorApps);
      return { ok: false, reason: "api_error" };
    }

    try {
      await careerGateApi.acceptOffer(serverAppId);
      await hydrateCareerApplicationsFromServer();
    } catch {
      writeAllApps(priorApps);
      return { ok: false, reason: "api_error" };
    }
  }

  queuePulseEventForAffectedUser({
    type: "CAREER_OFFER_ACCEPTED",
    domain: "career",
    affectedUserRole: "employer",
    targetId: jobId,
    postId: jobId,
    appId: app.id,
    severity: "urgent",
  });

  pushCareerActivity({
    postId: jobId,
    kind: "offer_accepted",
    title: "Offer accepted",
    body: `${app.employeeName} accepted the offer for ${post.jobTitle}. Awaiting employer confirmation.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", jobId),
  });

  return { ok: true };
}

export async function declineCareerOffer(jobId: string): Promise<boolean> {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readAllApps();
  const app = apps.find((item) => item.jobId === jobId && item.employeeId === currentEmployeeId);

  if (!app || !canDeclineOfferStage(app.stage)) return false;

  const post = getCareerPost(jobId);
  const now = Date.now();
  const priorApps = apps;

  const nextApps = apps.map((item) =>
    item.id === app.id
      ? { ...item, stage: "offer_declined" as const, withdrawnAt: now, updatedAt: now }
      : item,
  );

  const writeResult = writeAllApps(nextApps);
  if (!writeResult.ok) return false;

  if (isCareerApiSyncEnabled()) {
    const serverAppId = requireCareerServerApplicationId(app.id);
    if (!serverAppId) {
      writeAllApps(priorApps);
      return false;
    }

    try {
      await careerGateApi.declineOffer(serverAppId);
      await hydrateCareerApplicationsFromServer();
    } catch {
      writeAllApps(priorApps);
      return false;
    }
  }

  if (post) {
    queuePulseEventForAffectedUser({
      type: "CAREER_OFFER_REJECTED",
      domain: "career",
      affectedUserRole: "employer",
      targetId: jobId,
      postId: jobId,
      appId: app.id,
      severity: "warning",
    });

    pushCareerActivity({
      postId: jobId,
      kind: "candidate_withdrawn",
      title: "Offer declined",
      body: `${app.employeeName} declined the offer for ${post.jobTitle}.`,
      route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", jobId),
    });
  }

  return true;
}

/** AUTH-on dual-writes withdraw to server; AUTH-off / E2E: LS cache only. */
export async function withdrawCareerApplication(jobId: string): Promise<boolean> {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readAllApps();
  const app = apps.find((item) => item.jobId === jobId && item.employeeId === currentEmployeeId);

  if (!app || !canWithdrawApplicationStage(app.stage)) return false;

  const now = Date.now();
  const priorApps = apps;

  const writeResult = writeAllApps(
    apps.map((item) =>
      item.id === app.id
        ? { ...item, stage: "withdrawn" as const, withdrawnAt: now, updatedAt: now }
        : item,
    ),
  );

  if (!writeResult.ok) return false;

  if (isCareerApiSyncEnabled()) {
    const serverAppId = requireCareerServerApplicationId(app.id);
    if (!serverAppId) {
      writeAllApps(priorApps);
      return false;
    }

    try {
      await careerGateApi.withdrawApplication(serverAppId);
      await hydrateCareerApplicationsFromServer();
    } catch {
      writeAllApps(priorApps);
      return false;
    }
  }

  return true;
}

/** UI gate: stage-allowed. */
export function canShowCareerWithdraw(stage: CareerApplication["stage"] | undefined): boolean {
  if (!stage) return false;
  return canWithdrawApplicationStage(stage);
}

/** Legacy gate — withdraw API is available; always allow stage-based withdraw UI. */
export function isCareerWithdrawOnlineBlocked(): boolean {
  return false;
}
