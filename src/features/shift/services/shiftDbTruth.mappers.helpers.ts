/** Job Mitra | shiftDbTruth.mappers.helpers.ts */

import type { ShiftPost } from "../../shared/shift/shiftEmployerPublic";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseMs(value: string, fallback: number): number {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : fallback;
}

export function buildShiftPostCreateBody(post: ShiftPost): Record<string, unknown> {
  return {
    job_name: post.jobName,
    category: post.category || "general",
    status: post.status ?? "active",
    vacancies: post.vacancies,
    start_at: new Date(post.startAt).toISOString(),
    end_at: new Date(post.endAt).toISOString(),
    details: {
      companyName: post.companyName,
      experience: post.experience,
      payPerDay: post.payPerDay,
      payBasis: post.payBasis,
      locationName: post.locationName,
      locationAddress: post.locationAddress,
      distanceKm: post.distanceKm,
      description: post.description,
      shiftTiming: post.shiftTiming,
      mapsLink: post.mapsLink,
      isHiddenFromSearch: post.isHiddenFromSearch,
      planId: post.planId,
      planSlotDate: post.planSlotDate,
      source: post.source,
      mustHave: post.mustHave,
      goodToHave: post.goodToHave,
      whatWeProvide: post.whatWeProvide,
      quickQuestions: post.quickQuestions,
      dressCode: post.dressCode,
      jobType: post.jobType,
      waitingBuffer: post.waitingBuffer,
      analysisStatus: post.analysisStatus,
      analyzedAt: post.analyzedAt,
      analysisNote: post.analysisNote,
      shortlistIds: post.shortlistIds,
      waitingIds: post.waitingIds,
      confirmedIds: post.confirmedIds,
      rejectedIds: post.rejectedIds,
      settings: post.settings,
    },
  };
}
