/** Job Mitra | shiftPlannerExecutionAdapter.ts | Shift-backed PlannerExecutionPort */

import {
  findWorkspaceIdForPostAndWorker,
  getEmployerShiftPosts,
} from "../../../shift/shiftEmployerPublic";
import { shiftApplicationsStorage } from "../../../../employee/shiftJobs/storage/shiftApplications.storage";
import { shiftWorkspacesStorage } from "../../../../employee/shiftJobs/storage/shiftWorkspaces.storage";
import {
  findPlannerCheckIn,
  readPlannerCheckIns,
  upsertPlannerCheckIn,
} from "../plannerCheckIn.ledger";
import type {
  PlannerCheckInInput,
  PlannerCheckInResult,
  PlannerExecutionDayStatus,
  PlannerExecutionPort,
} from "../plannerExecutionPort.types";
import type { ShiftApplicationData } from "../../../../employee/shiftJobs/types/shiftApplicationTypes";
import type { ShiftPost } from "../../../shift/shiftEmployerPublic";
import type { ShiftWorkspace } from "../../../../employee/shiftJobs/types/shiftWorkspace.types";

function resolveApplication(input: {
  planId: string;
  slotDate: string;
  postId?: string;
  applicationId?: string;
}) {
  const apps: ShiftApplicationData[] = shiftApplicationsStorage.getApps();
  if (input.applicationId) {
    return apps.find((a: ShiftApplicationData) => a.id === input.applicationId) ?? null;
  }

  const posts: ShiftPost[] = getEmployerShiftPosts();
  const matchingPostIds = new Set(
    posts
      .filter(
        (p: ShiftPost) =>
          p.planId === input.planId &&
          (input.postId ? p.id === input.postId : p.planSlotDate === input.slotDate),
      )
      .map((p: ShiftPost) => p.id),
  );

  return (
    apps.find(
      (a: ShiftApplicationData) =>
        a.planId === input.planId &&
        (input.postId ? a.postId === input.postId : matchingPostIds.has(a.postId)),
    ) ?? null
  );
}

function buildStatus(args: {
  planId: string;
  slotDate: string;
  workerMlId: string;
  postId?: string;
}): PlannerExecutionDayStatus {
  const app = resolveApplication({
    planId: args.planId,
    slotDate: args.slotDate,
    postId: args.postId,
  });
  const postId = args.postId ?? app?.postId ?? null;
  const workspaceId =
    postId != null ? (findWorkspaceIdForPostAndWorker(postId, args.workerMlId) ?? null) : null;
  const workspace = workspaceId
    ? (shiftWorkspacesStorage.getAll().find((w: ShiftWorkspace) => w.id === workspaceId) ?? null)
    : null;
  const ledger = findPlannerCheckIn(args.planId, args.slotDate, args.workerMlId);

  return {
    planId: args.planId,
    slotDate: args.slotDate,
    postId,
    applicationId: app?.id ?? null,
    workspaceId,
    attendanceConfirmed: Boolean(app?.attendanceConfirmedAt) || Boolean(ledger),
    checkedInAt: ledger?.checkedInAt ?? app?.attendanceConfirmedAt ?? null,
    workspaceStatus: workspace?.status ?? null,
  };
}

export function createShiftPlannerExecutionAdapter(): PlannerExecutionPort {
  return {
    recordDailyCheckIn(input: PlannerCheckInInput): PlannerCheckInResult {
      const planId = input.planId.trim();
      const slotDate = input.slotDate.trim();
      const workerMlId = input.workerMlId.trim();
      if (!planId || !slotDate || !workerMlId) {
        return { ok: false, reason: "missing_ids" };
      }

      if (findPlannerCheckIn(planId, slotDate, workerMlId)) {
        return { ok: false, reason: "already_checked_in" };
      }

      const app = resolveApplication({
        planId,
        slotDate,
        postId: input.postId,
        applicationId: input.applicationId,
      });

      let via: "shift_attendance" | "planner_ledger" = "planner_ledger";
      const applicationId = app?.id ?? input.applicationId ?? null;
      const workspaceId =
        input.workspaceId ??
        (app?.postId ? (findWorkspaceIdForPostAndWorker(app.postId, workerMlId) ?? null) : null);

      if (app?.id && app.status === "confirmed") {
        if (app.attendanceConfirmedAt === undefined) {
          const result = shiftApplicationsStorage.confirmAttendance(app.id);
          if (result.ok || result.reason === "already_confirmed") {
            via = "shift_attendance";
          } else if (result.reason === "storage_error") {
            return { ok: false, reason: "storage_error" };
          }
        } else {
          via = "shift_attendance";
        }
      }

      const checkedInAt = Date.now();
      const saved = upsertPlannerCheckIn({
        planId,
        slotDate,
        workerMlId,
        checkedInAt,
        applicationId: applicationId ?? undefined,
        workspaceId: workspaceId ?? undefined,
        postId: input.postId ?? app?.postId,
      });
      if (!saved.ok) return { ok: false, reason: "storage_error" };

      return {
        ok: true,
        checkedInAt,
        workspaceId,
        applicationId,
        via,
      };
    },

    getDayExecutionStatus(input) {
      return buildStatus(input);
    },

    listPlanDayStatuses(planId, workerMlId) {
      const dates = new Set<string>();
      for (const post of getEmployerShiftPosts()) {
        if (post.planId === planId && post.planSlotDate) dates.add(post.planSlotDate);
      }
      for (const rec of readPlannerCheckIns()) {
        if (rec.planId === planId && rec.workerMlId === workerMlId) {
          dates.add(rec.slotDate);
        }
      }

      const out: PlannerExecutionDayStatus[] = [];
      for (const slotDate of [...dates].sort()) {
        out.push(buildStatus({ planId, slotDate, workerMlId }));
      }
      return out;
    },
  };
}
