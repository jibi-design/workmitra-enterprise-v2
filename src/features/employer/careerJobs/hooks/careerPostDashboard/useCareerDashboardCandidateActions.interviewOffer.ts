// App name: Job Mitra
// useCareerDashboardCandidateActions.interviewOffer.ts

import {
  hireCandidate,
  recordInterviewResult,
  scheduleInterview,
  sendOffer,
} from "../../services/careerPipelineService";
import type { CareerOfferInput } from "../../types/careerTypes";
import type { CareerCandidateActionContext } from "./useCareerDashboardCandidateActions.helpers";

export function createCareerDashboardInterviewOfferActions(ctx: CareerCandidateActionContext) {
  const {
    postId,
    post,
    apps,
    busy,
    setTab,
    setNotice,
    openConfirm,
    scheduleTarget,
    setScheduleTarget,
    resultTarget,
    setResultTarget,
    offerTarget,
    setOfferTarget,
    isActiveHiringLocked,
    showActiveRequiredNotice,
  } = ctx;

  function handleScheduleOpen(appId: string, roundNumber: number) {
    if (isActiveHiringLocked()) {
      showActiveRequiredNotice();
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

    if (isActiveHiringLocked()) {
      showActiveRequiredNotice();
      setScheduleTarget(null);
      return;
    }

    const target = scheduleTarget;
    setScheduleTarget(null);

    busy(async () => {
      const ok = await scheduleInterview(postId, target.appId, target.roundNumber, data);

      if (ok) {
        setTab("interview");
      } else {
        setNotice({ title: "Cannot schedule", message: "Interview could not be scheduled." });
      }
    });
  }

  function handleResultOpen(appId: string, roundNumber: number) {
    if (isActiveHiringLocked()) {
      showActiveRequiredNotice();
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

    if (isActiveHiringLocked()) {
      showActiveRequiredNotice();
      setResultTarget(null);
      return;
    }

    const target = resultTarget;
    setResultTarget(null);

    busy(async () => {
      const ok = await recordInterviewResult(
        postId,
        target.appId,
        target.roundNumber,
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
  }

  function handleSendOfferOpen(appId: string) {
    if (isActiveHiringLocked()) {
      showActiveRequiredNotice();
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

    if (isActiveHiringLocked()) {
      showActiveRequiredNotice();
      setOfferTarget(null);
      return;
    }

    busy(async () => {
      const ok = await sendOffer(postId, offerTarget.appId, offerDetails);

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
    if (isActiveHiringLocked()) {
      showActiveRequiredNotice();
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
        busy(async () => {
          const result = await hireCandidate(postId, appId);

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
                  : result.reason === "api_error"
                    ? "Server hire confirmation failed. Local hire was rolled back."
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

  return {
    handleScheduleOpen,
    handleScheduleSubmit,
    handleResultOpen,
    handleResultSubmit,
    handleOfferSubmit,
    handleSendOfferOpen,
    handleHire,
  };
}
