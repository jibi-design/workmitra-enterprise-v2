// careerOfferHireService.offer.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  resolveCareerGateApplicationId,
} from "../../../career/services/careerGateApi.service";
import { hydrateCareerApplicationsFromServer } from "../../../career/services/careerDbTruth.service";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";
import { hasSimilarCareerNote, pushCareerActivity } from "../helpers/careerNotifications";
import { canTransition } from "../helpers/careerValidation";
import type { CareerOfferInput } from "../types/careerTypes";
import { isValidCareerOfferDetails } from "./careerOfferHireService.validation.helpers";
import { getCareerPost } from "./careerPostService";

export async function sendOffer(
  postId: string,
  appId: string,
  offerDetails: CareerOfferInput,
): Promise<boolean> {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);

  if (!app || !canTransition(app.stage, "offered")) return false;

  const post = getCareerPost(postId);
  if (!post || post.status !== "active") return false;

  const now = Date.now();

  if (!isValidCareerOfferDetails(offerDetails, now)) return false;

  const priorApps = apps;

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

  if (isCareerApiSyncEnabled()) {
    const serverAppId = resolveCareerGateApplicationId(appId);
    if (!serverAppId) {
      writeCareerApps(priorApps);
      return false;
    }

    try {
      await careerGateApi.issueOffer(serverAppId, {
        terms: {
          jobTitle: offerDetails.jobTitle,
          salary: offerDetails.salary,
          salaryPeriod: offerDetails.salaryPeriod,
          startDate: offerDetails.startDate,
          noticePeriodDays: offerDetails.noticePeriodDays,
          message: offerDetails.message ?? "",
        },
      });
      await hydrateCareerApplicationsFromServer();
    } catch {
      writeCareerApps(priorApps);
      return false;
    }
  }

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
