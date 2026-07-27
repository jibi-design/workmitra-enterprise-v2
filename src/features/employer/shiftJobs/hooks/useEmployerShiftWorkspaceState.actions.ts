// App name: Job Mitra
// useEmployerShiftWorkspaceState.actions.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { reviewCenterStorage } from "../../../shared/reviewCenter/storage/reviewCenter.storage";
import { syncVaultShiftRatings } from "../../../shared/workVault/vaultPublic";
import { markShiftWorkspaceCompleted } from "../storage/employerShift.postCompleteActions";
import {
  getWorkspacesSnapshot,
  pushEmployeeShiftNotification,
  saveWorkspaces,
} from "../storage/shiftWorkspaceStorage";
import { clampText, isReadOnlyStatus, wsId } from "../types/shiftWorkspaceTypes";
import type { ShiftWorkspaceUpdate } from "../types/shiftWorkspaceTypes";
import type { WorkspaceDraft } from "./useEmployerShiftWorkspaceState.types";

export type ShiftWorkspaceActionContext = {
  all: ReturnType<typeof getWorkspacesSnapshot>;
  workspace: ReturnType<typeof getWorkspacesSnapshot>[number] | null;
  employerMlId: string;
  workerMlId: string;
  workerName: string;
  readOnly: boolean;
  broadcastDraft: WorkspaceDraft;
  replyDraft: WorkspaceDraft;
  setBroadcastOpen: (open: boolean) => void;
  setReplyOpen: (open: boolean) => void;
  setRatingOpen: (open: boolean) => void;
  setActionError: (error: string | null) => void;
  openConfirm: (data: ConfirmData, fn: () => void) => void;
};

