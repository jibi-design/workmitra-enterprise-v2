// Job Mitra | pendingActionsHubItems.helpers.ts | Hub row builders for urgent bottlenecks

import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { pendingActionsStorage } from "../../storage/pendingActionsStorage";
import type { PendingActionItem } from "../pendingActions.types";

export function isPendingActionDismissed(actionId: string): boolean {
  return pendingActionsStorage.isDismissed(actionId);
}

export function dismissPendingActionLater(actionId: string): void {
  pendingActionsStorage.dismissLater(actionId);
}

export function clearPendingActionDismissed(actionId: string): void {
  pendingActionsStorage.clearDismissed(actionId);
}

export type InterviewRsvpHubSource = {
  jobId: string;
  jobTitle: string;
  companyName: string;
  roundLabel: string;
};

export type AttendanceConfirmHubSource = {
  applicationId: string;
  jobName: string;
  companyName: string;
};

export type CareerOfferHubSource = {
  jobId: string;
  jobTitle: string;
  companyName: string;
};

export type EmployerOfferPendingSource = {
  appId: string;
  postId: string;
  candidateName: string;
  jobTitle: string;
};

export type EmployerConfirmPendingSource = {
  postId: string;
  jobTitle: string;
  shortlisted: number;
};

export function buildInterviewRsvpHubItems(
  sources: InterviewRsvpHubSource[],
  handlers: {
    onAccept: (jobId: string) => void;
    onDecline: (jobId: string) => void;
  },
): PendingActionItem[] {
  return sources
    .filter((source) => !isPendingActionDismissed(`career-interview-rsvp-${source.jobId}`))
    .map((source) => ({
      id: `career-interview-rsvp-${source.jobId}`,
      domain: "career" as const,
      label: "Interview RSVP required",
      detail: `${source.roundLabel} for ${source.jobTitle} at ${source.companyName}.`,
      count: 1,
      ctaLabel: "Respond",
      pulseId: "pending-career-interview-rsvp",
      onAction: () => handlers.onAccept(source.jobId),
      dualActions: {
        declineLabel: "Decline",
        acceptLabel: "Accept",
        onDecline: () => handlers.onDecline(source.jobId),
        onAccept: () => handlers.onAccept(source.jobId),
        laterLabel: "Later",
        onLater: () => dismissPendingActionLater(`career-interview-rsvp-${source.jobId}`),
      },
    }));
}

export function buildAttendanceConfirmHubItems(
  sources: AttendanceConfirmHubSource[],
  handlers: {
    onConfirm: (applicationId: string) => void;
  },
): PendingActionItem[] {
  return sources
    .filter((source) => !isPendingActionDismissed(`shift-attendance-${source.applicationId}`))
    .map((source) => ({
      id: `shift-attendance-${source.applicationId}`,
      domain: "shift" as const,
      label: "Confirm shift attendance",
      detail: `${source.jobName} at ${source.companyName} — confirm you will attend.`,
      count: 1,
      ctaLabel: "I will attend",
      pulseId: "pending-shift-attendance-confirm",
      onAction: () => handlers.onConfirm(source.applicationId),
      dualActions: {
        declineLabel: "Later",
        acceptLabel: "I will attend",
        onDecline: () => dismissPendingActionLater(`shift-attendance-${source.applicationId}`),
        onAccept: () => handlers.onConfirm(source.applicationId),
      },
    }));
}

export function buildEmployeeOfferHubItems(
  sources: CareerOfferHubSource[],
  handlers: {
    onAccept: (jobId: string) => void;
    onDecline: (jobId: string) => void;
  },
): PendingActionItem[] {
  return sources
    .filter((source) => !isPendingActionDismissed(`career-offer-response-${source.jobId}`))
    .map((source) => ({
      id: `career-offer-response-${source.jobId}`,
      domain: "career" as const,
      label: "Job offer received",
      detail: `${source.jobTitle} at ${source.companyName} — accept or decline your offer.`,
      count: 1,
      ctaLabel: "Review offer",
      pulseId: "pending-career-offer-response",
      onAction: () => handlers.onAccept(source.jobId),
      dualActions: {
        declineLabel: "Decline",
        acceptLabel: "Accept offer",
        onDecline: () => handlers.onDecline(source.jobId),
        onAccept: () => handlers.onAccept(source.jobId),
        laterLabel: "Later",
        onLater: () => dismissPendingActionLater(`career-offer-response-${source.jobId}`),
      },
    }));
}

export function buildEmployerOfferPendingHubItems(
  sources: EmployerOfferPendingSource[],
  navigate: (path: string) => void,
): PendingActionItem[] {
  return sources
    .filter((source) => !isPendingActionDismissed(`employer-offer-pending-${source.appId}`))
    .map((source) => ({
      id: `employer-offer-pending-${source.appId}`,
      domain: "career" as const,
      label: "Offer awaiting response",
      detail: `${source.candidateName} — ${source.jobTitle}. Waiting for accept or decline.`,
      count: 1,
      ctaLabel: "View candidate",
      pulseId: "pending-employer-offer-awaiting",
      onAction: () =>
        navigate(
          ROUTE_PATHS.employerCareerCandidateDetail
            .replace(":postId", source.postId)
            .replace(":appId", source.appId),
        ),
      dualActions: {
        declineLabel: "Later",
        acceptLabel: "View candidate",
        onDecline: () => dismissPendingActionLater(`employer-offer-pending-${source.appId}`),
        onAccept: () =>
          navigate(
            ROUTE_PATHS.employerCareerCandidateDetail
              .replace(":postId", source.postId)
              .replace(":appId", source.appId),
          ),
      },
    }));
}

export function buildEmployerConfirmPendingHubItems(
  sources: EmployerConfirmPendingSource[],
  navigate: (path: string) => void,
): PendingActionItem[] {
  return sources
    .filter((source) => !isPendingActionDismissed(`employer-confirm-pending-${source.postId}`))
    .map((source) => ({
      id: `employer-confirm-pending-${source.postId}`,
      domain: "shift" as const,
      label: "Confirm shortlisted worker",
      detail: `${source.shortlisted} shortlisted on ${source.jobTitle}. Tap Confirm Worker to fill vacancy.`,
      count: source.shortlisted,
      ctaLabel: "Open Shortlist",
      pulseId: "pending-employer-confirm-shortlist",
      onAction: () =>
        navigate(
          `${ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", source.postId)}?tab=shortlisted`,
        ),
    }));
}
