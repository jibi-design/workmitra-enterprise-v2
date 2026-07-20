// App name: Job Mitra
// File name: useEmployerShiftWorkspaceState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\useEmployerShiftWorkspaceState.ts

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { readEmployeeApplications } from "../storage/employerShift.employeeBridge";
import { reviewCenterStorage } from "../../../shared/reviewCenter/storage/reviewCenter.storage";
import { syncVaultShiftRatings } from "../../../employee/workVault/services/shiftVaultHistory.service";
import { markShiftWorkspaceCompleted } from "../storage/employerShift.postCompleteActions";
import {
  getWorkspacesSnapshot,
  pushEmployeeShiftNotification,
  saveWorkspaces,
  subscribeWorkspaces,
} from "../storage/shiftWorkspaceStorage";
import { clampText, isReadOnlyStatus, wsId } from "../types/shiftWorkspaceTypes";
import type { ShiftWorkspaceUpdate } from "../types/shiftWorkspaceTypes";

export type WorkspaceDraft = {
  title: string;
  body: string;
};

function hasWorkspaceEmployerRating(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function useEmployerShiftWorkspaceState() {
  const nav = useNavigate();
  const params = useParams();
  const workspaceId = params.workspaceId ?? "";

  const all = useSyncExternalStore(
    subscribeWorkspaces,
    getWorkspacesSnapshot,
    getWorkspacesSnapshot,
  );

  const workspace = useMemo(
    () => all.find((item) => item.id === workspaceId) ?? null,
    [all, workspaceId],
  );

  const employerWmId = useMemo(() => {
    const profile = employerSettingsStorage.get();
    return profile.uniqueId?.trim() || "employer_local_demo";
  }, []);

  const workerWmId = useMemo(() => {
    const direct = workspace?.workerWmId?.trim();
    if (direct) return direct;

    const appId = workspace?.appId?.trim();
    if (!appId) return "";

    const application = readEmployeeApplications().find((app) => app.id === appId);
    return application?.profileSnapshot?.uniqueId?.trim() ?? "";
  }, [workspace]);
  const workerName = workspace?.workerName?.trim() || "Worker";

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastDraft, setBroadcastDraft] = useState<WorkspaceDraft>({
    title: "Announcement",
    body: "",
  });
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState<WorkspaceDraft>({
    title: "Reply (Employer)",
    body: "",
  });
  const [ratingOpen, setRatingOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [confirmFn, setConfirmFn] = useState<(() => void) | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const readOnly = workspace ? isReadOnlyStatus(workspace.status) : true;
  const isCompleted = workspace?.status === "completed";

  const hasRating = workspace
    ? hasWorkspaceEmployerRating(workspace.employerRating) ||
      (workerWmId
        ? ratingStorage.hasEmployerRatedWorker(employerWmId, workspace.postId, workerWmId)
        : false)
    : false;

  function openConfirm(data: ConfirmData, fn: () => void) {
    setConfirmData(data);
    setConfirmFn(() => fn);
  }

  function closeConfirm() {
    setConfirmData(null);
    setConfirmFn(null);
  }

  function handleConfirmModalConfirm() {
    confirmFn?.();
    closeConfirm();
  }

  function openPost() {
    if (!workspace) return;

    nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", workspace.postId));
  }

  function openBroadcastModal() {
    setBroadcastDraft({ title: "Announcement", body: "" });
    setBroadcastOpen(true);
  }

  function openReplyModal() {
    setReplyDraft({ title: "Reply (Employer)", body: "" });
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
    if (!workspace || readOnly || workspace.status === "completed") return;

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
    if (!workspace || readOnly || workspace.status === "completed") return;
    clearActionError();

    const result = markShiftWorkspaceCompleted(workspace.id);

    if (!result.ok) {
      if (result.reason === "workspace_write_error") {
        setActionError("Could not save workspace changes. Please try again.");
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
    if (!workspace || !workerWmId) {
      setRatingOpen(false);
      return;
    }
    clearActionError();

    const savedRating = ratingStorage.getEmployerRatingForJob(
      employerWmId,
      workspace.postId,
      workerWmId,
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
    workspace,
    readOnly,
    isCompleted,
    hasRating,
    employerWmId,
    workerWmId,
    workerName,
    actionError,
    clearActionError,
    confirmData,
    closeConfirm,
    handleConfirmModalConfirm,
    broadcastOpen,
    setBroadcastOpen,
    broadcastDraft,
    setBroadcastDraft,
    replyOpen,
    setReplyOpen,
    replyDraft,
    setReplyDraft,
    ratingOpen,
    setRatingOpen,
    openPost,
    openBroadcastModal,
    openReplyModal,
    pushBroadcast,
    sendDirectReply,
    markCompleted,
    handleRatingSubmitted,
  };
}
