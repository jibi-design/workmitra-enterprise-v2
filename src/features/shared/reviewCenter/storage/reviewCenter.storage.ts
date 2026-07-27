// App name: Job Mitra
// File name: reviewCenter.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\storage\reviewCenter.storage.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { handleIncomingNotification } from "../../../pulse/pulseEventBridge";
import { createReviewRequestId } from "../helpers/reviewCenter.helpers";
import type {
  ReviewCenterRequest,
  ReviewDomain,
  ReviewRequestAction,
  ReviewRole,
} from "../types/reviewCenter.types";

const REVIEW_CENTER_KEY = "wm_review_center_requests_v1";
const REVIEW_CENTER_CHANGED = "wm:review-center-changed";

type CreateReviewRequestInput = {
  domain: ReviewDomain;
  sourceId: string;
  sourceTitle: string;
  fromRole: ReviewRole;
  toRole: ReviewRole;
  action: ReviewRequestAction;
};

let cachedRaw: string | null = null;
let cachedAll: ReviewCenterRequest[] = [];
const cachedByRole: Partial<Record<ReviewRole, ReviewCenterRequest[]>> = {};

function readRequests(): ReviewCenterRequest[] {
  const raw = localStorage.getItem(REVIEW_CENTER_KEY);

  if (raw === cachedRaw) {
    return cachedAll;
  }

  cachedRaw = raw;
  cachedByRole.employee = undefined;
  cachedByRole.employer = undefined;

  try {
    if (!raw) {
      cachedAll = [];
      return cachedAll;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      cachedAll = [];
      return cachedAll;
    }

    cachedAll = parsed.filter(isReviewCenterRequest).sort((a, b) => b.createdAt - a.createdAt);

    return cachedAll;
  } catch {
    cachedAll = [];
    return cachedAll;
  }
}

function writeRequests(requests: ReviewCenterRequest[]): void {
  localStorage.setItem(REVIEW_CENTER_KEY, JSON.stringify(requests));
  cachedRaw = null;
  cachedAll = [];
  cachedByRole.employee = undefined;
  cachedByRole.employer = undefined;
  window.dispatchEvent(new Event(REVIEW_CENTER_CHANGED));
}

function isReviewCenterRequest(value: unknown): value is ReviewCenterRequest {
  if (typeof value !== "object" || value === null) return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    (item.domain === "shift" || item.domain === "career" || item.domain === "planner") &&
    typeof item.sourceId === "string" &&
    typeof item.sourceTitle === "string" &&
    (item.fromRole === "employee" || item.fromRole === "employer") &&
    (item.toRole === "employee" || item.toRole === "employer") &&
    (item.action === "employee_request_employer_rating" ||
      item.action === "employer_request_employee_review") &&
    (item.status === "active" || item.status === "resolved") &&
    typeof item.createdAt === "number"
  );
}

function requestMatches(request: ReviewCenterRequest, input: CreateReviewRequestInput): boolean {
  return (
    request.domain === input.domain &&
    request.sourceId === input.sourceId &&
    request.fromRole === input.fromRole &&
    request.toRole === input.toRole &&
    request.action === input.action &&
    request.status === "active"
  );
}

function notifyReviewRequestCreated(request: ReviewCenterRequest): void {
  const route =
    request.toRole === "employee"
      ? ROUTE_PATHS.employeeReviewCenter
      : ROUTE_PATHS.employerReviewCenter;

  const title =
    request.action === "employee_request_employer_rating" ? "Rating requested" : "Review requested";

  const body =
    request.action === "employee_request_employer_rating"
      ? `An employee requested your rating for ${request.sourceTitle}.`
      : `Your employer requested your review for ${request.sourceTitle}.`;

  // Pulse domains do not include "planner" — map to system for bridge compatibility.
  const pulseDomain = request.domain === "planner" ? "system" : request.domain;

  handleIncomingNotification({
    type: "REVIEW_RECEIVED",
    domain: pulseDomain,
    affectedUserRole: request.toRole,
    targetId: request.sourceId,
    title,
    body,
    route,
  });
}

export const reviewCenterStorage = {
  subscribe(callback: () => void): () => void {
    const handler = () => callback();

    window.addEventListener(REVIEW_CENTER_CHANGED, handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener(REVIEW_CENTER_CHANGED, handler);
      window.removeEventListener("storage", handler);
    };
  },

  getAll(): ReviewCenterRequest[] {
    return readRequests();
  },

  getActiveForRole(role: ReviewRole): ReviewCenterRequest[] {
    const cached = cachedByRole[role];

    if (cached) {
      return cached;
    }

    const next = readRequests().filter(
      (request) => request.toRole === role && request.status === "active",
    );

    cachedByRole[role] = next;
    return next;
  },

  createRequest(input: CreateReviewRequestInput): ReviewCenterRequest {
    const current = readRequests();
    const existing = current.find((request) => requestMatches(request, input));

    if (existing) return existing;

    const request: ReviewCenterRequest = {
      id: createReviewRequestId(),
      domain: input.domain,
      sourceId: input.sourceId,
      sourceTitle: input.sourceTitle,
      fromRole: input.fromRole,
      toRole: input.toRole,
      action: input.action,
      status: "active",
      createdAt: Date.now(),
    };

    writeRequests([request, ...current]);
    notifyReviewRequestCreated(request);
    return request;
  },

  markSeen(requestId: string): void {
    const current = readRequests();

    const next = current.map((request) =>
      request.id === requestId && !request.seenAt ? { ...request, seenAt: Date.now() } : request,
    );

    writeRequests(next);
  },

  resolveRequest(requestId: string): void {
    const current = readRequests();

    const next = current.map((request) =>
      request.id === requestId
        ? { ...request, status: "resolved" as const, resolvedAt: Date.now() }
        : request,
    );

    writeRequests(next);
  },

  resolveBySource(params: {
    domain: ReviewDomain;
    sourceId: string;
    toRole: ReviewRole;
    action?: ReviewRequestAction;
  }): void {
    const current = readRequests();

    const next = current.map((request) => {
      const matches =
        request.domain === params.domain &&
        request.sourceId === params.sourceId &&
        request.toRole === params.toRole &&
        request.status === "active" &&
        (!params.action || request.action === params.action);

      return matches
        ? { ...request, status: "resolved" as const, resolvedAt: Date.now() }
        : request;
    });

    writeRequests(next);
  },
} as const;
