// App: Job Mitra / WorkMitra_Enterprise_v2
// File: employeeCareerWorkspaces.helpers.ts

import type { CareerEmploymentFeedbackTask } from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import type { CareerWorkspace } from "../../../career/types/careerDomainTypes";
import {
  CAREER_WORKSPACES_CHANGED,
  CAREER_WORKSPACES_KEY,
  safeParse,
} from "../../../career/helpers/careerStoragePublic";

let cacheRaw: string | null = "__init__";
let cacheList: CareerWorkspace[] = [];

export function getCareerWorkspacesSnapshot(): CareerWorkspace[] {
  const raw = localStorage.getItem(CAREER_WORKSPACES_KEY);

  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheList = safeParse<CareerWorkspace>(raw)
      .filter(
        (workspace): workspace is CareerWorkspace =>
          typeof workspace === "object" &&
          workspace !== null &&
          typeof (workspace as CareerWorkspace).id === "string" &&
          typeof (workspace as CareerWorkspace).jobId === "string",
      )
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  }

  return cacheList;
}

export function subscribeCareerWorkspaces(callback: () => void): () => void {
  const handler = () => callback();
  const events = ["storage", "focus", CAREER_WORKSPACES_CHANGED];

  for (const eventName of events) window.addEventListener(eventName, handler);
  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const eventName of events) window.removeEventListener(eventName, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

export function parseFeedbackTasks(raw: string): CareerEmploymentFeedbackTask[] {
  try {
    const parsed = JSON.parse(raw) as CareerEmploymentFeedbackTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function hasCompletedFeedbackForJob(
  tasks: CareerEmploymentFeedbackTask[],
  careerPostId: string,
): boolean {
  return tasks.some(
    (task) =>
      task.careerPostId === careerPostId &&
      task.state === "completed" &&
      Array.isArray(task.selectedTags) &&
      task.selectedTags.length > 0,
  );
}

export function fmtWorkspaceDateTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export type WorkspaceBadgeTone = "career" | "neutral" | "bad";

export function workspaceStatusTone(status: string): WorkspaceBadgeTone {
  if (status === "terminated") return "bad";
  if (status === "completed") return "neutral";
  return "career";
}

export function workspaceStatusLabel(status: string): string {
  if (status === "onboarding" || status === "active") return "Currently Working";
  if (status === "completed") return "Completed";
  if (status === "terminated") return "Terminated";
  return status;
}

export function workspaceUpdateLabel(count: number): string {
  return `${count} update${count === 1 ? "" : "s"}`;
}
