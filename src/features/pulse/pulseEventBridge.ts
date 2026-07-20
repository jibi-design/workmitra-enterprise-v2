/** Job Mitra | pulseEventBridge.ts | src/features/pulse/pulseEventBridge.ts */

import { useEffect } from "react";
import {
  PULSE_BACKEND_EVENT_TYPES,
  PULSE_EVENT_ROUTES,
  PULSE_REGISTRY,
  isPulseEnabledEventType,
  type NotificationId,
  type PulseAffectedUserRole,
  type PulseBackendEventType,
  type PulseEventDomain,
  type PulseEventSeverity,
  type PulseRouteDefinition,
} from "./pulseRegistry";
import { ROUTE_PATHS } from "../../app/router/routePaths";
import { employeeNotificationsStorage } from "../employee/notifications/storage/employeeNotifications.storage";
import { employerNotificationsStorage } from "../employer/notifications/storage/employerNotifications.storage";
import {
  usePulseStore,
  type PulseChainSeverity,
  type PulseDomain,
  type PulseNodeId,
} from "./pulseStore";
import { getPulseNavEnabled } from "./pulseNavStore";
import { showPhase2Features } from "../../shared/config/featureFlags";

export type { PulseAffectedUserRole, PulseBackendEventType } from "./pulseRegistry";

export type GlobalPulseEventType = PulseBackendEventType;

export type GlobalPulseEventPayload = {
  readonly type: GlobalPulseEventType;
  readonly domain: PulseDomain;
  readonly affectedUserRole: PulseAffectedUserRole;
  readonly targetId?: string;
  readonly postId?: string;
  readonly appId?: string;
  readonly severity?: PulseChainSeverity;
  readonly title?: string;
  readonly body?: string;
  readonly route?: string;
};

type QueuedPulseEvent = GlobalPulseEventPayload & {
  readonly queueId: string;
  readonly batchKey: string;
  readonly createdAt: number;
};

type ResolvedPulseEvent = {
  readonly notificationId: NotificationId;
  readonly domain: PulseDomain;
  readonly chain: readonly PulseNodeId[];
  readonly severity: PulseChainSeverity;
  readonly postId?: string;
  readonly appId?: string;
  readonly sectionId?: PulseRouteDefinition["targetSectionId"];
};

type PulseDevTriggerOptions = {
  readonly targetId?: string;
  readonly postId?: string;
  readonly appId?: string;
  readonly severity?: PulseChainSeverity;
  readonly title?: string;
  readonly body?: string;
  readonly route?: string;
};

type PulseDevStatus = {
  readonly currentNodeId: PulseNodeId | null;
  readonly chain: readonly PulseNodeId[];
  readonly hasAnyActivePulse: boolean;
};

type PulseDevConsoleApi = {
  readonly events: readonly PulseBackendEventType[];
  readonly trigger: (
    type: PulseBackendEventType,
    options?: PulseDevTriggerOptions,
  ) => readonly PulseNodeId[];
  readonly queue: (type: PulseBackendEventType, options?: PulseDevTriggerOptions) => void;
  readonly activateNode: (
    nodeId: PulseNodeId,
    severity?: PulseChainSeverity,
  ) => readonly PulseNodeId[];
  readonly clear: () => void;
  readonly clearDemoData: () => void;
  readonly status: () => PulseDevStatus;
};

declare global {
  interface Window {
    wmPulseDev?: PulseDevConsoleApi;
  }
}

const PULSE_EVENT_QUEUE_KEY = "wm_pulse_event_queue_v1";

export const PULSE_EVENT_QUEUE_CHANGED_EVENT = "wm:pulse-event-queue-changed";

