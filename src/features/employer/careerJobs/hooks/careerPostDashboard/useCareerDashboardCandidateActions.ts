// App name: Job Mitra
// File name: useCareerDashboardCandidateActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\hooks\careerPostDashboard\useCareerDashboardCandidateActions.ts

import type { Dispatch, SetStateAction } from "react";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import type { CareerTab } from "../../components/CareerPipelineTabs";
import {
  hireCandidate,
  moveInterviewCandidateToShortlist,
  recordInterviewResult,
  rejectCandidate,
  removeCandidateFromShortlist,
  scheduleInterview,
  sendOffer,
  shortlistCandidate,
  updateEmployerNotes,
} from "../../services/careerPipelineService";
import type { CareerApplication, CareerJobPost, CareerOfferInput } from "../../types/careerTypes";
import type {
  CareerNotesTarget,
  CareerOfferTarget,
  CareerRejectTarget,
  CareerResultTarget,
  CareerScheduleTarget,
} from "../../types/careerPostDashboard.types";

type BusyRunner = (fn: () => void) => void;

type UseCareerDashboardCandidateActionsArgs = {
  postId: string;
  post: CareerJobPost | null;
  apps: CareerApplication[];
  busy: BusyRunner;
  setTab: Dispatch<SetStateAction<CareerTab>>;
  setNotice: (notice: NoticeData | null) => void;
  openConfirm: (data: ConfirmData, fn: () => void) => void;
  rejectTarget: CareerRejectTarget | null;
  setRejectTarget: Dispatch<SetStateAction<CareerRejectTarget | null>>;
  scheduleTarget: CareerScheduleTarget | null;
  setScheduleTarget: Dispatch<SetStateAction<CareerScheduleTarget | null>>;
  resultTarget: CareerResultTarget | null;
  setResultTarget: Dispatch<SetStateAction<CareerResultTarget | null>>;
  offerTarget: CareerOfferTarget | null;
  setOfferTarget: Dispatch<SetStateAction<CareerOfferTarget | null>>;
  notesTarget: CareerNotesTarget | null;
  setNotesTarget: Dispatch<SetStateAction<CareerNotesTarget | null>>;
  notesValue: string;
  setNotesValue: Dispatch<SetStateAction<string>>;
};

