/** Job Mitra | careerPostDbTruth.service.ts | src/features/career/services/careerPostDbTruth.service.ts
 *
 * Phase 12B — Career posts DB-authoritative sync.
 * Auth on: DB owns post identity/status; LS is merge cache for rich UI fields.
 * Auth off: callers keep demo/E2E LS-only paths.
 */

import {
  notifyCareerPostsChanged,
  safeParse,
  safeRead,
  safeWrite,
} from "../helpers/careerStoragePublic";
import { resolveCareerEmployerScopedKey } from "../../shared/career/careerEmployerScope";
import type { CareerJobPost, CareerPostStatus } from "../types/careerDomainTypes";
import { careerPostIdBridge } from "../utils/careerPostIdBridge";
import { isCareerServerUuid } from "../utils/careerAppIdBridge";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  type ServerCareerPostDto,
} from "./careerGateApi.service";

function careerPostsStorageKey(): string {
  return resolveCareerEmployerScopedKey("career_posts_v1");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readLocalPosts(): CareerJobPost[] {
  return safeParse<CareerJobPost>(safeRead(careerPostsStorageKey()));
}

function writeLocalPosts(posts: CareerJobPost[]): boolean {
  const result = safeWrite(careerPostsStorageKey(), posts);
  if (!result.ok) return false;
  notifyCareerPostsChanged();
  return true;
}

function parseIsoMs(value: string, fallback: number): number {
  if (!value.trim()) return fallback;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : fallback;
}

/** Map client status → server columnar status. */
export function toServerCareerPostStatus(
  status: CareerPostStatus,
): "draft" | "published" | "closed" {
  if (status === "draft" || status === "paused") return "draft";
  if (status === "closed" || status === "filled") return "closed";
  return "published";
}

function toClientStatusFromServer(
  serverStatus: string,
  details: Record<string, unknown>,
): CareerPostStatus {
  const fromDetails = details.clientStatus;
  if (
    fromDetails === "draft" ||
    fromDetails === "active" ||
    fromDetails === "paused" ||
    fromDetails === "closed" ||
    fromDetails === "filled"
  ) {
    return fromDetails;
  }
  if (serverStatus === "draft") return "draft";
  if (serverStatus === "closed" || serverStatus === "deleted") return "closed";
  return "active";
}

function buildDetailsPayload(post: CareerJobPost): Record<string, unknown> {
  return {
    clientStatus: post.status,
    employerId: post.employerId,
    companyName: post.companyName,
    jobTitle: post.jobTitle,
    department: post.department,
    jobType: post.jobType,
    workMode: post.workMode,
    location: post.location,
    locationPincode: post.locationPincode,
    vacancies: post.vacancies,
    probationPeriod: post.probationPeriod,
    salaryMin: post.salaryMin,
    salaryMax: post.salaryMax,
    salaryPeriod: post.salaryPeriod,
    noticePeriodDays: post.noticePeriodDays ?? 0,
    experienceMin: post.experienceMin,
    experienceMax: post.experienceMax,
    qualifications: post.qualifications,
    skills: post.skills,
    description: post.description,
    responsibilities: post.responsibilities,
    interviewRounds: post.interviewRounds,
    roundConfigs: post.roundConfigs,
    closingDate: post.closingDate,
    screeningQuestions: post.screeningQuestions ?? [],
    isTemplate: post.isTemplate,
    templateName: post.templateName,
    clonedFrom: post.clonedFrom,
  };
}

export function buildServerPostCreateBody(post: CareerJobPost): Record<string, unknown> {
  return {
    title: post.jobTitle,
    description: post.description || post.jobTitle,
    location: post.location || null,
    locationPincode: post.locationPincode || null,
    status: toServerCareerPostStatus(post.status),
    details: buildDetailsPayload(post),
  };
}

function stubFromServer(dto: ServerCareerPostDto): CareerJobPost | null {
  if (!isCareerServerUuid(dto.id)) return null;
  const details = isRecord(dto.details) ? dto.details : {};
  const now = Date.now();
  const createdAt = parseIsoMs(dto.created_at, now);
  const updatedAt = parseIsoMs(dto.updated_at, createdAt);
  const clientStatus = toClientStatusFromServer(dto.status, details);

  const asString = (key: string, fallback = ""): string =>
    typeof details[key] === "string" ? (details[key] as string) : fallback;
  const asNumber = (key: string, fallback = 0): number =>
    typeof details[key] === "number" && Number.isFinite(details[key] as number)
      ? (details[key] as number)
      : fallback;
  const asStringArray = (key: string): string[] =>
    Array.isArray(details[key])
      ? (details[key] as unknown[]).filter((x): x is string => typeof x === "string")
      : [];

  return {
    id: dto.id,
    employerId: asString("employerId", ""),
    companyName: asString("companyName", "Company"),
    jobTitle: asString("jobTitle", dto.title),
    department: asString("department", ""),
    jobType:
      details.jobType === "part-time" || details.jobType === "contract"
        ? details.jobType
        : "full-time",
    workMode:
      details.workMode === "remote" || details.workMode === "hybrid" ? details.workMode : "on-site",
    location: asString("location", dto.location ?? ""),
    locationPincode:
      typeof details.locationPincode === "string"
        ? details.locationPincode
        : typeof dto.location_pincode === "string"
          ? dto.location_pincode
          : "",
    vacancies: Math.max(1, asNumber("vacancies", 1)),
    probationPeriod: asString("probationPeriod", "none"),
    salaryMin: asNumber("salaryMin", 0),
    salaryMax: asNumber("salaryMax", 0),
    salaryPeriod: details.salaryPeriod === "yearly" ? "yearly" : "monthly",
    noticePeriodDays: asNumber("noticePeriodDays", 0),
    experienceMin: asNumber("experienceMin", 0),
    experienceMax: asNumber("experienceMax", 0),
    qualifications: asStringArray("qualifications"),
    skills: asStringArray("skills"),
    description: asString("description", dto.description),
    responsibilities: asStringArray("responsibilities"),
    interviewRounds: Math.max(1, asNumber("interviewRounds", 1)),
    roundConfigs: Array.isArray(details.roundConfigs)
      ? (details.roundConfigs as CareerJobPost["roundConfigs"])
      : [{ round: 1, label: "Screening", mode: "phone" }],
    status: clientStatus,
    createdAt,
    updatedAt,
    closingDate: asNumber("closingDate", createdAt + 30 * 86_400_000),
    screeningQuestions: Array.isArray(details.screeningQuestions)
      ? (details.screeningQuestions as CareerJobPost["screeningQuestions"])
      : undefined,
    isTemplate: details.isTemplate === true,
    templateName: typeof details.templateName === "string" ? details.templateName : undefined,
    clonedFrom: typeof details.clonedFrom === "string" ? details.clonedFrom : undefined,
    totalApplications: 0,
    shortlisted: 0,
    inInterview: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
  };
}

/**
 * Merge one server post into LS. DB id/status/timestamps win; rich details from server.details
 * merged over local twin when present.
 */
export function mergeServerPostIntoLsCache(
  dto: ServerCareerPostDto,
  preferredLocalPostId?: string,
): CareerJobPost | null {
  const stub = stubFromServer(dto);
  if (!stub) return null;

  const posts = readLocalPosts();
  const preferred = preferredLocalPostId?.trim()
    ? posts.find((p) => p.id === preferredLocalPostId.trim())
    : undefined;
  const bridgedLocal = careerPostIdBridge.load().serverToLocal[dto.id];
  const existing =
    preferred ??
    posts.find((p) => p.id === dto.id) ??
    (bridgedLocal ? posts.find((p) => p.id === bridgedLocal) : undefined);

  careerPostIdBridge.upsert(existing?.id ?? dto.id, dto.id);

  if (existing) {
    const merged: CareerJobPost = {
      ...existing,
      ...stub,
      id: existing.id,
      // Keep analytics from local recompute path
      totalApplications: existing.totalApplications,
      shortlisted: existing.shortlisted,
      inInterview: existing.inInterview,
      offered: existing.offered,
      hired: existing.hired,
      rejected: existing.rejected,
    };
    writeLocalPosts(posts.map((p) => (p.id === existing.id ? merged : p)));
    return merged;
  }

  writeLocalPosts([stub, ...posts]);
  return stub;
}

let hydrateInFlight: Promise<CareerJobPost[]> | null = null;
let lastHydrateAt = 0;
const HYDRATE_COOLDOWN_MS = 5_000;

export async function hydrateCareerPostsFromServer(): Promise<CareerJobPost[]> {
  if (!isCareerApiSyncEnabled()) {
    return readLocalPosts();
  }

  const now = Date.now();
  if (hydrateInFlight) return hydrateInFlight;
  if (now - lastHydrateAt < HYDRATE_COOLDOWN_MS) {
    return readLocalPosts();
  }

  hydrateInFlight = (async () => {
    try {
      const serverPosts = await careerGateApi.listMyCareerPosts();
      for (const dto of serverPosts) {
        mergeServerPostIntoLsCache(dto);
      }
      lastHydrateAt = Date.now();
    } catch {
      // LS cache fallback
    } finally {
      hydrateInFlight = null;
    }
    return readLocalPosts();
  })();

  return hydrateInFlight;
}

export function removeLocalCareerPost(postId: string): void {
  const next = readLocalPosts().filter((p) => p.id !== postId);
  writeLocalPosts(next);
}
