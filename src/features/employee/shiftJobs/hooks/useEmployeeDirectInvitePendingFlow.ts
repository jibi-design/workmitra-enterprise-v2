// App name: Job Mitra
// Employee direct-invite pending flow — hub rows, safety modals, accept/decline.

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";
import {
  acceptShiftDirectInvite,
  declineShiftDirectInvite,
} from "../../../employer/shiftJobs/services/shiftDirectInvite.service";
import { shiftDirectInviteStorage } from "../../../employer/shiftJobs/storage/shiftDirectInvite.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import {
  getEmployeePendingDirectInvitesSnapshot,
  EMPTY_PENDING_DIRECT_INVITES,
  type EmployeePendingDirectInvite,
} from "../helpers/shiftDirectInvite.helpers";
import type { ShiftDirectInviteModalState } from "../components/ShiftDirectInviteSafetyModals";

export function useEmployeeDirectInvitePendingFlow() {
  const nav = useNavigate();
  const [modal, setModal] = useState<ShiftDirectInviteModalState | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [toast, setToast] = useState("");

  const pendingInvites = useSyncExternalStore(
    shiftDirectInviteStorage.subscribe,
    getEmployeePendingDirectInvitesSnapshot,
    () => EMPTY_PENDING_DIRECT_INVITES,
  );

  const openAcceptModal = useCallback((invite: EmployeePendingDirectInvite) => {
    setModal({ kind: "accept", invite });
  }, []);

  const openDeclineModal = useCallback((invite: EmployeePendingDirectInvite) => {
    setModal({ kind: "decline", invite });
  }, []);

  const closeModal = useCallback(() => {
    if (isBusy) return;
    setModal(null);
  }, [isBusy]);

  const hubItems: PendingActionItem[] = useMemo(
    () =>
      pendingInvites.map((invite) => ({
        id: `direct-invite-${invite.id}`,
        domain: "shift",
        label: "Direct Shift Invite!",
        detail: `${invite.companyName} has invited you for a shift on ${invite.shiftDateLabel}.`,
        count: 1,
        ctaLabel: "Accept",
        onAction: () => openAcceptModal(invite),
        dualActions: {
          declineLabel: "Decline",
          acceptLabel: "Accept",
          onDecline: () => openDeclineModal(invite),
          onAccept: () => openAcceptModal(invite),
        },
      })),
    [openAcceptModal, openDeclineModal, pendingInvites],
  );

  const confirmModalAction = useCallback(() => {
    if (!modal) return;

    const profile = employeeProfileStorage.get();
    const activeWorkerWmId = profile.uniqueId?.trim().toUpperCase() ?? "";
    if (!activeWorkerWmId) return;

    if (modal.kind === "decline") {
      setIsBusy(true);
      const ok = declineShiftDirectInvite(modal.invite.id, activeWorkerWmId);
      setIsBusy(false);
      setModal(null);

      if (!ok) {
        setToast("Unable to decline this invite. It may have expired.");
        return;
      }

      setToast("Invite declined.");
      return;
    }

    setIsBusy(true);

    const result = acceptShiftDirectInvite({
      inviteId: modal.invite.id,
      workerWmId: activeWorkerWmId,
      workerName: profile.fullName.trim() || modal.invite.workerName,
      city: profile.city.trim() || undefined,
      experience: profile.experience || undefined,
      skills: profile.skills.length > 0 ? [...profile.skills] : undefined,
      languages: profile.languages.length > 0 ? [...profile.languages] : undefined,
    });

    setIsBusy(false);
    setModal(null);

    if (!result.ok) {
      setToast(result.reason);
      return;
    }

    setToast("Direct invite accepted. You are confirmed for this shift.");

    if (result.workspaceId) {
      setTimeout(
        () => nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", result.workspaceId!)),
        600,
      );
      return;
    }

    setTimeout(() => nav(ROUTE_PATHS.employeeShiftApplications), 600);
  }, [modal, nav]);

  const pendingCount = pendingInvites.length;

  const getPendingInviteForPost = useCallback(
    (postId: string) => pendingInvites.find((invite) => invite.postId === postId) ?? null,
    [pendingInvites],
  );

  return {
    hubItems,
    pendingCount,
    pendingInvites,
    getPendingInviteForPost,
    modal,
    isBusy,
    toast,
    clearToast: () => setToast(""),
    openAcceptModal,
    openDeclineModal,
    closeModal,
    confirmModalAction,
  };
}