export function useCareerDashboardCandidateActions({
  postId,
  post,
  apps,
  busy,
  setTab,
  setNotice,
  openConfirm,
  rejectTarget,
  setRejectTarget,
  scheduleTarget,
  setScheduleTarget,
  resultTarget,
  setResultTarget,
  offerTarget,
  setOfferTarget,
  notesTarget,
  setNotesTarget,
  notesValue,
  setNotesValue,
}: UseCareerDashboardCandidateActionsArgs) {
  function isPostActionLocked(): boolean {
    return !post || post.status !== "active";
  }

  function showPostLockedNotice() {
    setNotice({
      title: "Action unavailable",
      message:
        "This post is not active. Candidate pipeline actions are locked for closed, paused, or filled posts.",
    });
  }

  function handleShortlist(appId: string) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }
    busy(() => {
      const ok = shortlistCandidate(postId, appId);

      if (ok) {
        setTab("shortlisted");
      } else {
        setNotice({
          title: "Cannot shortlist",
          message: "This candidate cannot be shortlisted from their current stage.",
        });
      }
    });
  }

  function handleRemoveFromShortlist(appId: string) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }

    const app = apps.find((item) => item.id === appId);
    const candidateName = app?.employeeName || `Candidate ${appId.slice(-6).toUpperCase()}`;
    const isInterviewCandidate = app?.stage === "interview";

    openConfirm(
      {
        title: isInterviewCandidate ? "Move back to Shortlist?" : "Remove from shortlist?",
        message: isInterviewCandidate
          ? `${candidateName} will move from Interview back to Shortlist. Scheduled interview notes will be marked as cancelled, but candidate data will stay safe.`
          : `${candidateName} will move back to Applied. This does not reject or delete the candidate.`,
        tone: "neutral",
        confirmLabel: isInterviewCandidate ? "Move back" : "Remove",
      },
      () =>
        busy(() => {
          const ok = isInterviewCandidate
            ? moveInterviewCandidateToShortlist(postId, appId)
            : removeCandidateFromShortlist(postId, appId);

          if (ok) {
            setTab(isInterviewCandidate ? "shortlisted" : "applied");
            setNotice({
              title: isInterviewCandidate ? "Moved back to Shortlist" : "Moved back to Applied",
              message: isInterviewCandidate
                ? "Candidate returned to Shortlist and can be scheduled again later."
                : "Candidate removed from Shortlist and returned to Applied.",
              tone: "success",
            });
          } else {
            setNotice({
              title: isInterviewCandidate
                ? "Cannot move candidate"
                : "Cannot remove from shortlist",
              message: isInterviewCandidate
                ? "Only interview-stage candidates can be moved back to Shortlist."
                : "Only shortlisted candidates can be moved back to Applied.",
            });
          }
        }),
    );
  }

  function handleRejectOpen(appId: string) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }

    const app = apps.find((item) => item.id === appId);
    if (!app) return;

    setRejectTarget({
      appId,
      candidateName: app.employeeName || `Candidate ${appId.slice(-6).toUpperCase()}`,
      currentStage: app.stage,
    });
  }

  function handleRejectSubmit(reason: string) {
    if (!rejectTarget) return;

    if (isPostActionLocked()) {
      showPostLockedNotice();
      setRejectTarget(null);
      return;
    }

    busy(() => {
      const ok = rejectCandidate(postId, rejectTarget.appId, reason);

      if (ok) {
        setTab("rejected");
      } else {
        setNotice({
          title: "Cannot reject",
          message: "This candidate cannot be rejected from their current stage.",
        });
      }
    });

    setRejectTarget(null);
  }

  function handleScheduleOpen(appId: string, roundNumber: number) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }

    if (!post) return;

    const roundConfig = post.roundConfigs.find((round) => round.round === roundNumber);

    setScheduleTarget({
      appId,
      roundNumber,
      roundLabel: roundConfig?.label ?? `Round ${roundNumber}`,
    });
  }

  function handleScheduleSubmit(data: Parameters<typeof scheduleInterview>[3]) {
    if (!scheduleTarget) return;

    if (isPostActionLocked()) {
      showPostLockedNotice();
      setScheduleTarget(null);
      return;
    }

    busy(() => {
      const ok = scheduleInterview(postId, scheduleTarget.appId, scheduleTarget.roundNumber, data);

      if (ok) {
        setTab("interview");
      } else {
        setNotice({ title: "Cannot schedule", message: "Interview could not be scheduled." });
      }
    });

    setScheduleTarget(null);
  }

  function handleResultOpen(appId: string, roundNumber: number) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }

    if (!post) return;

    const app = apps.find((item) => item.id === appId);
    if (!app) return;

    const roundConfig = post.roundConfigs.find((round) => round.round === roundNumber);

    setResultTarget({
      appId,
      roundNumber,
      roundLabel: roundConfig?.label ?? `Round ${roundNumber}`,
      candidateName: app.employeeName || `Candidate ${appId.slice(-6).toUpperCase()}`,
      candidateWorkerId: app.profileSnapshot?.uniqueId || app.employeeId || appId,
    });
  }

  function handleResultSubmit(result: "passed" | "failed", feedback: string) {
    if (!resultTarget) return;

    if (isPostActionLocked()) {
      showPostLockedNotice();
      setResultTarget(null);
      return;
    }

    busy(() => {
      const ok = recordInterviewResult(
        postId,
        resultTarget.appId,
        resultTarget.roundNumber,
        result,
        feedback,
      );

      if (!ok) {
        setNotice({
          title: "Cannot record result",
          message: "Interview result could not be saved.",
        });
      }
    });

    setResultTarget(null);
  }

  function handleSendOfferOpen(appId: string) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }

    const app = apps.find((item) => item.id === appId);
    if (!app) return;

    setOfferTarget({
      appId,
      candidateName: app.employeeName || `Candidate ${appId.slice(-6).toUpperCase()}`,
      candidateWorkerId: app.profileSnapshot?.uniqueId || app.employeeId || appId,
    });
  }

  function handleOfferSubmit(offerDetails: CareerOfferInput) {
    if (!offerTarget) return;

    if (isPostActionLocked()) {
      showPostLockedNotice();
      setOfferTarget(null);
      return;
    }

    busy(() => {
      const ok = sendOffer(postId, offerTarget.appId, offerDetails);

      if (ok) {
        setTab("offered");
        setNotice({
          title: "Offer Sent!",
          message: "Offer saved for the candidate in this local hiring pipeline.",
          tone: "success",
        });
      } else {
        setNotice({
          title: "Cannot send offer",
          message: "The candidate may not have passed all interview rounds.",
        });
      }
    });

    setOfferTarget(null);
  }

  function handleHire(appId: string) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }

    openConfirm(
      {
        title: "Hire this candidate?",
        message:
          "The candidate will be hired and a workspace will be created. The post will be marked as Filled.",
        tone: "neutral",
        confirmLabel: "Hire",
      },
      () =>
        busy(() => {
          const result = hireCandidate(postId, appId);

          if (result.ok) {
            setTab("hired");
            setNotice({
              title: "Candidate Hired!",
              message: "Workspace created. Post marked as Filled.",
              tone: "success",
            });
          } else {
            const message =
              result.reason === "offer_not_accepted"
                ? "The candidate must accept the offer before you can hire them."
                : result.reason === "invalid_stage"
                  ? "The candidate is not ready to be hired."
                  : result.reason === "activation_error" ||
                      result.reason === "application_write_error"
                    ? "Hire could not be completed. Please try again."
                    : "The candidate may not be in Offer Accepted stage.";

            setNotice({
              title: "Cannot hire",
              message,
            });
          }
        }),
    );
  }

  function handleNotesOpen(appId: string) {
    const app = apps.find((item) => item.id === appId);
    if (!app) return;

    setNotesTarget({ appId, currentNotes: app.employerNotes });
    setNotesValue(app.employerNotes);
  }

  function handleNotesSave() {
    if (!notesTarget) return;

    const ok = updateEmployerNotes(postId, notesTarget.appId, notesValue.trim());

    if (!ok) {
      setNotice({
        title: "Cannot save notes",
        message: "Employer notes must be 600 characters or less.",
      });
      return;
    }

    setNotesTarget(null);
    setNotesValue("");
  }

  return {
    handleShortlist,
    handleRemoveFromShortlist,
    handleRejectOpen,
    handleRejectSubmit,
    handleScheduleOpen,
    handleScheduleSubmit,
    handleResultOpen,
    handleResultSubmit,
    handleOfferSubmit,
    handleSendOfferOpen,
    handleHire,
    handleNotesOpen,
    handleNotesSave,
  };
}
