// App: Job Mitra / WorkMitra_Enterprise_v2
// File: careerEmployerFeedback.storage.ts — facade

export type {
  CareerEmployerFeedbackState,
  CareerEmployerFeedbackTag,
  CareerEmployerFeedbackSourceRecord,
  CareerEmployerFeedbackEditEvent,
  CareerEmployerFeedbackTask,
  CareerEmployerFeedbackRecordSnapshot,
  CareerEmployerFeedbackHomeSnapshot,
} from "./careerEmployerFeedback.storage.types";

export { CAREER_EMPLOYER_FEEDBACK_TAGS } from "./careerEmployerFeedback.storage.types";

import type {
  CareerEmployerFeedbackRecordSnapshot,
  CareerEmployerFeedbackSourceRecord,
  CareerEmployerFeedbackTag,
  CareerEmployerFeedbackTask,
} from "./careerEmployerFeedback.storage.types";
import { CAREER_EMPLOYER_FEEDBACK_TAGS } from "./careerEmployerFeedback.storage.types";
import {
  buildPendingTask,
  canEditTask,
  CHANGED_EVENT,
  ensurePendingTask,
  findTask,
  getDaysLeft,
  getFeedbackWindowExpiresAt,
  HOUR_MS,
  isHomeVisible,
  isWithinFeedbackWindow,
  MAX_COMMENT_LENGTH,
  MAX_EDIT_COUNT,
  readTasks,
  REMIND_LATER_HOURS,
  sanitizeComment,
  sortNewestFirst,
  STORAGE_KEY,
  writeTasks,
} from "./careerEmployerFeedback.storage.internal";

export function getCareerEmployerFeedbackTagLabel(value: CareerEmployerFeedbackTag): string {
  const legacyLabels: Record<string, string> = {
    role_clarity: "Role clarity",
    fair_treatment: "Fair treatment",
  };

  return (
    CAREER_EMPLOYER_FEEDBACK_TAGS.find((tag) => tag.value === value)?.label ??
    legacyLabels[value] ??
    value
  );
}

export const careerEmployerFeedbackStorage = {
  getAll(): CareerEmployerFeedbackTask[] {
    return sortNewestFirst(readTasks());
  },

  getByEmploymentId(employmentId: string): CareerEmployerFeedbackTask | null {
    return findTask(readTasks(), employmentId);
  },

  getRecordSnapshot(record: CareerEmployerFeedbackSourceRecord): string {
    const now = Date.now();
    const finalTask = findTask(readTasks(), record.id);
    const isExpired = !isWithinFeedbackWindow(record, now);

    const snapshot: CareerEmployerFeedbackRecordSnapshot = {
      task: finalTask,
      canSubmit:
        !!finalTask &&
        record.status === "exited" &&
        finalTask.feedbackWindowExpiresAt >= now &&
        (!finalTask.completedAt || canEditTask(finalTask, now)),
      canEdit: !!finalTask && canEditTask(finalTask, now),
      isExpired,
      daysLeft: finalTask ? getDaysLeft(finalTask.feedbackWindowExpiresAt, now) : 0,
    };

    return JSON.stringify(snapshot);
  },

  /** Read-only snapshot for useSyncExternalStore — never writes during render. */
  getHomeSnapshot(records: CareerEmployerFeedbackSourceRecord[]): string {
    const now = Date.now();
    const employmentIds = new Set(records.map((record) => record.id));
    const tasks = sortNewestFirst(readTasks()).filter(
      (task) => isHomeVisible(task, now) && employmentIds.has(task.employmentId),
    );

    return JSON.stringify({
      pendingCount: tasks.length,
      latestTask: tasks[0] ?? null,
    });
  },

  syncPendingTasksForRecords(records: CareerEmployerFeedbackSourceRecord[]): void {
    for (const record of records) {
      ensurePendingTask(record);
    }
  },

  remindLater(employmentId: string): boolean {
    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.employmentId === employmentId);
    if (index === -1) return false;

    const now = Date.now();

    tasks[index] = {
      ...tasks[index],
      state: "remind_later",
      remindUntil: now + REMIND_LATER_HOURS * HOUR_MS,
      updatedAt: now,
    };

    writeTasks(tasks);
    return true;
  },

  dismissHome(employmentId: string): boolean {
    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.employmentId === employmentId);
    if (index === -1) return false;

    const now = Date.now();

    tasks[index] = {
      ...tasks[index],
      state: "dismissed",
      dismissedAt: now,
      updatedAt: now,
    };

    writeTasks(tasks);
    return true;
  },

  submit(
    record: CareerEmployerFeedbackSourceRecord,
    selectedTags: CareerEmployerFeedbackTag[],
    privateComment: string,
  ): boolean {
    if (!isWithinFeedbackWindow(record)) return false;
    if (selectedTags.length === 0) return false;

    const now = Date.now();
    const tasks = readTasks();
    const existing = findTask(tasks, record.id) ?? buildPendingTask(record, now);

    if (existing.completedAt && !canEditTask(existing, now)) {
      return false;
    }

    const isEdit = Boolean(existing.completedAt);
    const firstCompletedAt = existing.completedAt ?? now;
    const firstEditWindowExpiresAt = existing.editWindowExpiresAt ?? now + HOUR_MS;
    const existingHistory = Array.isArray(existing.editHistory) ? existing.editHistory : [];

    const nextTask: CareerEmployerFeedbackTask = {
      ...existing,
      careerPostId: record.careerPostId,
      companyName: record.companyName,
      jobTitle: record.jobTitle,
      state: "completed",
      selectedTags,
      privateComment: sanitizeComment(privateComment),
      completedAt: firstCompletedAt,
      editWindowExpiresAt: firstEditWindowExpiresAt,
      feedbackWindowExpiresAt: getFeedbackWindowExpiresAt(record),
      editCount: isEdit ? (existing.editCount ?? 0) + 1 : (existing.editCount ?? 0),
      editHistory: isEdit ? [...existingHistory, { editedAt: now }] : existingHistory,
      updatedAt: now,
    };

    const nextTasks = tasks.some((task) => task.id === existing.id)
      ? tasks.map((task) => (task.id === existing.id ? nextTask : task))
      : [nextTask, ...tasks];

    writeTasks(nextTasks);
    return true;
  },

  subscribe(callback: () => void): () => void {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) callback();
    };

    window.addEventListener(CHANGED_EVENT, callback);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CHANGED_EVENT, callback);
      window.removeEventListener("storage", handleStorage);
    };
  },

  STORAGE_KEY,
  CHANGED_EVENT,
  MAX_COMMENT_LENGTH,
  MAX_EDIT_COUNT,
} as const;
