/** Job Mitra | shiftDbTruth.merge.apply.ts — pure in-memory merge (no LS write) */

import type { EmployeeShiftApplication, ShiftPost } from "../../shared/shift/shiftEmployerPublic";
import { shiftAppIdBridge, shiftPostIdBridge } from "../utils/shiftIdBridge";
import type { ServerShiftApplicationDto, ServerShiftPostDto } from "./shiftGateApi.service";
import { isRecord, parseMs } from "./shiftDbTruth.mappers.helpers";

export function applyServerPostMerge(
  posts: ShiftPost[],
  dto: ServerShiftPostDto,
  preferredLocalId?: string,
): { posts: ShiftPost[]; merged: ShiftPost } {
  const details = isRecord(dto.details) ? dto.details : {};
  const preferred = preferredLocalId?.trim()
    ? posts.find((p) => p.id === preferredLocalId.trim())
    : undefined;
  const bridged = shiftPostIdBridge.load().serverToLocal[dto.id];
  const existing =
    preferred ??
    posts.find((p) => p.id === dto.id) ??
    (bridged ? posts.find((p) => p.id === bridged) : undefined);

  shiftPostIdBridge.upsert(existing?.id ?? dto.id, dto.id);

  const startAt = parseMs(dto.start_at, existing?.startAt ?? Date.now());
  const endAt = parseMs(dto.end_at, existing?.endAt ?? startAt + 3_600_000);

  const merged: ShiftPost = {
    id: existing?.id ?? dto.id,
    companyName:
      typeof details.companyName === "string"
        ? details.companyName
        : (existing?.companyName ?? "Company"),
    jobName: dto.job_name || existing?.jobName || "Shift",
    category: dto.category || existing?.category || "general",
    experience:
      details.experience === "helper" ||
      details.experience === "fresher_ok" ||
      details.experience === "experienced"
        ? details.experience
        : (existing?.experience ?? "fresher_ok"),
    payPerDay:
      typeof details.payPerDay === "number" ? details.payPerDay : (existing?.payPerDay ?? 0),
    payBasis:
      details.payBasis === "per_hour" ||
      details.payBasis === "per_day" ||
      details.payBasis === "fixed_total" ||
      details.payBasis === "not_listed"
        ? details.payBasis
        : existing?.payBasis,
    locationName:
      typeof details.locationName === "string"
        ? details.locationName
        : (existing?.locationName ?? ""),
    locationAddress:
      typeof details.locationAddress === "string"
        ? details.locationAddress
        : existing?.locationAddress,
    distanceKm:
      typeof details.distanceKm === "number" ? details.distanceKm : (existing?.distanceKm ?? 0),
    startAt,
    endAt,
    description:
      typeof details.description === "string" ? details.description : existing?.description,
    shiftTiming:
      typeof details.shiftTiming === "string" ? details.shiftTiming : existing?.shiftTiming,
    mapsLink: typeof details.mapsLink === "string" ? details.mapsLink : existing?.mapsLink,
    isHiddenFromSearch:
      typeof details.isHiddenFromSearch === "boolean"
        ? details.isHiddenFromSearch
        : existing?.isHiddenFromSearch,
    planId: typeof details.planId === "string" ? details.planId : existing?.planId,
    planSlotDate:
      typeof details.planSlotDate === "string" ? details.planSlotDate : existing?.planSlotDate,
    source:
      details.source === "planner" || details.source === "single"
        ? details.source
        : existing?.source,
    mustHave: Array.isArray(details.mustHave)
      ? (details.mustHave as string[])
      : (existing?.mustHave ?? []),
    goodToHave: Array.isArray(details.goodToHave)
      ? (details.goodToHave as string[])
      : (existing?.goodToHave ?? []),
    whatWeProvide: Array.isArray(details.whatWeProvide)
      ? (details.whatWeProvide as string[])
      : existing?.whatWeProvide,
    quickQuestions: Array.isArray(details.quickQuestions)
      ? (details.quickQuestions as ShiftPost["quickQuestions"])
      : existing?.quickQuestions,
    dressCode: typeof details.dressCode === "string" ? details.dressCode : existing?.dressCode,
    jobType:
      details.jobType === "one-time" || details.jobType === "weekly" || details.jobType === "custom"
        ? details.jobType
        : existing?.jobType,
    vacancies: dto.vacancies || existing?.vacancies || 1,
    waitingBuffer:
      typeof details.waitingBuffer === "number"
        ? details.waitingBuffer
        : (existing?.waitingBuffer ?? 0),
    analysisStatus:
      details.analysisStatus === "done" || details.analysisStatus === "not_started"
        ? details.analysisStatus
        : (existing?.analysisStatus ?? "not_started"),
    analyzedAt: typeof details.analyzedAt === "number" ? details.analyzedAt : existing?.analyzedAt,
    analysisNote:
      typeof details.analysisNote === "string" ? details.analysisNote : existing?.analysisNote,
    shortlistIds: Array.isArray(details.shortlistIds)
      ? (details.shortlistIds as string[])
      : (existing?.shortlistIds ?? []),
    waitingIds: Array.isArray(details.waitingIds)
      ? (details.waitingIds as string[])
      : (existing?.waitingIds ?? []),
    confirmedIds: Array.isArray(details.confirmedIds)
      ? (details.confirmedIds as string[])
      : (existing?.confirmedIds ?? []),
    rejectedIds: Array.isArray(details.rejectedIds)
      ? (details.rejectedIds as string[])
      : (existing?.rejectedIds ?? []),
    status:
      dto.status === "active" || dto.status === "completed" || dto.status === "cancelled"
        ? dto.status
        : (existing?.status ?? "active"),
    settings: isRecord(details.settings)
      ? (details.settings as ShiftPost["settings"])
      : existing?.settings,
  };

  const next = existing
    ? posts.map((p) => (p.id === existing.id ? merged : p))
    : [merged, ...posts];

  return { posts: next, merged };
}

