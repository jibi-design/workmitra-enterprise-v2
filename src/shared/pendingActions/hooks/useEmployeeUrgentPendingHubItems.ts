// Job Mitra | useEmployeeUrgentPendingHubItems.ts

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { NavigateFunction } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import {
  acceptInterview,
  declineInterview,
} from "../../../features/employee/careerJobs/services/careerInterviewRsvpService";
import {
  acceptCareerOffer,
  declineCareerOffer,
} from "../../../features/employee/careerJobs/services/careerApplyService";
import {
  readCareerApps,
  readCareerPosts,
} from "../../../features/employer/careerJobs/helpers/careerNormalizers";
import type {
  CareerApplication,
  RoundResult,
} from "../../../features/career/types/careerDomainTypes";
import { employeeProfileStorage } from "../../../features/employee/profile/storage/employeeProfile.storage";
import { shiftApplicationsStorage } from "../../../features/employee/shiftJobs/storage/shiftApplications.storage";
import { isPlannerApplication } from "../../../features/employee/planner/helpers/plannerDomainFilters";
import { pendingActionsStorage } from "../../storage/pendingActionsStorage";
import type { PendingActionItem } from "../pendingActions.types";
import {
  buildAttendanceConfirmHubItems,
  buildEmployeeOfferHubItems,
  buildInterviewRsvpHubItems,
  clearPendingActionDismissed,
  type AttendanceConfirmHubSource,
  type CareerOfferHubSource,
  type InterviewRsvpHubSource,
} from "../helpers/pendingActionsHubItems.helpers";

const CAREER_APPS_CHANGED = "wm:employee-career-applications-changed";

function getCurrentEmployeeId(): string {
  return employeeProfileStorage.get().uniqueId ?? "employee_demo";
}

function findPendingInterviewRound(app: CareerApplication): RoundResult | null {
  const scheduled = app.roundResults
    .filter((round) => round.status === "scheduled")
    .sort((a, b) => a.round - b.round);

  for (const round of scheduled) {
    if (!round.rsvpStatus || round.rsvpStatus === "pending") {
      return round;
    }
  }

  return null;
}

function getCareerAppsSnapshot(): string {
  return JSON.stringify(readCareerApps());
}

function subscribeCareerApps(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(CAREER_APPS_CHANGED, handler);
  return () => window.removeEventListener(CAREER_APPS_CHANGED, handler);
}

export function useEmployeeUrgentPendingHubItems(navigate: NavigateFunction): PendingActionItem[] {
  const careerAppsRevision = useSyncExternalStore(
    subscribeCareerApps,
    getCareerAppsSnapshot,
    getCareerAppsSnapshot,
  );
  const pendingDismissedRevision = useSyncExternalStore(
    pendingActionsStorage.subscribe,
    pendingActionsStorage.getAll,
    pendingActionsStorage.getAll,
  );

  const apps = useSyncExternalStore(
    shiftApplicationsStorage.subscribe,
    shiftApplicationsStorage.getApps,
    shiftApplicationsStorage.getApps,
  );

  const posts = useSyncExternalStore(
    shiftApplicationsStorage.subscribe,
    shiftApplicationsStorage.getPosts,
    shiftApplicationsStorage.getPosts,
  );

  const handleAcceptInterview = useCallback((jobId: string) => {
    if (acceptInterview(jobId)) {
      clearPendingActionDismissed(`career-interview-rsvp-${jobId}`);
    }
  }, []);

  const handleDeclineInterview = useCallback((jobId: string) => {
    if (declineInterview(jobId)) {
      clearPendingActionDismissed(`career-interview-rsvp-${jobId}`);
    }
  }, []);

  const handleAcceptOffer = useCallback(
    (jobId: string) => {
      void (async () => {
        const result = await acceptCareerOffer(jobId);
        clearPendingActionDismissed(`career-offer-response-${jobId}`);
        if (result.ok) {
          navigate(ROUTE_PATHS.employeeCareerApplications);
          return;
        }
        navigate(ROUTE_PATHS.employeeCareerApplications);
      })();
    },
    [navigate],
  );

  const handleDeclineOffer = useCallback((jobId: string) => {
    void (async () => {
      if (await declineCareerOffer(jobId)) {
        clearPendingActionDismissed(`career-offer-response-${jobId}`);
      }
    })();
  }, []);

  const handleConfirmAttendance = useCallback((applicationId: string) => {
    const result = shiftApplicationsStorage.confirmAttendance(applicationId);
    if (result.ok) {
      clearPendingActionDismissed(`shift-attendance-${applicationId}`);
    }
  }, []);

  return useMemo(() => {
    void careerAppsRevision;
    void pendingDismissedRevision;

    const employeeId = getCurrentEmployeeId();
    const careerApps = readCareerApps().filter((app) => app.employeeId === employeeId);
    const careerPostMap = new Map(readCareerPosts().map((post) => [post.id, post]));

    const interviewSources: InterviewRsvpHubSource[] = [];
    const offerSources: CareerOfferHubSource[] = [];

    for (const app of careerApps) {
      if (app.stage === "interview") {
        const pendingRound = findPendingInterviewRound(app);
        const post = careerPostMap.get(app.jobId);
        if (pendingRound && post) {
          interviewSources.push({
            jobId: app.jobId,
            jobTitle: post.jobTitle,
            companyName: post.companyName,
            roundLabel: pendingRound.label,
          });
        }
      }

      if (app.stage === "offered") {
        const post = careerPostMap.get(app.jobId);
        if (post) {
          offerSources.push({
            jobId: app.jobId,
            jobTitle: post.jobTitle,
            companyName: post.companyName,
          });
        }
      }
    }

    const shiftPostMap = new Map(posts.map((post) => [post.id, post]));
    const attendanceSources: AttendanceConfirmHubSource[] = apps
      .filter(
        (app) =>
          !isPlannerApplication(app) &&
          app.status === "confirmed" &&
          app.attendanceConfirmedAt === undefined,
      )
      .map((app) => {
        const post = shiftPostMap.get(app.postId);
        return {
          applicationId: app.id,
          jobName: post?.jobName ?? "Shift",
          companyName: post?.companyName ?? "Employer",
        };
      });

    return [
      ...buildInterviewRsvpHubItems(interviewSources, {
        onAccept: handleAcceptInterview,
        onDecline: handleDeclineInterview,
      }),
      ...buildAttendanceConfirmHubItems(attendanceSources, {
        onConfirm: handleConfirmAttendance,
      }),
      ...buildEmployeeOfferHubItems(offerSources, {
        onAccept: handleAcceptOffer,
        onDecline: handleDeclineOffer,
      }),
    ];
  }, [
    careerAppsRevision,
    pendingDismissedRevision,
    apps,
    posts,
    handleAcceptInterview,
    handleDeclineInterview,
    handleAcceptOffer,
    handleDeclineOffer,
    handleConfirmAttendance,
  ]);
}
