/** Job Mitra | pulseEventBridge.notificationCopy.ts | src/features/pulse/pulseEventBridge.notificationCopy.ts */

import { ROUTE_PATHS } from "../../app/router/routePaths";
import type { PulseBackendEventType } from "./pulseRegistry";
import type { GlobalPulseEventPayload } from "./pulseEventBridge.types";
import type { PulseDomain } from "./pulseStore";
import type { PulseAffectedUserRole } from "./pulseRegistry";

type BellNotificationCopy = {
  readonly title: string;
  readonly body?: string;
  readonly route?: string;
};

type NotificationTargetDefaults = {
  readonly domain: PulseDomain;
  readonly affectedUserRole: PulseAffectedUserRole;
};

const DEFAULT_NOTIFICATION_COPY: BellNotificationCopy = {
  title: "Job Mitra update",
  body: "You have a new update.",
};

const NOTIFICATION_COPY_BY_TYPE: Partial<Record<PulseBackendEventType, BellNotificationCopy>> = {
  SHIFT_APPLICATION_SUBMITTED: {
    title: "New shift application received",
    body: "A worker has applied to your shift post.",
    route: ROUTE_PATHS.employerShiftHome,
  },
  SHIFT_EMPLOYEE_SHORTLISTED: {
    title: "You have been shortlisted",
    body: "Employer is reviewing your shift application.",
    route: ROUTE_PATHS.employeeShiftApplications,
  },
  SHIFT_EMPLOYEE_WAITLISTED: {
    title: "You are on the waiting list",
    body: "Employer placed your shift application on the backup list.",
    route: ROUTE_PATHS.employeeShiftApplications,
  },
  SHIFT_CONFIRMATION_REQUIRED: {
    title: "Attendance Intent / Check-in Signal required",
    body: "Please save attendance intent for this shift (check-in signal only — not a legal timecard).",
    route: ROUTE_PATHS.employeeShiftApplications,
  },
  SHIFT_EMPLOYEE_SELECTED: {
    title: "You are selected",
    body: "Your employer confirmed you for this shift. Open your workspace to get started.",
    route: ROUTE_PATHS.employeeShiftWorkspaces,
  },

  CAREER_APPLICATION_SUBMITTED: {
    title: "New career application received",
    body: "A candidate has applied to your career job post.",
    route: ROUTE_PATHS.employerCareerHome,
  },
  CAREER_NEW_APPLICATION: {
    title: "New career application received",
    body: "A candidate has applied to your career job post.",
    route: ROUTE_PATHS.employerCareerHome,
  },
  CAREER_EMPLOYEE_SHORTLISTED: {
    title: "Career application shortlisted",
    body: "You have been shortlisted by an employer.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
  CAREER_INTERVIEW_SCHEDULED: {
    title: "Interview scheduled",
    body: "You have been moved to the interview stage.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
  CAREER_INTERVIEW_INVITE: {
    title: "Interview invite received",
    body: "Please review your interview details.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
  CAREER_OFFER_RECEIVED: {
    title: "Job offer received",
    body: "An employer has sent you a job offer.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
  CAREER_OFFER_EXTENDED: {
    title: "Job offer received",
    body: "An employer has sent you a job offer.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
  CAREER_OFFER_ACCEPTED: {
    title: "Career offer accepted",
    body: "The candidate accepted your job offer.",
    route: ROUTE_PATHS.employerCareerHome,
  },
  CAREER_OFFER_REJECTED: {
    title: "Career offer declined",
    body: "The candidate declined your job offer.",
    route: ROUTE_PATHS.employerCareerHome,
  },

  NEW_RATING: {
    title: "New rating received",
    body: "A new rating has been added to your work record.",
  },
  REVIEW_RECEIVED: {
    title: "Review received",
    body: "A new review has been added.",
  },
  GROUP_UPDATE: {
    title: "Work group update",
    body: "There is an update in your workspace.",
  },
  GENERAL_BROADCAST: {
    title: "Broadcast received",
    body: "A new general update is available.",
  },
  PROFILE_VIEW: {
    title: "Profile viewed",
    body: "Someone viewed your profile.",
  },
  CAREER_JOB_BOOKMARKED: {
    title: "Job post bookmarked",
    body: "Someone saved your career job post.",
    route: ROUTE_PATHS.employerCareerHome,
  },
  CAREER_RESUME_DOWNLOADED: {
    title: "Resume viewed",
    body: "An employer viewed your resume.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
  CAREER_POST_EXPIRING: {
    title: "Career post expiring soon",
    body: "One of your career job posts expires soon.",
    route: ROUTE_PATHS.employerCareerHome,
  },
  CAREER_PROFILE_VIEWED: {
    title: "Career profile viewed",
    body: "An employer viewed your career profile.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
  SYSTEM_ALERT: {
    title: "System alert",
    body: "A Job Mitra system update needs your attention.",
  },

  SHIFT_WORKER_CONFIRMED: {
    title: "Worker saved Attendance Intent / Check-in Signal",
    body: "A confirmed worker marked plan-to-attend (intent only — not QR punch-in or a legal timecard).",
    route: ROUTE_PATHS.employerShiftHome,
  },
  SHIFT_WORKER_CANCELLED: {
    title: "Worker cancelled — action needed",
    body: "A confirmed worker has cancelled their shift. Find a replacement immediately.",
    route: ROUTE_PATHS.employerShiftHome,
  },
  SHIFT_POST_COMPLETED: {
    title: "Shift completed",
    body: "Your shift post is marked complete and work history records are finalized.",
    route: ROUTE_PATHS.employerShiftHome,
  },
  SHIFT_PLAN_CANCELLED_CONFIRMED_WORKER: {
    title: "Confirmed project day cancelled",
    body: "An employer cancelled a project plan you were confirmed for.",
    route: ROUTE_PATHS.employeePlannerHome,
  },
  PLAN_CANCELLED: {
    title: "Project plan cancelled",
    body: "An employer cancelled a project plan. Your pending day applications are no longer active.",
    route: ROUTE_PATHS.employeePlannerHome,
  },
  CAREER_INTERVIEW_ACCEPTED: {
    title: "Interview accepted by candidate",
    body: "The candidate accepted your interview invite. Review the updated application.",
    route: ROUTE_PATHS.employerCareerHome,
  },
  CAREER_INTERVIEW_DECLINED: {
    title: "Interview declined by candidate",
    body: "The candidate declined your interview invite. Review the application.",
    route: ROUTE_PATHS.employerCareerHome,
  },

  SHIFT_POSTS_NEARBY: {
    title: "New shifts near you",
    body: "New shifts match your availability or profile.",
    route: ROUTE_PATHS.employeeShiftSearch,
  },
  SHIFT_APPLICATION_REJECTED: {
    title: "Shift application update",
    body: "Your shift application status was updated.",
    route: ROUTE_PATHS.employeeShiftApplications,
  },
  SHIFT_ASSIGNMENT_REPLACED: {
    title: "Shift assignment replaced",
    body: "Your shift assignment was replaced by the employer.",
    route: ROUTE_PATHS.employeeShiftApplications,
  },
  SHIFT_BACKUP_SLOT_OPEN: {
    title: "Backup slot may open",
    body: "A confirmed slot was released. Stay ready while backups are reviewed.",
    route: ROUTE_PATHS.employeeShiftApplications,
  },
  SHIFT_APPLICATION_WITHDRAWN: {
    title: "Shift application withdrawn",
    body: "A worker withdrew their shift application.",
    route: ROUTE_PATHS.employerShiftHome,
  },
  CAREER_APPLICATION_REJECTED: {
    title: "Application update",
    body: "Your career application status was updated.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
  CAREER_INTERVIEW_UPDATE: {
    title: "Interview update",
    body: "Your interview status was updated.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
  CAREER_HIRED: {
    title: "Congratulations! You are hired!",
    body: "Your onboarding workspace is ready.",
    route: ROUTE_PATHS.employeeCareerApplications,
  },
};

export function getDefaultNotificationTarget(
  type: PulseBackendEventType,
): NotificationTargetDefaults {
  switch (type) {
    case "SHIFT_APPLICATION_SUBMITTED":
      return { affectedUserRole: "employer", domain: "shift" };

    case "SHIFT_EMPLOYEE_SHORTLISTED":
    case "SHIFT_EMPLOYEE_WAITLISTED":
    case "SHIFT_CONFIRMATION_REQUIRED":
    case "SHIFT_EMPLOYEE_SELECTED":
    case "SHIFT_PLAN_CANCELLED_CONFIRMED_WORKER":
    case "PLAN_CANCELLED":
      return { affectedUserRole: "employee", domain: "shift" };

    case "CAREER_APPLICATION_SUBMITTED":
    case "CAREER_NEW_APPLICATION":
    case "CAREER_OFFER_ACCEPTED":
    case "CAREER_OFFER_REJECTED":
    case "CAREER_JOB_BOOKMARKED":
    case "CAREER_POST_EXPIRING":
    case "CAREER_INTERVIEW_ACCEPTED":
    case "CAREER_INTERVIEW_DECLINED":
      return { affectedUserRole: "employer", domain: "career" };

    case "SHIFT_WORKER_CONFIRMED":
    case "SHIFT_WORKER_CANCELLED":
    case "SHIFT_POST_COMPLETED":
    case "SHIFT_APPLICATION_WITHDRAWN":
      return { affectedUserRole: "employer", domain: "shift" };

    case "SHIFT_POSTS_NEARBY":
    case "SHIFT_APPLICATION_REJECTED":
    case "SHIFT_ASSIGNMENT_REPLACED":
    case "SHIFT_BACKUP_SLOT_OPEN":
      return { affectedUserRole: "employee", domain: "shift" };

    case "CAREER_EMPLOYEE_SHORTLISTED":
    case "CAREER_INTERVIEW_SCHEDULED":
    case "CAREER_INTERVIEW_INVITE":
    case "CAREER_OFFER_RECEIVED":
    case "CAREER_OFFER_EXTENDED":
    case "CAREER_RESUME_DOWNLOADED":
    case "CAREER_PROFILE_VIEWED":
    case "CAREER_APPLICATION_REJECTED":
    case "CAREER_INTERVIEW_UPDATE":
    case "CAREER_HIRED":
      return { affectedUserRole: "employee", domain: "career" };

    case "GROUP_UPDATE":
    case "GENERAL_BROADCAST":
      return { affectedUserRole: "employee", domain: "workforce" };

    case "NEW_RATING":
    case "REVIEW_RECEIVED":
    case "PROFILE_VIEW":
    case "SYSTEM_ALERT":
      return { affectedUserRole: "employee", domain: "system" };

    default:
      return { affectedUserRole: "employee", domain: "system" };
  }
}

export function getBellNotificationCopy(payload: GlobalPulseEventPayload): BellNotificationCopy {
  const fallback = NOTIFICATION_COPY_BY_TYPE[payload.type] ?? DEFAULT_NOTIFICATION_COPY;

  return {
    title: payload.title ?? fallback.title,
    body: payload.body ?? fallback.body,
    route: payload.route ?? fallback.route,
  };
}
