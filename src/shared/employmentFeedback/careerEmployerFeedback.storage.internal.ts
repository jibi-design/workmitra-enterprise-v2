import type {
  CareerEmployerFeedbackSourceRecord,
  CareerEmployerFeedbackTask,
} from "./careerEmployerFeedback.storage.types";

export const STORAGE_KEY = "wm_career_employer_feedback_tasks_v1";
export const CHANGED_EVENT = "wm:career-employer-feedback-changed";
export const DAY_MS = 86_400_000;
export const HOUR_MS = 3_600_000;
export const FEEDBACK_WINDOW_DAYS = 7;
export const REMIND_LATER_HOURS = 24;
export const MAX_COMMENT_LENGTH = 160;
export const MAX_EDIT_COUNT = 3;

export function readTasks(): CareerEmployerFeedbackTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CareerEmployerFeedbackTask[]) : [];
  } catch {
    return [];
  }
}

export function writeTasks(tasks: CareerEmployerFeedbackTask[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function makeId(): string {
  return `cef_emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sortNewestFirst(tasks: CareerEmployerFeedbackTask[]): CareerEmployerFeedbackTask[] {
  return [...tasks].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function isExitedRecord(record: CareerEmployerFeedbackSourceRecord): boolean {
  return record.status === "exited" && typeof record.exitedAt === "number";
}

export function getFeedbackWindowExpiresAt(record: CareerEmployerFeedbackSourceRecord): number {
  return (record.exitedAt ?? 0) + FEEDBACK_WINDOW_DAYS * DAY_MS;
}

export function isWithinFeedbackWindow(
  record: CareerEmployerFeedbackSourceRecord,
  now = Date.now(),
): boolean {
  return isExitedRecord(record) && now <= getFeedbackWindowExpiresAt(record);
}

export function getDaysLeft(expiresAt: number, now = Date.now()): number {
  if (expiresAt <= now) return 0;
  return Math.max(1, Math.ceil((expiresAt - now) / DAY_MS));
}

export function sanitizeComment(value: string): string | undefined {
  const cleaned = value.trim().slice(0, MAX_COMMENT_LENGTH);
  return cleaned || undefined;
}

export function findTask(
  tasks: CareerEmployerFeedbackTask[],
  employmentId: string,
): CareerEmployerFeedbackTask | null {
  return tasks.find((task) => task.employmentId === employmentId) ?? null;
}

export function buildPendingTask(
  record: CareerEmployerFeedbackSourceRecord,
  now = Date.now(),
): CareerEmployerFeedbackTask {
  return {
    id: makeId(),
    employmentId: record.id,
    careerPostId: record.careerPostId,
    companyName: record.companyName,
    jobTitle: record.jobTitle,
    state: "pending",
    feedbackWindowExpiresAt: getFeedbackWindowExpiresAt(record),
    editCount: 0,
    editHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function ensurePendingTask(
  record: CareerEmployerFeedbackSourceRecord,
): CareerEmployerFeedbackTask | null {
  if (!isWithinFeedbackWindow(record)) return null;

  const tasks = readTasks();
  const existing = findTask(tasks, record.id);

  if (existing) {
    const nextTask: CareerEmployerFeedbackTask = {
      ...existing,
      editCount: existing.editCount ?? 0,
      editHistory: Array.isArray(existing.editHistory) ? existing.editHistory : [],
      careerPostId: record.careerPostId,
      companyName: record.companyName,
      jobTitle: record.jobTitle,
      feedbackWindowExpiresAt: getFeedbackWindowExpiresAt(record),
    };

    if (JSON.stringify(existing) !== JSON.stringify(nextTask)) {
      writeTasks(tasks.map((task) => (task.id === existing.id ? nextTask : task)));
    }

    return nextTask;
  }

  const task = buildPendingTask(record);
  writeTasks([task, ...tasks]);
  return task;
}

export function isHomeVisible(task: CareerEmployerFeedbackTask, now = Date.now()): boolean {
  if (task.state === "completed" || task.state === "dismissed") return false;
  if (task.feedbackWindowExpiresAt < now) return false;
  if (task.state === "remind_later")
    return typeof task.remindUntil === "number" && task.remindUntil <= now;
  return task.state === "pending";
}

export function canEditTask(task: CareerEmployerFeedbackTask, now = Date.now()): boolean {
  return (
    typeof task.editWindowExpiresAt === "number" &&
    task.editWindowExpiresAt >= now &&
    (task.editCount ?? 0) < MAX_EDIT_COUNT
  );
}
