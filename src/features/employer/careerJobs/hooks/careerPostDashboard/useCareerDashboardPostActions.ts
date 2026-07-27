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

  return {
    goToCareerHome,
    handlePause,
    handleResume,
    handleRepost,
    handleClose,
  };
}
