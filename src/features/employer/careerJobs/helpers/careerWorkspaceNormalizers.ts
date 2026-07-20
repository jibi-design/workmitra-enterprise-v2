// App name: Job Mitra
// File name: careerWorkspaceNormalizers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerWorkspaceNormalizers.ts

import type { CareerWorkspace, CareerWorkspaceUpdate } from "../types/careerTypes";
import { getNumber, getString, isRecord, uid } from "./careerStorageUtils";

export function normalizeWorkspaceUpdate(raw: unknown): CareerWorkspaceUpdate | null {
  if (!isRecord(raw)) return null;

  const title = getString(raw, "title");
  if (!title) return null;

  const kindVal = raw["kind"];
  const kind: CareerWorkspaceUpdate["kind"] =
    kindVal === "broadcast" || kindVal === "direct" ? kindVal : "system";

  return {
    id: getString(raw, "id") ?? uid("cu"),
    createdAt: getNumber(raw, "createdAt") ?? Date.now(),
    kind,
    title,
    body: getString(raw, "body"),
  };
}

export function normalizeCareerWorkspace(raw: unknown): CareerWorkspace | null {
  if (!isRecord(raw)) return null;

  const idVal = getString(raw, "id");
  const jobId = getString(raw, "jobId");

  if (!idVal || !jobId) return null;

  const rawUpdates = Array.isArray(raw["updates"]) ? raw["updates"] : [];
  const updates = (rawUpdates as unknown[])
    .map(normalizeWorkspaceUpdate)
    .filter((item): item is CareerWorkspaceUpdate => item !== null);

  const statusVal = raw["status"];
  const status: CareerWorkspace["status"] =
    statusVal === "onboarding" || statusVal === "completed" || statusVal === "terminated"
      ? statusVal
      : "active";

  return {
    id: idVal,
    jobId,
    companyName: getString(raw, "companyName") ?? "Company",
    jobTitle: getString(raw, "jobTitle") ?? "Position",
    department: getString(raw, "department") ?? "",
    location: getString(raw, "location") ?? "",
    status,
    lastActivityAt: getNumber(raw, "lastActivityAt") ?? Date.now(),
    unreadCount: getNumber(raw, "unreadCount") ?? 0,
    updates,
    hiredAt: getNumber(raw, "hiredAt") ?? Date.now(),
  };
}
