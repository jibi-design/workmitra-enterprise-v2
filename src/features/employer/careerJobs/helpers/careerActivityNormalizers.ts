// App name: Job Mitra
// File name: careerActivityNormalizers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerActivityNormalizers.ts

import type { EmployerCareerActivityEntry, EmployerCareerActivityKind } from "../types/careerTypes";
import { getNumber, getString, isRecord } from "./careerStorageUtils";
import {
  cleanNotificationRoute,
  cleanNotificationText,
  cleanOptionalNotificationText,
  DEFAULT_NOTIFICATION_TEXT_LIMITS,
  getSafeNotificationTimestamp,
} from "../../../../shared/notifications/guards";

const MAX_ID_LENGTH = 120;

const VALID_ACTIVITY_KINDS: readonly EmployerCareerActivityKind[] = [
  "post_created",
  "post_paused",
  "post_resumed",
  "post_closed",
  "post_filled",
  "candidate_shortlisted",
  "candidate_rejected",
  "interview_scheduled",
  "interview_passed",
  "interview_failed",
  "offer_sent",
  "candidate_hired",
  "candidate_withdrawn",
] as const;

function isValidActivityKind(kind: string | undefined): kind is EmployerCareerActivityKind {
  return Boolean(kind && VALID_ACTIVITY_KINDS.includes(kind as EmployerCareerActivityKind));
}

export function normalizeCareerActivity(raw: unknown): EmployerCareerActivityEntry | null {
  if (!isRecord(raw)) return null;

  const id = cleanNotificationText(getString(raw, "id"), MAX_ID_LENGTH);
  const postId = cleanNotificationText(getString(raw, "postId"), MAX_ID_LENGTH);
  const kind = getString(raw, "kind");
  const title = cleanNotificationText(
    getString(raw, "title"),
    DEFAULT_NOTIFICATION_TEXT_LIMITS.title,
  );

  if (!id || !postId || !isValidActivityKind(kind) || !title) return null;

  return {
    id,
    postId,
    kind,
    createdAt: getSafeNotificationTimestamp(getNumber(raw, "createdAt")),
    title,
    body: cleanOptionalNotificationText(
      getString(raw, "body"),
      DEFAULT_NOTIFICATION_TEXT_LIMITS.body,
    ),
    route: cleanNotificationRoute(getString(raw, "route")),
  };
}
