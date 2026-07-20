// App name: Job Mitra
// File name: myShiftWorkspaces.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\helpers\myShiftWorkspaces.helpers.ts

import type {
  ShiftWorkspace,
  ShiftWorkspaceStatus,
} from "../../shiftJobs/storage/shiftWorkspaces.storage";
import type { MyShiftWorkspaceCounts, MyShiftWorkspaceTab } from "../types/myShiftWorkspaces.types";

export function formatWorkspaceDateRange(startAt: number, endAt: number): string {
  try {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const sameDay = start.toDateString() === end.toDateString();

    const startText = start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    const endText = end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return sameDay ? startText : `${startText} - ${endText}`;
  } catch {
    return "Date";
  }
}

export function getWorkspaceCategoryLabel(category: ShiftWorkspace["category"]): string {
  if (category === "construction") return "Construction";
  if (category === "kitchen") return "Kitchen";
  if (category === "office") return "Office";
  if (category === "delivery") return "Delivery";
  return "Other";
}

export function getWorkspaceStatusLabel(status: ShiftWorkspaceStatus): string {
  if (status === "active") return "Active";
  if (status === "upcoming") return "Upcoming";
  if (status === "completed") return "Completed";
  return "Closed";
}

export function workspaceTabMatches(
  status: ShiftWorkspaceStatus,
  tab: MyShiftWorkspaceTab,
): boolean {
  if (tab === "all") return true;
  if (tab === "closed") return isClosedWorkspaceStatus(status);
  return status === tab;
}

export function getWorkspaceCounts(list: ShiftWorkspace[]): MyShiftWorkspaceCounts {
  const result: MyShiftWorkspaceCounts = {
    active: 0,
    upcoming: 0,
    completed: 0,
    closed: 0,
    all: list.length,
  };

  for (const workspace of list) {
    if (workspace.status === "active") result.active += 1;
    else if (workspace.status === "upcoming") result.upcoming += 1;
    else if (workspace.status === "completed") result.completed += 1;
    else if (isClosedWorkspaceStatus(workspace.status)) result.closed += 1;
  }

  return result;
}

export function getWorkspaceEmptyTitle(tab: MyShiftWorkspaceTab): string {
  if (tab === "active") return "No active groups";
  if (tab === "upcoming") return "No upcoming groups";
  if (tab === "completed") return "No completed groups";
  if (tab === "closed") return "No closed groups";
  return "No groups";
}

export function getWorkspaceEmptyBody(tab: MyShiftWorkspaceTab): string {
  if (tab === "active") return "Your currently active confirmed shift groups appear here.";
  if (tab === "upcoming") return "Upcoming confirmed shift groups appear here before work starts.";
  if (tab === "completed") return "Completed shift groups appear here after work is finished.";
  if (tab === "closed") return "Groups you left or assignments closed by status appear here.";
  return "Confirmed shifts create a workspace group here.";
}

export function filterWorkspaces(
  list: ShiftWorkspace[],
  tab: MyShiftWorkspaceTab,
  query: string,
): ShiftWorkspace[] {
  const cleanQuery = query.trim().toLowerCase();

  return list
    .filter((workspace) => workspaceTabMatches(workspace.status, tab))
    .filter((workspace) => {
      if (!cleanQuery) return true;

      const searchableText = [workspace.companyName, workspace.jobName, workspace.locationName]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(cleanQuery);
    });
}

function isClosedWorkspaceStatus(status: ShiftWorkspaceStatus): boolean {
  return status === "left" || status === "replaced" || status === "cancelled";
}
