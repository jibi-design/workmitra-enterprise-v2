// App name: Job Mitra
// File name: useEmployerShiftDashboardCandidateActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\dashboard\useEmployerShiftDashboardCandidateActions.ts

import type { Dispatch, SetStateAction } from "react";
import type { NavigateFunction } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import type { DashboardTab } from "../../helpers/shiftDashboardHelpers";
import { employerShiftStorage } from "../../storage/employerShift.storage";
import type { EmployeeShiftApplication, ShiftPost } from "../../storage/employerShift.storage";
import {
  confirmSyncFailureCopy,
  isShiftNetworkFailure,
} from "../../../../../shared/shift/shiftNetworkUi";

type UseEmployerShiftDashboardCandidateActionsInput = {
  readonly postId: string;
  readonly post: ShiftPost | null;
  readonly selectedApps: readonly EmployeeShiftApplication[];
  readonly isBusy: boolean;
  readonly busy: (fn: () => void | Promise<void>) => void;
  readonly openConfirm: (data: ConfirmData, fn: () => void | Promise<void>) => void;
  readonly setNotice: Dispatch<SetStateAction<NoticeData | null>>;
  readonly setTab: Dispatch<SetStateAction<DashboardTab>>;
  readonly navigate: NavigateFunction;
  readonly onOpenGroup: () => void;
  readonly onRequestReplaceCandidate: (applicationId: string) => void;
};

export function useEmployerShiftDashboardCandidateActions({
  postId,
  post,
  selectedApps,
  isBusy,
  busy,
  openConfirm,
  setNotice,
  setTab,
  navigate,
  onOpenGroup,
  onRequestReplaceCandidate,
}: UseEmployerShiftDashboardCandidateActionsInput) {
  return {
    isBusy,
    onMoveToShortlist: (id: string) =>
      busy(() => {
        employerShiftStorage.moveToShortlist(postId, id);
        setTab("shortlisted");
      }),
    onMoveToWaiting: (id: string) =>
      busy(() => {
        employerShiftStorage.moveToWaiting(postId, id);
        setTab("backup");
      }),
    onConfirm: (id: string) =>
      busy(async () => {
        if (!post) {
          return;
        }

        const vacancyLimit = Math.max(0, Math.floor(post.vacancies));

        if (vacancyLimit <= 0 || selectedApps.length >= vacancyLimit) {
          setNotice({
            title: "Vacancy full",
            message:
              "All confirmed slots are already filled. Replace a confirmed worker first, then confirm a backup candidate manually.",
            tone: "warn",
          });
          setTab("selected");
          return;
        }

        const result = await employerShiftStorage.confirmWithResult(postId, id);

        if (!result.ok) {
          const message =
            result.reason === "vacancy_full"
              ? "All confirmed slots are already filled. Replace a confirmed worker first, then confirm a backup candidate manually."
              : result.reason === "already_confirmed"
                ? "This candidate is already confirmed for the shift."
                : result.reason === "membership_failed"
                  ? "Unable to provision Shift Ops group membership. Confirm was not completed."
                  : result.reason === "site_ensure_failed"
                    ? isShiftNetworkFailure()
                      ? confirmSyncFailureCopy()
                      : "Could not create the Shift Ops group for this shift. Confirm was not completed — try again."
                    : result.reason === "missing_site_or_worker"
                      ? "This candidate is missing a Mitra Lab ID. Open the worker profile so an ID can be created, then try Confirm again."
                    : result.reason === "api_sync_failed" || result.reason === "api_ids_unavailable"
                      ? confirmSyncFailureCopy()
                      : result.reason === "confirm_locked"
                        ? "Another tab is confirming a candidate for this shift. Try again in a moment."
                        : "Unable to confirm this candidate right now.";

          setNotice({
            title: result.reason === "vacancy_full" ? "Vacancy full" : "Confirm failed",
            message,
            tone: "warn",
          });
          setTab("selected");
          return;
        }

        setNotice({
          title: "Candidate confirmed",
          message: "The worker was confirmed and the employee confirmation step has been started.",
          tone: "success",
        });

        setTab("selected");

        navigate(ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", result.workspaceId));
      }),
    onOpenGroup,
    onRemove: (id: string) =>
      openConfirm(
        {
          title: "Reject candidate?",
          message: "This candidate will be moved to Rejected.",
          tone: "danger",
          confirmLabel: "Reject",
        },
        () => busy(() => employerShiftStorage.removeFromPicks(postId, id, "Rejected by employer")),
      ),
    onReplace: (id: string) => onRequestReplaceCandidate(id),
  };
}