export function createEmployerShiftWorkspaceActions(ctx: ShiftWorkspaceActionContext) {
  const {
    all,
    workspace,
    employerMlId,
    workerMlId,
    workerName,
    readOnly,
    broadcastDraft,
    replyDraft,
    setBroadcastOpen,
    setReplyOpen,
    setRatingOpen,
    setActionError,
    openConfirm,
  } = ctx;

  function clearActionError() {
    setActionError(null);
  }

  function persistWorkspaces(next: ReturnType<typeof getWorkspacesSnapshot>): boolean {
    try {
      saveWorkspaces(next);
      return true;
    } catch {
      setActionError("Could not save workspace changes. Please try again.");
      return false;
    }
  }

  function notifyWorkspaceUpdate(title: string, body: string, route: string): void {
    const notified = pushEmployeeShiftNotification(title, body, route);
    if (!notified) {
      setActionError("Workspace updated, but the employee notification could not be sent.");
    }
  }

  function openPost(nav: (path: string) => void) {
    if (!workspace) return;
    nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", workspace.postId));
  }

  function openBroadcastModal() {
    setBroadcastOpen(true);
  }

  function openReplyModal() {
    setReplyOpen(true);
  }

  function pushBroadcast() {
    if (!workspace || readOnly) return;
    clearActionError();

    const title = clampText(broadcastDraft.title, 60) || "Announcement";
    const body = clampText(broadcastDraft.body, 240);
    const now = Date.now();

    const updateBase: ShiftWorkspaceUpdate = {
      id: wsId("u"),
      createdAt: now,
      kind: "broadcast",
      title,
    };

    const update: ShiftWorkspaceUpdate = body ? { ...updateBase, body } : updateBase;

    const next = all.map((item) =>
      item.id !== workspace.id
        ? item
        : {
            ...item,
            updates: [update, ...item.updates].slice(0, 50),
            lastActivityAt: now,
            unreadCount: Math.max(0, item.unreadCount) + 1,
          },
    );

    if (!persistWorkspaces(next)) return;

    notifyWorkspaceUpdate(
      "New announcement",
      `${workspace.jobName} - ${workspace.companyName}. ${title}${body ? `: ${body.slice(0, 60)}` : ""}`,
      ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspace.id),
    );

    setBroadcastOpen(false);
  }

  function sendDirectReply() {
    if (!workspace || readOnly) return;
    clearActionError();

    const title = clampText(replyDraft.title, 60) || "Reply (Employer)";
    const body = clampText(replyDraft.body, 240);

    if (!body) return;

    const now = Date.now();

    const update: ShiftWorkspaceUpdate = {
      id: wsId("u"),
      createdAt: now,
      kind: "direct",
      title,
      body,
    };

    const next = all.map((item) =>
      item.id !== workspace.id
        ? item
        : {
            ...item,
            updates: [update, ...item.updates].slice(0, 50),
            lastActivityAt: now,
            unreadCount: Math.max(0, item.unreadCount) + 1,
          },
    );

    if (!persistWorkspaces(next)) return;

    notifyWorkspaceUpdate(
      "New message",
      `${workspace.jobName} - ${workspace.companyName}. Employer replied in workspace.`,
      ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspace.id),
    );

    setReplyOpen(false);
  }

  function markCompleted() {
    if (!workspace || readOnly) return;
    if (
      workspace.status === "completed" ||
      workspace.status === "left" ||
      workspace.status === "replaced" ||
      workspace.status === "cancelled"
    ) {
      return;
    }

    openConfirm(
      {
        title: "Mark shift completed?",
        message:
          "This will close the workspace as completed and keep the activity record. Check the work status before confirming.",
        tone: "warn",
        confirmLabel: "Mark Completed",
        cancelLabel: "Cancel",
      },
      () => completeWorkspace(),
    );
  }

  function completeWorkspace() {
    if (!workspace || readOnly) return;
    if (
      workspace.status === "completed" ||
      workspace.status === "left" ||
      workspace.status === "replaced" ||
      workspace.status === "cancelled"
    ) {
      return;
    }
    clearActionError();

    const result = markShiftWorkspaceCompleted(workspace.id);

    if (!result.ok) {
      if (result.reason === "workspace_write_error") {
        setActionError("Could not save workspace changes. Please try again.");
      } else if (result.reason === "terminal_status" || result.reason === "already_completed") {
        setActionError("This workspace can no longer be marked completed.");
      }
      return;
    }

    if (result.postCompleted) {
      notifyWorkspaceUpdate(
        "Shift post completed",
        `${workspace.jobName} - ${workspace.companyName}. All worker workspaces are complete.`,
        ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", workspace.postId),
      );
    }
  }

  function handleRatingSubmitted() {
    if (!workspace || !workerMlId) {
      setRatingOpen(false);
      return;
    }
    clearActionError();

    const savedRating = ratingStorage.getEmployerRatingForJob(
      employerMlId,
      workspace.postId,
      workerMlId,
    );

    if (!savedRating) {
      setRatingOpen(false);
      return;
    }

    const next = all.map((item) =>
      item.id !== workspace.id
        ? item
        : {
            ...item,
            employerRating: savedRating.stars,
            employerRatingComment: savedRating.comment ?? "",
            employerRatedAt: savedRating.createdAt,
          },
    );

    if (!persistWorkspaces(next)) return;

    const ratedWorkspace = next.find((item) => item.id === workspace.id);
    if (ratedWorkspace) {
      syncVaultShiftRatings(ratedWorkspace);
    }

    reviewCenterStorage.resolveBySource({
      domain: "shift",
      sourceId: workspace.id,
      toRole: "employer",
      action: "employee_request_employer_rating",
    });

    notifyWorkspaceUpdate(
      "Worker review submitted",
      `${workspace.jobName} - ${workspace.companyName}. Employer rated ${workerName}.`,
      ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspace.id),
    );

    setRatingOpen(false);
  }

  return {
    clearActionError,
    openPost,
    openBroadcastModal,
    openReplyModal,
    pushBroadcast,
    sendDirectReply,
    markCompleted,
    handleRatingSubmitted,
  };
}

export { isReadOnlyStatus };