export function applyServerApplicationMerge(
  apps: EmployeeShiftApplication[],
  dto: ServerShiftApplicationDto,
  preferredLocalId?: string,
): { apps: EmployeeShiftApplication[]; merged: EmployeeShiftApplication } {
  const preferred = preferredLocalId?.trim()
    ? apps.find((a) => a.id === preferredLocalId.trim())
    : undefined;
  const bridged = shiftAppIdBridge.load().serverToLocal[dto.id];
  const existing =
    preferred ??
    apps.find((a) => a.id === dto.id) ??
    (bridged ? apps.find((a) => a.id === bridged) : undefined) ??
    apps.find((a) => {
      const serverPost = shiftPostIdBridge.resolveServerId(a.postId);
      if (serverPost !== dto.post_id || a.status === "withdrawn") return false;
      const localWorker = a.profileSnapshot?.uniqueId?.trim().toUpperCase() ?? "";
      const serverWorker = dto.worker_wm_id?.trim().toUpperCase() ?? "";
      if (!serverWorker || !localWorker) return false;
      return localWorker === serverWorker;
    });

  shiftAppIdBridge.upsert(existing?.id ?? dto.id, dto.id);
  shiftPostIdBridge.upsert(existing?.postId ?? dto.post_id, dto.post_id);

  const details = isRecord(dto.details) ? dto.details : {};
  const createdAt = parseMs(dto.created_at, existing?.createdAt ?? Date.now());

  const status = (
    [
      "applied",
      "shortlisted",
      "waiting",
      "confirmed",
      "rejected",
      "withdrawn",
      "replaced",
      "exited",
    ] as const
  ).includes(dto.status as EmployeeShiftApplication["status"])
    ? (dto.status as EmployeeShiftApplication["status"])
    : (existing?.status ?? "applied");

  const merged: EmployeeShiftApplication = {
    id: existing?.id ?? dto.id,
    postId: existing?.postId ?? dto.post_id,
    createdAt,
    status,
    profileSnapshot: {
      ...(existing?.profileSnapshot ?? {}),
      uniqueId: dto.worker_wm_id || existing?.profileSnapshot?.uniqueId,
      ...(isRecord(details.profileSnapshot) ? details.profileSnapshot : {}),
    },
    mustHaveAnswers: isRecord(details.mustHaveAnswers)
      ? (details.mustHaveAnswers as EmployeeShiftApplication["mustHaveAnswers"])
      : (existing?.mustHaveAnswers ?? {}),
    goodToHaveAnswers: isRecord(details.goodToHaveAnswers)
      ? (details.goodToHaveAnswers as EmployeeShiftApplication["goodToHaveAnswers"])
      : (existing?.goodToHaveAnswers ?? {}),
    notes: isRecord(details.notes)
      ? (details.notes as EmployeeShiftApplication["notes"])
      : (existing?.notes ?? {}),
    quickAnswers: isRecord(details.quickAnswers)
      ? (details.quickAnswers as EmployeeShiftApplication["quickAnswers"])
      : existing?.quickAnswers,
  };

  const next = existing ? apps.map((a) => (a.id === existing.id ? merged : a)) : [merged, ...apps];

  return { apps: next, merged };
}
