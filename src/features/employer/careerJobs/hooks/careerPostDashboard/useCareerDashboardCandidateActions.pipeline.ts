// App name: Job Mitra
// useCareerDashboardCandidateActions.pipeline.ts

import {
  moveInterviewCandidateToShortlist,
  rejectCandidate,
  rejectCandidatesBulk,
  removeCandidateFromShortlist,
  shortlistCandidate,
  shortlistCandidatesBulk,
  updateEmployerNotes,
} from "../../services/careerPipelineService";
import type { CareerApplicationStage } from "../../types/careerTypes";
import type { CareerCandidateActionContext } from "./useCareerDashboardCandidateActions.helpers";

function mostAdvancedRejectStage(stages: CareerApplicationStage[]): CareerApplicationStage {
  const order: CareerApplicationStage[] = [
    "applied",
    "shortlisted",
    "interview",
    "offered",
    "offer_accepted",
  ];
  let best: CareerApplicationStage = "applied";
  let bestIdx = -1;
  for (const stage of stages) {
    const idx = order.indexOf(stage);
    if (idx > bestIdx) {
      bestIdx = idx;
      best = stage;
    }
  }
  return best;
}

export function createCareerDashboardPipelineActions(ctx: CareerCandidateActionContext) {
  const {
    postId,
    apps,
    busy,
    setTab,
    setNotice,
    openConfirm,
    rejectTarget,
    setRejectTarget,
    notesTarget,
    setNotesTarget,
    notesValue,
    setNotesValue,
    isPostActionLocked,
    showPostLockedNotice,
  } = ctx;

  function handleShortlist(appId: string) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }
    busy(async () => {
      const ok = await shortlistCandidate(postId, appId);

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

  function handleBulkShortlist(appIds: readonly string[]) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }

    const ids = Array.from(new Set(appIds.filter(Boolean)));
    if (ids.length === 0) return;

    busy(async () => {
      const result = await shortlistCandidatesBulk(postId, ids);

      if (result.okCount > 0) {
        setTab("shortlisted");
        setNotice({
          title: "Shortlist updated",
          message: `${result.okCount} candidate(s) moved to Shortlist.`,
        });
      } else {
        setNotice({
          title: "Cannot shortlist",
          message: "None of the selected candidates could be shortlisted from their current stage.",
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
        busy(async () => {
          const ok = isInterviewCandidate
            ? await moveInterviewCandidateToShortlist(postId, appId)
            : await removeCandidateFromShortlist(postId, appId);

          if (ok) {
            setTab(isInterviewCandidate ? "shortlisted" : "applied");
            setNotice({
              title: isInterviewCandidate ? "Moved back to Shortlist" : "Moved back to Applied",
              message: isInterviewCandidate
                ? "Candidate returned to Shortlist and can be scheduled again later."
                : "Candidate removed from Shortlist and returned to Applied.",
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
      mode: "single",
      appIds: [appId],
      candidateName: app.employeeName || `Candidate ${appId.slice(-6).toUpperCase()}`,
      currentStage: app.stage,
    });
  }

  function handleBulkRejectOpen(appIds: readonly string[]) {
    if (isPostActionLocked()) {
      showPostLockedNotice();
      return;
    }

    const ids = Array.from(new Set(appIds.filter(Boolean)));
    if (ids.length === 0) return;

    const targets = apps.filter((item) => ids.includes(item.id) && item.jobId === postId);
    if (targets.length === 0) return;

    setRejectTarget({
      mode: "bulk",
      appIds: targets.map((item) => item.id),
      candidateName: `${targets.length} candidates`,
      currentStage: mostAdvancedRejectStage(targets.map((item) => item.stage)),
    });
  }

  function handleRejectSubmit(reason: string) {
    if (!rejectTarget) return;

    if (isPostActionLocked()) {
      showPostLockedNotice();
      setRejectTarget(null);
      return;
    }

    const target = rejectTarget;
    setRejectTarget(null);

    busy(async () => {
      if (target.mode === "bulk") {
        const result = await rejectCandidatesBulk(postId, target.appIds, reason);
        if (result.okCount > 0) {
          setTab("rejected");
          setNotice({
            title: "Candidates rejected",
            message: `${result.okCount} candidate(s) moved to Rejected.`,
          });
        } else {
          setNotice({
            title: "Cannot reject",
            message:
              "None of the selected candidates could be rejected. Advanced stages may require a longer reason.",
          });
        }
        return;
      }

      const appId = target.appIds[0];
      if (!appId) return;

      const ok = await rejectCandidate(postId, appId, reason);
      if (ok) {
        setTab("rejected");
      } else {
        setNotice({
          title: "Cannot reject",
          message: "This candidate cannot be rejected from their current stage.",
        });
      }
    });
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
    handleBulkShortlist,
    handleRemoveFromShortlist,
    handleRejectOpen,
    handleBulkRejectOpen,
    handleRejectSubmit,
    handleNotesOpen,
    handleNotesSave,
  };
}
