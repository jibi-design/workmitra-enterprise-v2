// App name: Job Mitra
// useCareerDashboardCandidateActions.helpers.ts

import type { Dispatch, SetStateAction } from "react";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import type { CareerTab } from "../../components/CareerPipelineTabs";
import type { CareerApplication, CareerJobPost, CareerOfferInput } from "../../types/careerTypes";
import type {
  CareerNotesTarget,
  CareerOfferTarget,
  CareerRejectTarget,
  CareerResultTarget,
  CareerScheduleTarget,
} from "../../types/careerPostDashboard.types";

export type BusyRunner = (fn: () => void | Promise<void>) => void;

export type UseCareerDashboardCandidateActionsArgs = {
  postId: string;
  post: CareerJobPost | null;
  apps: CareerApplication[];
  busy: BusyRunner;
  setTab: Dispatch<SetStateAction<CareerTab>>;
  setNotice: (notice: NoticeData | null) => void;
  openConfirm: (data: ConfirmData, fn: () => void | Promise<void>) => void;
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

export type CareerCandidateActionContext = UseCareerDashboardCandidateActionsArgs & {
  isPostActionLocked: () => boolean;
  isActiveHiringLocked: () => boolean;
  showPostLockedNotice: () => void;
  showActiveRequiredNotice: () => void;
};

export function createCareerCandidateActionContext(
  args: UseCareerDashboardCandidateActionsArgs,
): CareerCandidateActionContext {
  function isPostActionLocked(): boolean {
    // Shortlist / reject / reverse allowed on paused (Wave 1 P0-2).
    return !args.post || (args.post.status !== "active" && args.post.status !== "paused");
  }

  function isActiveHiringLocked(): boolean {
    return !args.post || args.post.status !== "active";
  }

  function showPostLockedNotice() {
    args.setNotice({
      title: "Action unavailable",
      message: "This post is closed or filled. Candidate pipeline actions are locked.",
    });
  }

  function showActiveRequiredNotice() {
    args.setNotice({
      title: "Resume post required",
      message:
        "Resume this paused post before scheduling interviews, sending offers, or hiring. Shortlist and reject still work while paused.",
    });
  }

  return {
    ...args,
    isPostActionLocked,
    isActiveHiringLocked,
    showPostLockedNotice,
    showActiveRequiredNotice,
  };
}

export type { CareerOfferInput };
