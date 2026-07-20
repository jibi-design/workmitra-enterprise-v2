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

type UseEmployerShiftDashboardCandidateActionsInput = {
  readonly postId: string;
  readonly post: ShiftPost | null;
  readonly selectedApps: readonly EmployeeShiftApplication[];
  readonly isBusy: boolean;
  readonly busy: (fn: () => void) => void;
  readonly openConfirm: (data: ConfirmData, fn: () => void) => void;
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
      }),
    onMoveToWaiting: (id: string) =>
      busy(() => {
        employerShiftStorage.moveToWaiting(postId, id);
      }),
    onConfirm: (id: string) =>
      busy(() => {
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

        const workspaceId = employerShiftStorage.confirm(postId, id);

        setNotice({
          title: "Candidate confirmed",
          message: "The worker was confirmed and the employee confirmation step has been started.",
          tone: "success",
        });

        setTab("selected");

        if (workspaceId) {
          navigate(ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", workspaceId));
        }
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
