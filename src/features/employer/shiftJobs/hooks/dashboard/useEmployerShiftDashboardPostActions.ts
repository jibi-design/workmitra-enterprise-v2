// App name: Job Mitra
// File name: useEmployerShiftDashboardPostActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\dashboard\useEmployerShiftDashboardPostActions.ts

import type { Dispatch, SetStateAction } from "react";
import type { NavigateFunction } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import { findWorkspaceIdForPost } from "../../helpers/dashboardHelpers";
import type { DashboardTab } from "../../helpers/shiftDashboardHelpers";
import {
  getRatingDoneFlag,
  setRatingDoneFlag,
} from "../../helpers/employerShiftDashboardRatingFlags";
import { employerShiftStorage } from "../../storage/employerShift.storage";
import type {
  EmployeeShiftApplication,
  PostSettings,
  ShiftPost,
} from "../../storage/employerShift.storage";

type UseEmployerShiftDashboardPostActionsInput = {
  readonly postId: string;
  readonly post: ShiftPost | null;
  readonly workspaceId?: string;
  readonly settings: PostSettings;
  readonly canAnalyze: boolean;
  readonly hasApplications: boolean;
  readonly selectedApps: readonly EmployeeShiftApplication[];
  readonly navigate: NavigateFunction;
  readonly busy: (fn: () => void) => void;
  readonly openConfirm: (data: ConfirmData, fn: () => void) => void;
  readonly setNotice: Dispatch<SetStateAction<NoticeData | null>>;
  readonly setTab: Dispatch<SetStateAction<DashboardTab>>;
  readonly setShowEdit: Dispatch<SetStateAction<boolean>>;
  readonly setRatingCompleted: Dispatch<SetStateAction<boolean>>;
};

export function useEmployerShiftDashboardPostActions({
  postId,
  post,
  workspaceId,
  settings,
  canAnalyze,
  hasApplications,
  selectedApps,
  navigate,
  busy,
  openConfirm,
  setNotice,
  setTab,
  setShowEdit,
  setRatingCompleted,
}: UseEmployerShiftDashboardPostActionsInput) {
  function handleAnalyze() {
    if (!canAnalyze) return;

    busy(() => {
      employerShiftStorage.analyzeOnce(postId, { hideFromSearch: false });
      setTab("applied");
    });
  }

  function handleReset() {
    openConfirm(
      {
        title: "Reset Analysis?",
        message:
          "This will clear shortlist and backup. Candidates return to Applied. Cannot be undone.",
        tone: "danger",
        confirmLabel: "Reset",
      },
      () =>
        busy(() => {
          employerShiftStorage.resetAnalysis(postId, "Manual reset by employer", {
            unhideFromSearch: true,
          });
          setTab("applied");
        }),
    );
  }

  function handleOpenGroup() {
    const activeWorkspaceId = findWorkspaceIdForPost(postId) ?? workspaceId;

    if (activeWorkspaceId) {
      navigate(ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", activeWorkspaceId));
      return;
    }

    setNotice({
      title: "No workspace",
      message: "Confirm a worker first to create a workspace.",
    });
  }

  function handleDelete() {
    if (!post) return;

    if (hasApplications) {
      setNotice({
        title: "Delete Restricted",
        message:
          "This shift already has applications. Use Close Post to keep a local activity record.",
        tone: "warn",
      });
      return;
    }

    openConfirm(
      {
        title: "Delete this shift?",
        message: "This shift has no applications. Deleting will remove the unused post.",
        tone: "danger",
        confirmLabel: "Delete Shift",
        cancelLabel: "Cancel",
      },
      () => {
        const deleted = employerShiftStorage.deletePost(postId);

        if (!deleted) {
          setNotice({
            title: "Delete Restricted",
            message: "This shift can no longer be deleted because applications exist.",
            tone: "warn",
          });
          return;
        }

        navigate(ROUTE_PATHS.employerShiftPosts);
      },
    );
  }

  function handleClosePost() {
    if (!post) return;

    openConfirm(
      {
        title: "Close this shift?",
        message:
          "This shift already has applications. Closing will keep a local activity record. Applicants may see the updated status inside the app.",
        tone: "warn",
        confirmLabel: "Close Post",
        cancelLabel: "Keep Open",
      },
      () => {
        const closed = employerShiftStorage.closePost(
          postId,
          "Closed by employer after applications were received.",
        );

        if (!closed) {
          setNotice({
            title: "Close Failed",
            message: "Unable to close this shift. Please try again.",
            tone: "warn",
          });
          return;
        }

        setNotice({
          title: "Shift Closed",
          message:
            "This shift is now closed and hidden from search. Existing records were kept locally.",
          tone: "success",
        });
      },
    );
  }

  function handleShiftClosed() {
    setRatingDoneFlag(postId);
    setRatingCompleted(true);
    setNotice({
      title: "Shift Completed!",
      message: "All workers have been rated. This shift is now closed.",
      tone: "success",
    });
    setTab("selected");
  }

  function handleSaveEdit(updates: Parameters<typeof employerShiftStorage.editPost>[1]) {
    if (hasApplications) {
      setShowEdit(false);
      setNotice({
        title: "Edit Restricted",
        message:
          "This shift already has applications. Key post details are locked to protect applicants.",
        tone: "warn",
      });
      return;
    }

    employerShiftStorage.editPost(postId, updates);
    setShowEdit(false);
    setNotice({
      title: "Shift Updated",
      message: "Changes saved successfully.",
      tone: "success",
    });
  }

  function handleToggleSetting(key: keyof PostSettings, value: boolean | number) {
    employerShiftStorage.updateSettings(postId, { ...settings, [key]: value });
  }

  function goToAllPosts() {
    navigate(ROUTE_PATHS.employerShiftPosts);
  }

  return {
    ratingCompletedInitial: getRatingDoneFlag(postId),
    showRatingBlock:
      post?.status === "completed" && selectedApps.length > 0 && !getRatingDoneFlag(postId),
    showRatingSection: selectedApps.length > 0 && post?.status !== "completed",
    handleAnalyze,
    handleReset,
    handleOpenGroup,
    handleDelete,
    handleClosePost,
    handleShiftClosed,
    handleSaveEdit,
    handleToggleSetting,
    goToAllPosts,
  };
}
