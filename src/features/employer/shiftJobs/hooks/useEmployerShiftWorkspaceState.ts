// App name: Job Mitra
// File name: useEmployerShiftWorkspaceState.ts

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentActorId, identityBridge } from "../../../../app/identity/identity.adapter";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { readEmployeeApplications } from "../storage/employerShift.employeeBridge";
import { getWorkspacesSnapshot, subscribeWorkspaces } from "../storage/shiftWorkspaceStorage";
import {
  createEmployerShiftWorkspaceActions,
  isReadOnlyStatus,
} from "./useEmployerShiftWorkspaceState.actions";
import {
  hasWorkspaceEmployerRating,
  type WorkspaceDraft,
} from "./useEmployerShiftWorkspaceState.types";
import { useShiftWorkspaceMessageSync } from "../../../shift/services/workspaceMessageSync.service";

export type { WorkspaceDraft };

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

  useShiftWorkspaceMessageSync("employer");

  const employerMlId = useMemo(() => {
    const profile = employerSettingsStorage.get();
    const legacyId = profile.uniqueId?.trim() || "employer_local_demo";
    const actor = getCurrentActorId("employer");
    const realLegacy = profile.uniqueId?.trim();
    if (actor.source === "auth" && actor.authUserId && realLegacy) {
      identityBridge.upsert("employer", realLegacy, actor.authUserId);
    }
    return legacyId;
  }, []);

  const workerMlId = useMemo(() => {
    const direct = workspace?.workerMlId?.trim();
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

  const readOnly = workspace ? isReadOnlyStatus(workspace.status) : true;
  const isCompleted = workspace?.status === "completed";

  const hasRating = workspace
    ? hasWorkspaceEmployerRating(workspace.employerRating) ||
      (workerMlId
        ? ratingStorage.hasEmployerRatedWorker(employerMlId, workspace.postId, workerMlId)
        : false)
    : false;

  const actions = createEmployerShiftWorkspaceActions({
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
  });

  return {
    workspace,
    readOnly,
    isCompleted,
    hasRating,
    employerMlId,
    workerMlId,
    workerName,
    actionError,
    clearActionError: actions.clearActionError,
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
    openPost: () => actions.openPost(nav),
    openBroadcastModal: () => {
      setBroadcastDraft({ title: "Announcement", body: "" });
      actions.openBroadcastModal();
    },
    openReplyModal: () => {
      setReplyDraft({ title: "Reply (Employer)", body: "" });
      actions.openReplyModal();
    },
    pushBroadcast: actions.pushBroadcast,
    sendDirectReply: actions.sendDirectReply,
    markCompleted: actions.markCompleted,
    handleRatingSubmitted: actions.handleRatingSubmitted,
  };
}
