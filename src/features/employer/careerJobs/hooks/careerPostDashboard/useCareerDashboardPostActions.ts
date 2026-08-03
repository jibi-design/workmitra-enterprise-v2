// App name: Job Mitra
// File name: useCareerDashboardPostActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\hooks\careerPostDashboard\useCareerDashboardPostActions.ts

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import {
  cloneCareerPost,
  closeCareerPost,
  deleteCareerPost,
  expireCareerPost,
  extendCareerPostClosingDate,
  pauseCareerPost,
  resumeCareerPost,
} from "../../services/careerPostService";

type UseCareerDashboardPostActionsArgs = {
  postId: string;
  openConfirm: (data: ConfirmData, fn: () => void | Promise<void>) => void;
  setNotice: (notice: NoticeData | null) => void;
};

export function useCareerDashboardPostActions({
  postId,
  openConfirm,
  setNotice,
}: UseCareerDashboardPostActionsArgs) {
  const nav = useNavigate();

  function goToCareerHome() {
    nav(ROUTE_PATHS.employerCareerHome);
  }

  function handlePause() {
    openConfirm(
      {
        title: "Pause this post?",
        message: "The post will no longer be visible to applicants.",
        tone: "warn",
        confirmLabel: "Pause",
      },
      async () => {
        const ok = await pauseCareerPost(postId);

        setNotice(
          ok
            ? {
                title: "Post paused",
                message: "This Career Job is no longer visible to new applicants.",
                tone: "success",
              }
            : {
                title: "Cannot pause post",
                message: "Only active posts can be paused.",
              },
        );
      },
    );
  }

  async function handleResume() {
    const ok = await resumeCareerPost(postId);

    setNotice(
      ok
        ? {
            title: "Post resumed",
            message: "This Career Job is visible to applicants again.",
            tone: "success",
          }
        : {
            title: "Cannot resume post",
            message: "Only paused posts with a future closing date can be resumed.",
          },
    );
  }

  function handleRepost() {
    openConfirm(
      {
        title: "Create similar job?",
        message:
          "A new copy of this closed or filled post will be created as a draft. Review it before publishing.",
        tone: "neutral",
        confirmLabel: "Create Copy",
        cancelLabel: "Cancel",
      },
      async () => {
        const newId = await cloneCareerPost(postId);

        if (newId) {
          nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", newId));
          return;
        }

        setNotice({
          title: "Cannot create copy",
          message: "Only closed or filled posts can be copied from this dashboard.",
        });
      },
    );
  }

  function handleClose() {
    openConfirm(
      {
        title: "Close this post?",
        message:
          "No new applications will be accepted. Existing candidates will remain in your hiring records.",
        tone: "danger",
        confirmLabel: "Close Post",
      },
      async () => {
        const ok = await closeCareerPost(postId);

        setNotice(
          ok
            ? {
                title: "Post closed",
                message: "This Career Job is closed and no longer accepts new applications.",
                tone: "success",
              }
            : {
                title: "Cannot close post",
                message: "Only active or paused posts can be closed.",
              },
        );
      },
    );
  }

  function handleExpire() {
    openConfirm(
      {
        title: "Mark this post expired?",
        message:
          "Closing date has passed. The post will be closed and open applications will be rejected.",
        tone: "danger",
        confirmLabel: "Mark Expired",
      },
      async () => {
        const ok = await expireCareerPost(postId);

        setNotice(
          ok
            ? {
                title: "Post expired",
                message: "This Career Job is closed because the closing date has passed.",
                tone: "success",
              }
            : {
                title: "Cannot expire post",
                message: "Only active or paused posts past their closing date can be expired.",
              },
        );
      },
    );
  }

  function handleExtendClosing() {
    openConfirm(
      {
        title: "Extend closing date?",
        message: "Add 30 days to this post's closing date so applicants can still apply.",
        tone: "neutral",
        confirmLabel: "Extend 30 Days",
      },
      async () => {
        const ok = await extendCareerPostClosingDate(postId, 30);

        setNotice(
          ok
            ? {
                title: "Closing date extended",
                message: "Applicants can apply until the new closing date.",
                tone: "success",
              }
            : {
                title: "Cannot extend closing date",
                message: "Only active or paused posts can have their closing date extended.",
              },
        );
      },
    );
  }

  function handleDelete() {
    openConfirm(
      {
        title: "Delete this post?",
        message:
          "This removes the job post from your Career board. Application history may remain in records.",
        tone: "danger",
        confirmLabel: "Delete Post",
      },
      async () => {
        const ok = await deleteCareerPost(postId);

        if (ok) {
          nav(ROUTE_PATHS.employerCareerHome);
          return;
        }

        setNotice({
          title: "Cannot delete post",
          message: "The post could not be deleted. Try again or close the post first.",
        });
      },
    );
  }

  return {
    goToCareerHome,
    handlePause,
    handleResume,
    handleRepost,
    handleClose,
    handleExpire,
    handleExtendClosing,
    handleDelete,
  };
}
