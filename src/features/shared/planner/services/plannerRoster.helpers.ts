/**
 * Job Mitra | plannerRoster.helpers.ts
 * Hybrid A2 S7 — roster assignment projection.
 * Hybrid A2 S8 — resolve day/pay from plan slots when dual-write ShiftPost is absent.
 */

import { demandPlannerStorage } from "../../../employer/planner/storage/demandPlannerStorage";
import {
  getEmployerShiftPosts,
  readEmployeeApplications,
  readEmployeeWorkspaces,
  type EmployeeShiftApplication,
  type ShiftPost,
} from "../ports/plannerLegacyShiftBridge";

export type PlannerRosterDay = {
  date: string;
  postId: string;
  appId: string;
  workspaceId: string | null;
  status: EmployeeShiftApplication["status"];
  payPerDay: number;
};

export type PlannerRosterAssignment = {
  planId: string;
  planName: string;
  companyName: string;
  workerMlId: string;
  workerName: string;
  employerMlId: string;
  siteManagerId?: string;
  siteId?: string;
  joinedAt: number;
  epochDays: number;
  days: PlannerRosterDay[];
};

function isoFromPost(post: ShiftPost | undefined): string {
  if (post?.planSlotDate?.trim()) return post.planSlotDate.trim();
  if (post?.startAt) {
    const d = new Date(post.startAt);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return "";
}

function resolveAppDay(
  app: EmployeeShiftApplication,
  plan: ReturnType<typeof demandPlannerStorage.getById>,
  post: ShiftPost | undefined,
): { date: string; payPerDay: number } | null {
  const fromPost = isoFromPost(post);
  if (fromPost) {
    return { date: fromPost, payPerDay: post?.payPerDay ?? 0 };
  }

  const slot =
    plan?.slots.find((s) => s.slotId === app.postId || s.postId === app.postId) ??
    plan?.slots.find((s) => app.selectedDates?.includes(s.date));
  if (slot) {
    return { date: slot.date, payPerDay: slot.payPerDay };
  }

  const selected = app.selectedDates?.find((d) => Boolean(d));
  if (selected) {
    return { date: selected, payPerDay: 0 };
  }

  return null;
}

export function listPlannerRosterAssignments(options?: {
  planId?: string;
  workerMlId?: string;
  confirmedOnly?: boolean;
}): PlannerRosterAssignment[] {
  const confirmedOnly = options?.confirmedOnly !== false;
  const plans = demandPlannerStorage.getAll();
  const planFilter = options?.planId?.trim();
  const workerFilter = options?.workerMlId?.trim().toUpperCase();

  const posts = getEmployerShiftPosts();
  const postMap = new Map(posts.map((p) => [p.id, p]));
  const workspaces = readEmployeeWorkspaces();
  const apps = readEmployeeApplications().filter((app) => {
    if (!app.planId) return false;
    if (planFilter && app.planId !== planFilter) return false;
    if (confirmedOnly && app.status !== "confirmed") return false;
    const worker = app.profileSnapshot?.uniqueId?.trim().toUpperCase() ?? "";
    if (workerFilter && worker !== workerFilter) return false;
    return true;
  });

  const byKey = new Map<string, EmployeeShiftApplication[]>();
  for (const app of apps) {
    const worker = app.profileSnapshot?.uniqueId?.trim() || "unknown";
    const key = `${app.planId}::${worker}`;
    const list = byKey.get(key) ?? [];
    list.push(app);
    byKey.set(key, list);
  }

  const assignments: PlannerRosterAssignment[] = [];

  for (const [key, group] of byKey) {
    const [planId] = key.split("::");
    if (!planId) continue;
    const plan = plans.find((p) => p.id === planId);
    const workerMlId = group[0]?.profileSnapshot?.uniqueId?.trim() || "unknown";
    const workerName = group[0]?.profileSnapshot?.fullName?.trim() || "Worker";
    const days: PlannerRosterDay[] = [];

    for (const app of group) {
      const post = postMap.get(app.postId);
      const resolved = resolveAppDay(app, plan ?? null, post);
      if (!resolved) continue;
      const ws = workspaces.find((w) => w.postId === app.postId && w.appId === app.id);
      days.push({
        date: resolved.date,
        postId: app.postId,
        appId: app.id,
        workspaceId: ws?.id ?? null,
        status: app.status,
        payPerDay: resolved.payPerDay,
      });
    }

    days.sort((a, b) => a.date.localeCompare(b.date));
    if (days.length === 0) continue;

    assignments.push({
      planId,
      planName: plan?.name ?? postMap.get(group[0]!.postId)?.jobName ?? "Project Plan",
      companyName: plan?.companyName ?? postMap.get(group[0]!.postId)?.companyName ?? "Employer",
      workerMlId,
      workerName,
      employerMlId: plan?.legalEntityMlId?.trim() || "",
      siteManagerId: plan?.siteManagerId,
      siteId: plan?.siteId,
      joinedAt: Math.min(...group.map((a) => a.createdAt)),
      epochDays: plan?.epochDays && plan.epochDays > 0 ? plan.epochDays : 30,
      days,
    });
  }

  return assignments.sort((a, b) => b.joinedAt - a.joinedAt);
}

export function listActivePlannerPlansForRoster(): Array<{
  planId: string;
  planName: string;
  companyName: string;
  workerCount: number;
  confirmedDayCount: number;
  status: string;
}> {
  const plans = demandPlannerStorage.getAll().filter((p) => p.status === "active");
  const assignments = listPlannerRosterAssignments({ confirmedOnly: true });

  return plans.map((plan) => {
    const forPlan = assignments.filter((a) => a.planId === plan.id);
    return {
      planId: plan.id,
      planName: plan.name,
      companyName: plan.companyName,
      workerCount: forPlan.length,
      confirmedDayCount: forPlan.reduce((n, a) => n + a.days.length, 0),
      status: plan.status,
    };
  });
}