function cleanId(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function createBatchKey(payload: GlobalPulseEventPayload): string {
  const target =
    cleanId(payload.targetId) ?? cleanId(payload.postId) ?? cleanId(payload.appId) ?? "";

  return target.length > 0
    ? `${payload.affectedUserRole}:${payload.domain}:${payload.type}:${target}`
    : `${payload.affectedUserRole}:${payload.domain}:${payload.type}`;
}

function createQueueId(payload: GlobalPulseEventPayload): string {
  return `${createBatchKey(payload)}:${Date.now()}`;
}

function compactChain(nodes: readonly (PulseNodeId | undefined)[]): PulseNodeId[] {
  const output: PulseNodeId[] = [];

  for (const node of nodes) {
    if (!node) continue;

    const normalizedNode = node.trim();

    if (!normalizedNode) continue;
    if (output.includes(normalizedNode)) continue;

    output.push(normalizedNode);
  }

  return output;
}

function toPulseSeverity(value: PulseEventSeverity): PulseChainSeverity {
  if (value === "success") return "success";
  if (value === "warning") return "warning";
  if (value === "urgent") return "urgent";

  return "info";
}

function isPulseDomain(value: PulseEventDomain): value is PulseDomain {
  return (
    value === "shift" ||
    value === "career" ||
    value === "workforce" ||
    value === "employment" ||
    value === "admin" ||
    value === "system"
  );
}

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
    title: "Attendance confirmation required",
    body: "Please confirm whether you can attend this shift.",
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
    title: "Worker confirmed for your shift",
    body: "A worker has confirmed their attendance for your shift post.",
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

function getDefaultNotificationTarget(type: PulseBackendEventType): NotificationTargetDefaults {
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

function isPhase2PulsePayload(payload: GlobalPulseEventPayload): boolean {
  if (payload.domain === "workforce") return true;

  const route = payload.route ?? "";
  return (
    route.includes("/workforce") ||
    route.includes("/employer/hr") ||
    route.includes("/employer/console")
  );
}

function shouldSuppressPhase2Pulse(payload: GlobalPulseEventPayload): boolean {
  return !showPhase2Features && isPhase2PulsePayload(payload);
}

function getBellNotificationCopy(payload: GlobalPulseEventPayload): BellNotificationCopy {
  const fallback = NOTIFICATION_COPY_BY_TYPE[payload.type] ?? DEFAULT_NOTIFICATION_COPY;

  return {
    title: payload.title ?? fallback.title,
    body: payload.body ?? fallback.body,
    route: payload.route ?? fallback.route,
  };
}

function dispatchToNotificationStore(payload: GlobalPulseEventPayload): void {
  const notification = getBellNotificationCopy(payload);

  if (payload.affectedUserRole === "employee") {
    if (payload.domain === "shift") {
      employeeNotificationsStorage.pushShift(
        notification.title,
        notification.body,
        notification.route,
      );
      return;
    }

    if (payload.domain === "career") {
      employeeNotificationsStorage.pushCareer(
        notification.title,
        notification.body,
        notification.route,
      );
      return;
    }

    if (payload.domain === "workforce") {
      employeeNotificationsStorage.pushWorkforce(
        notification.title,
        notification.body,
        notification.route,
      );
      return;
    }

    if (payload.domain === "employment") {
      employeeNotificationsStorage.pushEmployment(
        notification.title,
        notification.body,
        notification.route,
      );
      return;
    }

    employeeNotificationsStorage.pushEmployment(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  if (payload.domain === "shift") {
    employerNotificationsStorage.pushShift(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  if (payload.domain === "career") {
    employerNotificationsStorage.pushCareer(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  if (payload.domain === "workforce") {
    employerNotificationsStorage.pushWorkforce(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  if (payload.domain === "employment") {
    employerNotificationsStorage.pushEmployment(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  employerNotificationsStorage.pushConsole(
    notification.title,
    notification.body,
    notification.route,
  );
}

/**
 * Strict Global Notification Bridge.
 *
 * Bell notifications are always updated. Pulse is only allowed for events in
 * PULSE_ENABLED_EVENT_TYPES. Passive events bypass the pulse store entirely.
 */
export function handleIncomingNotification(payload: GlobalPulseEventPayload): PulseNodeId[] {
  if (shouldSuppressPhase2Pulse(payload)) {
    return [];
  }

  dispatchToNotificationStore(payload);

  if (!isPulseEnabledEventType(payload.type)) {
    return [];
  }

  return dispatchPulseEvent(payload);
}

function replaceRouteToken(token: string, payload: GlobalPulseEventPayload): string | undefined {
  const targetId = cleanId(payload.targetId);
  const postId = cleanId(payload.postId ?? payload.targetId);
  const appId = cleanId(payload.appId);

  return token
    .replaceAll("{targetId}", targetId ?? "")
    .replaceAll("{postId}", postId ?? "")
    .replaceAll("{appId}", appId ?? "");
}

function resolveRouteChain(
  route: PulseRouteDefinition,
  payload: GlobalPulseEventPayload,
): PulseNodeId[] {
  return compactChain(
    route.chain.map((nodeId) => {
      const resolvedNodeId = replaceRouteToken(nodeId, payload);

      return resolvedNodeId && resolvedNodeId.trim().length > 0 ? resolvedNodeId : undefined;
    }),
  );
}

function isSameChainOrContinuation(
  currentChain: readonly PulseNodeId[],
  nextChain: readonly PulseNodeId[],
): boolean {
  if (currentChain.length === 0) return false;
  if (nextChain.length === 0) return false;

  const offset = nextChain.length - currentChain.length;

  if (offset < 0) return false;

  return currentChain.every((nodeId, index) => {
    return nodeId === nextChain[offset + index];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readSeverity(value: unknown): PulseChainSeverity | undefined {
  if (value === "info" || value === "success" || value === "warning" || value === "urgent") {
    return value;
  }

  return undefined;
}

function readRole(value: unknown): PulseAffectedUserRole | undefined {
  if (value === "employee" || value === "employer" || value === "admin") {
    return value;
  }

  return undefined;
}

function readDomain(value: unknown): PulseDomain | undefined {
  if (
    value === "shift" ||
    value === "career" ||
    value === "workforce" ||
    value === "employment" ||
    value === "admin" ||
    value === "system"
  ) {
    return value;
  }

  return undefined;
}

function readEventType(value: unknown): GlobalPulseEventType | undefined {
  if (typeof value !== "string") return undefined;

  return PULSE_BACKEND_EVENT_TYPES.includes(value as PulseBackendEventType)
    ? (value as PulseBackendEventType)
    : undefined;
}

function readQueuedPulseEvent(value: unknown): QueuedPulseEvent | null {
  if (!isRecord(value)) return null;

  const type = readEventType(value.type);
  const domain = readDomain(value.domain);
  const affectedUserRole = readRole(value.affectedUserRole);
  const queueId = readString(value.queueId);
  const batchKey = readString(value.batchKey);
  const createdAt = typeof value.createdAt === "number" ? value.createdAt : undefined;

  if (!type || !domain || !affectedUserRole || !queueId || !batchKey || !createdAt) {
    return null;
  }

  return {
    type,
    domain,
    affectedUserRole,
    queueId,
    batchKey,
    createdAt,
    targetId: readString(value.targetId),
    postId: readString(value.postId),
    appId: readString(value.appId),
    severity: readSeverity(value.severity),
    title: readString(value.title),
    body: readString(value.body),
    route: readString(value.route),
  };
}

function readQueuedPulseEvents(): QueuedPulseEvent[] {
  try {
    if (typeof window === "undefined") return [];

    const raw = window.localStorage.getItem(PULSE_EVENT_QUEUE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(readQueuedPulseEvent)
      .filter((event): event is QueuedPulseEvent => event !== null);
  } catch {
    return [];
  }
}

function writeQueuedPulseEvents(events: readonly QueuedPulseEvent[]): void {
  try {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(PULSE_EVENT_QUEUE_KEY, JSON.stringify(events));
  } catch {
    // Queue is best-effort in demo/local mode. Backend will become source of truth later.
  }
}

function emitPulseQueueChanged(): void {
  try {
    if (typeof window === "undefined") return;

    window.dispatchEvent(new Event(PULSE_EVENT_QUEUE_CHANGED_EVENT));
  } catch {
    // Event emit is best-effort in demo/local mode.
  }
}

function resolvePulseEvent(payload: GlobalPulseEventPayload): ResolvedPulseEvent | null {
  if (!isPulseEnabledEventType(payload.type)) return null;

  const baseRoute = PULSE_EVENT_ROUTES[payload.type];

  if (!baseRoute) return null;

  const route =
    payload.type === "REVIEW_RECEIVED"
      ? {
          ...baseRoute,
          domain: payload.domain,
          affectedUserRole: payload.affectedUserRole,
          chain:
            payload.affectedUserRole === "employer"
              ? ["topbar-notification-icon", "employer-review-center"]
              : baseRoute.chain,
        }
      : baseRoute;

  if (route.affectedUserRole !== payload.affectedUserRole) return null;
  if (payload.type !== "REVIEW_RECEIVED" && route.domain !== payload.domain) return null;
  if (
    payload.type === "REVIEW_RECEIVED" &&
    payload.domain !== "shift" &&
    payload.domain !== "career"
  ) {
    return null;
  }
  if (!isPulseDomain(route.domain)) return null;

  const chain = resolveRouteChain(route, payload);

  if (chain.length === 0) return null;

  return {
    notificationId: route.eventId,
    domain: route.domain,
    severity: payload.severity ?? toPulseSeverity(route.severity),
    chain,
    postId: cleanId(payload.postId ?? payload.targetId),
    appId: cleanId(payload.appId),
    sectionId: "targetSectionId" in route ? route.targetSectionId : undefined,
  };
}

function activateResolvedPulseEvent(resolvedEvent: ResolvedPulseEvent): PulseNodeId[] {
  const registryConfig = PULSE_REGISTRY[resolvedEvent.notificationId];

  if (!registryConfig || !getPulseNavEnabled()) {
    return [];
  }

  const store = usePulseStore.getState();

  if (store.chain.length === 0 || !isSameChainOrContinuation(store.chain, resolvedEvent.chain)) {
    store.setChain(resolvedEvent.chain, {
      severity: resolvedEvent.severity,
      sourceEventId: resolvedEvent.notificationId,
    });
  }

  store.startPulseTrail({
    eventId: resolvedEvent.notificationId,
    domain: resolvedEvent.domain,
    targetPath: registryConfig.targetPath,
    targetParams: {
      postId: resolvedEvent.postId,
      appId: resolvedEvent.appId,
      sectionId: resolvedEvent.sectionId,
    },
    severity: resolvedEvent.severity,
  });

  return [...resolvedEvent.chain];
}

/**
 * Central entry point for the Global Pulse Navigation System.
 *
 * Future Supabase WebSocket / Push payloads can call this directly.
 */
export function dispatchPulseEvent(payload: GlobalPulseEventPayload): PulseNodeId[] {
  if (shouldSuppressPhase2Pulse(payload)) {
    return [];
  }

  if (!isPulseEnabledEventType(payload.type)) {
    return [];
  }

  const resolvedEvent = resolvePulseEvent(payload);

  if (!resolvedEvent) {
    return [];
  }

  return activateResolvedPulseEvent(resolvedEvent);
}

/**
 * Demo/local mode queue for cross-role testing before backend push delivery.
 */
export function queuePulseEventForAffectedUser(payload: GlobalPulseEventPayload): void {
  if (shouldSuppressPhase2Pulse(payload)) {
    return;
  }

  const batchKey = createBatchKey(payload);
  const existingEvents = readQueuedPulseEvents();

  if (existingEvents.some((event) => event.batchKey === batchKey)) {
    return;
  }

  writeQueuedPulseEvents([
    ...existingEvents,
    {
      ...payload,
      queueId: createQueueId(payload),
      batchKey,
      createdAt: Date.now(),
    },
  ]);

  emitPulseQueueChanged();
}

/** Cross-role notification entry point — queue for remote sessions, bell-only for info events. */
export const notifyCrossRole = queuePulseEventForAffectedUser;

export function consumeQueuedPulseEventsForRole(role: PulseAffectedUserRole): number {
  const queuedEvents = readQueuedPulseEvents();

  if (queuedEvents.length === 0) {
    return 0;
  }

  let consumedCount = 0;

  const remainingEvents = queuedEvents.filter((event) => {
    if (event.affectedUserRole !== role) {
      return true;
    }

    handleIncomingNotification(event);
    consumedCount += 1;
    return false;
  });

  writeQueuedPulseEvents(remainingEvents);

  return consumedCount;
}

type PulseQaShiftStatus = "shortlisted" | "waiting" | "confirmed";

type PulseQaShiftSeed = {
  readonly postId: string;
  readonly appId: string;
  readonly status: PulseQaShiftStatus;
};

const SHIFT_QA_POSTS_KEY = "wm_employer_shift_posts_v1";
const SHIFT_QA_APPS_KEY = "wm_employee_shift_applications_v1";
const SHIFT_QA_APPS_CHANGED_EVENT = "wm:employee-shift-applications-changed";
const SHIFT_QA_BASE_POST_ID = "qa-pulse-shift-post";
const SHIFT_QA_APP_ID_PREFIX = "qa-pulse-shift-app";

type PulseQaCareerStage = "shortlisted" | "interview" | "offered";

type PulseQaCareerSeed = {
  readonly jobId: string;
  readonly appId: string;
  readonly stage: PulseQaCareerStage;
};

const CAREER_QA_APPS_KEY = "wm_employee_career_applications_v1";
const CAREER_QA_APPS_CHANGED_EVENT = "wm:employee-career-applications-changed";
const CAREER_QA_BASE_JOB_ID = "qa-pulse-career-job";
const CAREER_QA_APP_ID_PREFIX = "qa-pulse-career-app";

function readJsonArrayFromStorage(key: string): readonly unknown[] {
  try {
    if (typeof window === "undefined") return [];

    const raw = window.localStorage.getItem(key);

    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArrayToStorage(key: string, items: readonly unknown[]): boolean {
  try {
    if (typeof window === "undefined") return false;

    window.localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

function readRecordId(value: unknown): string | null {
  if (!isRecord(value)) return null;

  return readString(value.id) ?? null;
}

function upsertStorageRecord(key: string, record: Readonly<Record<string, unknown>>): boolean {
  const existingItems = readJsonArrayFromStorage(key);
  const recordId = readRecordId(record);

  if (!recordId) return false;

  let didReplace = false;
  const nextItems = existingItems.map((item) => {
    if (readRecordId(item) !== recordId) {
      return item;
    }

    didReplace = true;
    return record;
  });

  return writeJsonArrayToStorage(key, didReplace ? nextItems : [record, ...nextItems]);
}

function dispatchBrowserEvent(eventName: string): void {
  try {
    if (typeof window === "undefined") return;

    window.dispatchEvent(new Event(eventName));
  } catch {
    // Best-effort local QA notification only.
  }
}

function getPulseQaShiftSeed(
  type: PulseBackendEventType,
  options?: PulseDevTriggerOptions,
): PulseQaShiftSeed | null {
  if (type === "SHIFT_EMPLOYEE_SHORTLISTED") {
    return {
      postId: options?.postId ?? SHIFT_QA_BASE_POST_ID,
      appId: options?.appId ?? `${SHIFT_QA_APP_ID_PREFIX}-shortlisted`,
      status: "shortlisted",
    };
  }

  if (type === "SHIFT_EMPLOYEE_WAITLISTED") {
    return {
      postId: options?.postId ?? SHIFT_QA_BASE_POST_ID,
      appId: options?.appId ?? `${SHIFT_QA_APP_ID_PREFIX}-waitlisted`,
      status: "waiting",
    };
  }

  if (type === "SHIFT_CONFIRMATION_REQUIRED") {
    return {
      postId: options?.postId ?? SHIFT_QA_BASE_POST_ID,
      appId: options?.appId ?? `${SHIFT_QA_APP_ID_PREFIX}-confirmation`,
      status: "confirmed",
    };
  }

  return null;
}

/**
 * Seeds only the local QA records required for the pulse target to exist.
 *
 * This is deliberately called only from wmPulseDev. It does not run for backend
 * notifications, real users, or public production domains.
 */
function seedShiftPulseQaData(seed: PulseQaShiftSeed): void {
  const now = Date.now();
  const startAt = now + 86_400_000;
  const endAt = startAt + 28_800_000;

  const postRecord: Readonly<Record<string, unknown>> = {
    id: seed.postId,
    companyName: "Pulse QA Employer",
    jobName: "Pulse QA Shift",
    experience: "fresher_ok",
    payPerDay: 850,
    locationName: "Kochi",
    locationAddress: "Pulse QA demo location",
    mapsLink: "",
    startAt,
    endAt,
    shiftType: "Day Shift",
    isHiddenFromSearch: false,
    updatedAt: now,
  };

  const applicationRecord: Readonly<Record<string, unknown>> = {
    id: seed.appId,
    postId: seed.postId,
    createdAt: now - 3_600_000,
    status: seed.status,
    mustHaveAnswers: {},
    goodToHaveAnswers: {},
    notes: {},
    updatedAt: now,
  };

  const didWritePost = upsertStorageRecord(SHIFT_QA_POSTS_KEY, postRecord);
  const didWriteApplication = upsertStorageRecord(SHIFT_QA_APPS_KEY, applicationRecord);

  if (didWritePost || didWriteApplication) {
    dispatchBrowserEvent(SHIFT_QA_APPS_CHANGED_EVENT);
  }
}

function clearShiftPulseQaData(): void {
  const nextPosts = readJsonArrayFromStorage(SHIFT_QA_POSTS_KEY).filter((item) => {
    return readRecordId(item) !== SHIFT_QA_BASE_POST_ID;
  });

  const nextApplications = readJsonArrayFromStorage(SHIFT_QA_APPS_KEY).filter((item) => {
    const id = readRecordId(item);

    return id === null || !id.startsWith(SHIFT_QA_APP_ID_PREFIX);
  });

  const didWritePosts = writeJsonArrayToStorage(SHIFT_QA_POSTS_KEY, nextPosts);
  const didWriteApplications = writeJsonArrayToStorage(SHIFT_QA_APPS_KEY, nextApplications);

  if (didWritePosts || didWriteApplications) {
    dispatchBrowserEvent(SHIFT_QA_APPS_CHANGED_EVENT);
  }
}

function getPulseQaCareerSeed(
  type: PulseBackendEventType,
  options?: PulseDevTriggerOptions,
): PulseQaCareerSeed | null {
  if (type === "CAREER_EMPLOYEE_SHORTLISTED") {
    return {
      jobId: options?.postId ?? CAREER_QA_BASE_JOB_ID,
      appId: options?.appId ?? `${CAREER_QA_APP_ID_PREFIX}-shortlisted`,
      stage: "shortlisted",
    };
  }

  if (type === "CAREER_INTERVIEW_SCHEDULED" || type === "CAREER_INTERVIEW_INVITE") {
    return {
      jobId: options?.postId ?? CAREER_QA_BASE_JOB_ID,
      appId: options?.appId ?? `${CAREER_QA_APP_ID_PREFIX}-interview`,
      stage: "interview",
    };
  }

  if (type === "CAREER_OFFER_RECEIVED" || type === "CAREER_OFFER_EXTENDED") {
    return {
      jobId: options?.postId ?? CAREER_QA_BASE_JOB_ID,
      appId: options?.appId ?? `${CAREER_QA_APP_ID_PREFIX}-offer`,
      stage: "offered",
    };
  }

  return null;
}

function formatQaDate(daysFromNow: number): string {
  const targetDate = new Date(Date.now() + daysFromNow * 86_400_000);

  return targetDate.toISOString().slice(0, 10);
}

/**
 * Seeds only Employee Career application records needed by the local pulse QA
 * simulator. This keeps production/backend event handling honest and prevents
 * fake data from leaking into public builds.
 */
function seedCareerPulseQaData(seed: PulseQaCareerSeed): void {
  const now = Date.now();

  const roundResults =
    seed.stage === "interview"
      ? [
          {
            round: 1,
            label: "Round 1",
            status: "scheduled",
            interviewMode: "video",
            scheduledDate: formatQaDate(2),
            scheduledTime: "10:30",
            location: "Online",
            meetingLink: "https://meet.example.com/pulse-qa",
          },
        ]
      : [];

  const offerDetails =
    seed.stage === "offered"
      ? {
          jobTitle: "Pulse QA Career Role",
          salary: 45_000,
          salaryPeriod: "monthly",
          startDate: formatQaDate(7),
          message: "Pulse QA offer for local testing.",
        }
      : undefined;

  const applicationRecord: Readonly<Record<string, unknown>> = {
    id: seed.appId,
    jobId: seed.jobId,
    employeeId: "employee_demo",
    employeeName: "Pulse QA Candidate",
    employeePhone: "9999999999",
    employeeEmail: "pulse.qa@example.com",
    resumeSummary: "QA candidate profile for local Pulse testing.",
    coverNote: "This application exists only for local Pulse QA.",
    expectedSalary: 45_000,
    noticePeriod: "Immediate",
    profileSnapshot: {
      fullName: "Pulse QA Candidate",
      phone: "9999999999",
      email: "pulse.qa@example.com",
      location: "Kochi",
      experienceYears: 3,
      skills: ["Customer support", "Operations"],
    },
    stage: seed.stage,
    currentRound: seed.stage === "interview" ? 1 : 0,
    roundResults,
    appliedAt: now - 172_800_000,
    updatedAt: now,
    employerNotes: "",
    offeredAt: seed.stage === "offered" ? now - 3_600_000 : undefined,
    offerDetails,
  };

  const didWriteApplication = upsertStorageRecord(CAREER_QA_APPS_KEY, applicationRecord);

  if (didWriteApplication) {
    dispatchBrowserEvent(CAREER_QA_APPS_CHANGED_EVENT);
  }
}

function clearCareerPulseQaData(): void {
  const nextApplications = readJsonArrayFromStorage(CAREER_QA_APPS_KEY).filter((item) => {
    const id = readRecordId(item);

    return id === null || !id.startsWith(CAREER_QA_APP_ID_PREFIX);
  });

  const didWriteApplications = writeJsonArrayToStorage(CAREER_QA_APPS_KEY, nextApplications);

  if (didWriteApplications) {
    dispatchBrowserEvent(CAREER_QA_APPS_CHANGED_EVENT);
  }
}

function seedPulseQaData(
  type: PulseBackendEventType,
  options?: PulseDevTriggerOptions,
): PulseDevTriggerOptions | undefined {
  const shiftSeed = getPulseQaShiftSeed(type, options);

  if (shiftSeed) {
    seedShiftPulseQaData(shiftSeed);

    return {
      ...options,
      postId: shiftSeed.postId,
      appId: shiftSeed.appId,
      targetId: options?.targetId ?? shiftSeed.postId,
    };
  }

  const careerSeed = getPulseQaCareerSeed(type, options);

  if (careerSeed) {
    seedCareerPulseQaData(careerSeed);

    return {
      ...options,
      postId: careerSeed.jobId,
      appId: careerSeed.appId,
      targetId: options?.targetId ?? careerSeed.jobId,
    };
  }

  return options;
}

function createDevPulsePayload(
  type: PulseBackendEventType,
  options?: PulseDevTriggerOptions,
): GlobalPulseEventPayload | null {
  if (isPulseEnabledEventType(type)) {
    const route = PULSE_EVENT_ROUTES[type];

    if (!route) return null;
    if (!isPulseDomain(route.domain)) return null;

    return {
      type,
      domain: route.domain,
      affectedUserRole: route.affectedUserRole,
      targetId:
        options?.targetId ?? options?.postId ?? options?.appId ?? `qa-${type.toLowerCase()}`,
      postId: options?.postId,
      appId: options?.appId,
      severity: options?.severity ?? toPulseSeverity(route.severity),
    };
  }

  const fallback = getDefaultNotificationTarget(type);

  return {
    type,
    domain: fallback.domain,
    affectedUserRole: fallback.affectedUserRole,
    targetId: options?.targetId ?? options?.postId ?? options?.appId ?? `qa-${type.toLowerCase()}`,
    postId: options?.postId,
    appId: options?.appId,
    severity: options?.severity,
  };
}

function createPulseDevConsoleApi(): PulseDevConsoleApi {
  return {
    events: PULSE_BACKEND_EVENT_TYPES,

    trigger: (type, options) => {
      const seededOptions = seedPulseQaData(type, options);
      const payload = createDevPulsePayload(type, seededOptions);

      if (!payload) return [];

      return handleIncomingNotification(payload);
    },

    queue: (type, options) => {
      const seededOptions = seedPulseQaData(type, options);
      const payload = createDevPulsePayload(type, seededOptions);

      if (!payload) return;

      queuePulseEventForAffectedUser(payload);
    },

    activateNode: (nodeId, severity) => {
      usePulseStore.getState().setChain([nodeId], { severity });
      return [nodeId];
    },

    clear: () => {
      usePulseStore.getState().clearAllPulses();
    },

    clearDemoData: () => {
      clearShiftPulseQaData();
      clearCareerPulseQaData();
    },

    status: () => {
      const store = usePulseStore.getState();

      return {
        currentNodeId: store.getCurrentNodeId(),
        chain: [...store.chain],
        hasAnyActivePulse: store.hasAnyActivePulse(),
      };
    },
  };
}

function isLocalPulseQaHost(): boolean {
  if (typeof window === "undefined") return false;

  const { hostname } = window.location;

  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  );
}

function hasPulseQaOptInFlag(): boolean {
  if (typeof window === "undefined") return false;

  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.get("wmPulseDev") === "1") return true;

  try {
    return window.localStorage.getItem("wm_enable_pulse_dev_tools") === "true";
  } catch {
    return false;
  }
}

function shouldInstallPulseDevTools(): boolean {
  if (import.meta.env.DEV) return true;

  return isLocalPulseQaHost() && hasPulseQaOptInFlag();
}

/**
 * Console-only QA simulator for local development and local production-preview QA.
 *
 * This keeps manual testing out of business components. It installs automatically
 * in Vite dev mode. For production-preview builds, it only installs on localhost
 * after an explicit QA opt-in flag, so public users never receive fake controls.
 */
function installPulseDevTools(): () => void {
  if (typeof window === "undefined") return () => undefined;
  if (!shouldInstallPulseDevTools()) return () => undefined;

  const previousDevTools = window.wmPulseDev;

  window.wmPulseDev = createPulseDevConsoleApi();

  return () => {
    if (previousDevTools) {
      window.wmPulseDev = previousDevTools;
      return;
    }

    delete window.wmPulseDev;
  };
}

/**
 * Shell-level consumer. Keeps pages/cards free from queue/listener logic.
 */
export function usePulseEventBridgeConsumer(role: PulseAffectedUserRole | null): void {
  useEffect(() => {
    const uninstallPulseDevTools = installPulseDevTools();

    if (!role) {
      return uninstallPulseDevTools;
    }

    const consumePulseQueue = () => {
      consumeQueuedPulseEventsForRole(role);
    };

    consumePulseQueue();

    const retryTimerId = window.setTimeout(consumePulseQueue, 150);

    window.addEventListener("focus", consumePulseQueue);
    window.addEventListener("storage", consumePulseQueue);
    window.addEventListener(PULSE_EVENT_QUEUE_CHANGED_EVENT, consumePulseQueue);

    return () => {
      window.clearTimeout(retryTimerId);
      window.removeEventListener("focus", consumePulseQueue);
      window.removeEventListener("storage", consumePulseQueue);
      window.removeEventListener(PULSE_EVENT_QUEUE_CHANGED_EVENT, consumePulseQueue);
      uninstallPulseDevTools();
    };
  }, [role]);
}
