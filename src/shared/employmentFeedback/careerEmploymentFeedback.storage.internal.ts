import type {
  CareerEmploymentFeedbackTag,
  CareerEmploymentFeedbackTask,
} from "./careerEmploymentFeedback.storage.types";
import { CAREER_EMPLOYMENT_FEEDBACK_TAGS } from "./careerEmploymentFeedback.storage.types";

export const STORAGE_KEY = "wm_career_employment_feedback_tasks_v1";
export const CHANGED_EVENT = "wm:career-employment-feedback-changed";
export const REMIND_LATER_DAYS = 14;
export const DAY_MS = 86_400_000;
export const HOUR_MS = 3_600_000;
export const MAX_PRIVATE_NOTE_LENGTH = 160;
export const MAX_SELECTED_FEEDBACK_TAGS = 6;
export const MAX_EDIT_COUNT = 3;

export function readTasks(): CareerEmploymentFeedbackTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CareerEmploymentFeedbackTask[]) : [];
  } catch {
    return [];
  }
}

export function writeTasks(tasks: CareerEmploymentFeedbackTask[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function makeId(): string {
  return `cef_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sortNewestFirst(
  tasks: CareerEmploymentFeedbackTask[],
): CareerEmploymentFeedbackTask[] {
  return [...tasks].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getAllTasks(): CareerEmploymentFeedbackTask[] {
  return sortNewestFirst(readTasks());
}

export function normalizeTask(task: CareerEmploymentFeedbackTask): CareerEmploymentFeedbackTask {
  return {
    ...task,
    editCount: task.editCount ?? 0,
    editHistory: Array.isArray(task.editHistory) ? task.editHistory : [],
  };
}

export function getTaskByStaffId(staffId: string): CareerEmploymentFeedbackTask | null {
  return getAllTasks().find((task) => task.staffId === staffId) ?? null;
}

export function getCompletedTaskByCareerPostId(
  careerPostId: string,
): CareerEmploymentFeedbackTask | null {
  if (!careerPostId) return null;

  return (
    getAllTasks().find(
      (task) => task.careerPostId === careerPostId && task.state === "completed",
    ) ?? null
  );
}

export function getCompletedTasksByEmployeeUniqueId(
  employeeUniqueId: string,
): CareerEmploymentFeedbackTask[] {
  if (!employeeUniqueId) return [];

  return getAllTasks().filter(
    (task) =>
      task.employeeUniqueId === employeeUniqueId &&
      task.state === "completed" &&
      Array.isArray(task.selectedTags) &&
      task.selectedTags.length > 0,
  );
}

export function isHomeVisible(task: CareerEmploymentFeedbackTask, now = Date.now()): boolean {
  if (task.state === "pending") return true;
  if (task.state === "remind_later")
    return typeof task.remindUntil === "number" && task.remindUntil > now;
  return false;
}

export function getVisibleHomeTasks(): CareerEmploymentFeedbackTask[] {
  const now = Date.now();
  return getAllTasks().filter((task) => isHomeVisible(task, now));
}

export function canEditTask(task: CareerEmploymentFeedbackTask, now = Date.now()): boolean {
  return (
    task.state === "completed" &&
    typeof task.editWindowExpiresAt === "number" &&
    task.editWindowExpiresAt > now &&
    (task.editCount ?? 0) < MAX_EDIT_COUNT
  );
}

export function sanitizePrivateNote(value: string): string | undefined {
  const cleaned = value.trim().slice(0, MAX_PRIVATE_NOTE_LENGTH);
  return cleaned || undefined;
}

const VALID_FEEDBACK_TAGS = new Set<CareerEmploymentFeedbackTag>(
  CAREER_EMPLOYMENT_FEEDBACK_TAGS.map((tag) => tag.value),
);

export function normalizeSelectedTags(
  tags: CareerEmploymentFeedbackTag[],
): CareerEmploymentFeedbackTag[] {
  return Array.from(new Set(tags))
    .filter((tag) => VALID_FEEDBACK_TAGS.has(tag))
    .slice(0, MAX_SELECTED_FEEDBACK_TAGS);
}
