// src/features/employer/hrManagement/storage/hrStorage.offer.ts
//
// Offer lifecycle: move to HR → send offer → accept/reject.

import type {
  HRCandidateRecord,
  OfferLetter,
  OnboardingItem,
} from "../types/hrManagement.types";
import { DEFAULT_ONBOARDING_ITEMS } from "../types/hrManagement.types";
import {
  readAll,
  writeAll,
  genId,
  genItemId,
  pushStatusChange,
  hrGetById,
  hrUpdate,
  hrFindByApplication,
} from "./hrStorage.core";

/* ------------------------------------------------ */
/* Move to HR (from Career pipeline)                */
/* ------------------------------------------------ */
export function hrMoveToHR(data: {
  careerPostId: string;
  applicationId: string;
  employeeUniqueId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  location: string;
}): string {
  const existing = hrFindByApplication(data.careerPostId, data.applicationId);
  if (existing) return existing.id;

  const now = Date.now();
  const record: HRCandidateRecord = {
    id: genId(),
    careerPostId: data.careerPostId,
    applicationId: data.applicationId,
    employeeUniqueId: data.employeeUniqueId,
    employeeName: data.employeeName,
    jobTitle: data.jobTitle,
    department: data.department,
    location: data.location,
    status: "offer_pending",
    statusHistory: [{
      id: genId(),
      from: "interview_cleared",
      to: "offer_pending",
      changedAt: now,
      changedBy: "system",
      note: "Moved to HR after clearing all interview rounds",
    }],
    movedToHRAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const all = readAll();
  writeAll([record, ...all]);
  return record.id;
}

/* ------------------------------------------------ */
/* Send Offer                                       */
/* ------------------------------------------------ */
export function hrSendOffer(
  id: string,
  offer: Omit<OfferLetter, "sentAt" | "respondedAt" | "response" | "rejectionReason">,
): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "offer_pending") return false;

  const fullOffer: OfferLetter = { ...offer, sentAt: Date.now() };

  return hrUpdate(id, {
    status: "offered",
    offerLetter: fullOffer,
    statusHistory: pushStatusChange(rec, "offer_pending", "offered", "employer", "Offer letter sent"),
  });
}

/* ------------------------------------------------ */
/* Accept Offer                                     */
/* ------------------------------------------------ */
export function hrAcceptOffer(id: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "offered" || !rec.offerLetter) return false;

  const now = Date.now();

  const updatedOffer: OfferLetter = {
    ...rec.offerLetter,
    respondedAt: now,
    response: "accepted",
  };

  const defaultItems: OnboardingItem[] = DEFAULT_ONBOARDING_ITEMS.map((item) => ({
    id: genItemId(),
    label: item.label,
    isDefault: true,
  }));

  return hrUpdate(id, {
    status: "hired",
    offerLetter: updatedOffer,
    onboarding: { items: defaultItems, startedAt: now },
    statusHistory: pushStatusChange(rec, "offered", "hired", "system", "Employee accepted offer"),
  });
}

/* ------------------------------------------------ */
/* Reject Offer                                     */
/* ------------------------------------------------ */
export function hrRejectOffer(id: string, reason?: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "offered" || !rec.offerLetter) return false;

  const updatedOffer: OfferLetter = {
    ...rec.offerLetter,
    respondedAt: Date.now(),
    response: "rejected",
    rejectionReason: reason,
  };

  return hrUpdate(id, {
    status: "offer_rejected",
    offerLetter: updatedOffer,
    statusHistory: pushStatusChange(rec, "offered", "offer_rejected", "system", reason ? `Rejected: ${reason}` : "Employee rejected offer"),
  });
}