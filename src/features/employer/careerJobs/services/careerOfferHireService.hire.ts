// careerOfferHireService.hire.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  mustRollbackCareerLocalWrite,
  resolveCareerGateApplicationId,
} from "../../../career/services/careerGateApi.service";
import { hydrateCareerApplicationsFromServer } from "../../../career/services/careerDbTruth.service";
import {
  employmentRecordToServerDetails,
  upsertLocalEmploymentFromServer,
} from "../../../career/services/employmentDbTruth.service";
import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  readCareerApps,
  readCareerPosts,
  writeCareerApps,
  writeCareerPosts,
} from "../helpers/careerNormalizers";
import { hasSimilarCareerNote, pushCareerActivity } from "../helpers/careerNotifications";
import { canTransition, syncToEmployeeCareerSearch } from "../helpers/careerValidation";
import {
  activateCareerHire,
  captureCareerHireActivationSnapshots,
  rollbackCareerHireActivationSnapshots,
} from "./careerHireActivationService";
import { cascadeRejectOpenCareerApplications } from "./careerApplicationCascade.service";
import { getCareerPost } from "./careerPostService";
import {
  isValidCareerOfferDetails,
  type HireCandidateSagaResult,
} from "./careerOfferHireService.validation.helpers";

export async function hireCandidate(
  postId: string,
  appId: string,
): Promise<HireCandidateSagaResult> {
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

  const nextApps = apps.map((item) => (item.id === appId ? updatedApp : item));
  const appWrite = writeCareerApps(nextApps);
  if (!appWrite.ok) return { ok: false, reason: "application_write_error" };

  const activation = activateCareerHire(post, updatedApp);
  if (!activation.ok) {
    writeCareerApps(priorApps);
    return { ok: false, reason: "activation_error" };
  }

  // Re-read after write so vacancy fill uses freshest hired count (Wave 2 TOCTOU).
  const vacancies = Math.max(1, Math.floor(post.vacancies || 1));
  const hiredAfter = readCareerApps().filter(
    (item) => item.jobId === postId && item.stage === "hired",
  ).length;
  const shouldFill = hiredAfter >= vacancies;

  const nextPosts = priorPosts.map((item) =>
    item.id === postId
      ? {
          ...item,
          status: shouldFill ? ("filled" as const) : ("active" as const),
          updatedAt: now,
        }
      : item,
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

  if (isCareerApiSyncEnabled()) {
    const serverAppId = resolveCareerGateApplicationId(appId);
    if (mustRollbackCareerLocalWrite(serverAppId)) {
      writeCareerPosts(priorPosts);
      rollbackCareerHireActivationSnapshots(activationSnapshots);
      writeCareerApps(priorApps);
      return { ok: false, reason: "api_error" };
    }

    if (serverAppId) {
      try {
        const localEmployment = employmentStorage.getByPostId(postId);
        const details = localEmployment
          ? employmentRecordToServerDetails(localEmployment)
          : {
              careerPostId: postId,
              jobTitle: post.jobTitle,
              companyName: post.companyName,
              clientStatus: "selected",
            };

        const confirmed = await careerGateApi.confirmHire(serverAppId, { details });
        upsertLocalEmploymentFromServer(confirmed.employment);
        await hydrateCareerApplicationsFromServer();
      } catch {
        writeCareerPosts(priorPosts);
        rollbackCareerHireActivationSnapshots(activationSnapshots);
        writeCareerApps(priorApps);
        return { ok: false, reason: "api_error" };
      }
    }
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
      title: "You're hired",
      body: `${signature} You're in as ${post.jobTitle} at ${post.companyName}. Open your workspace when you're ready.`,
      route: ROUTE_PATHS.employeeCareerWorkspace.replace(":workspaceId", activation.workspaceId),
    });
  }

  if (shouldFill) {
    const cascade = await cascadeRejectOpenCareerApplications({
      postId,
      jobTitle: post.jobTitle,
      companyName: post.companyName,
      reason: "This position has been filled.",
      excludeAppId: appId,
    });

    // Hire already confirmed. If AUTH cascade fails, LS was rolled back —
    // still return hire success but do not leave a false "filled + apps closed" UX.
    if (!cascade.ok && cascade.reason === "api_error") {
      return {
        ok: true,
        workspaceId: activation.workspaceId,
        cascadeRejectFailed: true,
      };
    }
  }

  return { ok: true, workspaceId: activation.workspaceId };
}
