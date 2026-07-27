// App: Job Mitra / WorkMitra_Enterprise_v2
// File: careerEmploymentFeedback.storage.ts — facade

export type {
  CareerEmploymentFeedbackState,
  CareerEmploymentFeedbackTag,
  CareerEmploymentFeedbackEditEvent,
  CareerEmploymentFeedbackTask,
  CareerEmploymentFeedbackHomeSnapshot,
  CareerEmploymentFeedbackStaffSnapshot,
  CareerEmploymentFeedbackCompletedSnapshot,
  CareerEmploymentFeedbackApprovedSummarySnapshot,
} from "./careerEmploymentFeedback.storage.types";

export { CAREER_EMPLOYMENT_FEEDBACK_TAGS } from "./careerEmploymentFeedback.storage.types";

import type {
  CareerEmploymentFeedbackApprovedSummarySnapshot,
  CareerEmploymentFeedbackCompletedSnapshot,
  CareerEmploymentFeedbackHomeSnapshot,
  CareerEmploymentFeedbackStaffSnapshot,
  CareerEmploymentFeedbackTag,
  CareerEmploymentFeedbackTask,
} from "./careerEmploymentFeedback.storage.types";
import { CAREER_EMPLOYMENT_FEEDBACK_TAGS } from "./careerEmploymentFeedback.storage.types";
import {
  canEditTask,
  CHANGED_EVENT,
  DAY_MS,
  getAllTasks,
  getCompletedTaskByCareerPostId,
  getCompletedTasksByEmployeeUniqueId,
  getTaskByStaffId,
  getVisibleHomeTasks,
  HOUR_MS,
  makeId,
  MAX_EDIT_COUNT,
  MAX_PRIVATE_NOTE_LENGTH,
  normalizeSelectedTags,
  normalizeTask,
  readTasks,
  REMIND_LATER_DAYS,
  sanitizePrivateNote,
  STORAGE_KEY,
  writeTasks,
} from "./careerEmploymentFeedback.storage.internal";

export function getCareerEmploymentFeedbackTagLabel(value: CareerEmploymentFeedbackTag): string {
  return CAREER_EMPLOYMENT_FEEDBACK_TAGS.find((tag) => tag.value === value)?.label ?? value;
}

export const careerEmploymentFeedbackStorage = {
  createPending(data: {
    staffId: string;
    careerPostId?: string;
    employeeUniqueId: string;
    employeeName: string;
    jobTitle: string;
    companyName: string;
  }): string {
    const existing = readTasks();
    const duplicate = existing.find(
      (task) => task.staffId === data.staffId && task.careerPostId === data.careerPostId,
    );

    if (duplicate) return duplicate.id;

    const now = Date.now();

    const task: CareerEmploymentFeedbackTask = {
      id: makeId(),
      staffId: data.staffId,
      careerPostId: data.careerPostId,
      employeeUniqueId: data.employeeUniqueId,
      employeeName: data.employeeName,
      jobTitle: data.jobTitle,
      companyName: data.companyName,
      state: "pending",
      editCount: 0,
      editHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    writeTasks([task, ...existing]);
    return task.id;
  },

  getAll(): CareerEmploymentFeedbackTask[] {
    return getAllTasks();
  },

  getByStaffId(staffId: string): CareerEmploymentFeedbackTask | null {
    return getTaskByStaffId(staffId);
  },

  getCompletedByCareerPostId(careerPostId: string): CareerEmploymentFeedbackTask | null {
    return getCompletedTaskByCareerPostId(careerPostId);
  },

  getCompletedByEmployeeUniqueId(employeeUniqueId: string): CareerEmploymentFeedbackTask[] {
    return getCompletedTasksByEmployeeUniqueId(employeeUniqueId);
  },

  getHomeTasks(): CareerEmploymentFeedbackTask[] {
    return getVisibleHomeTasks();
  },

  getHomeSnapshot(): string {
    const homeTasks = getVisibleHomeTasks();

    return JSON.stringify({
      pendingCount: homeTasks.length,
      latestTask: homeTasks[0] ?? null,
    } satisfies CareerEmploymentFeedbackHomeSnapshot);
  },

  getStaffSnapshot(staffId: string): string {
    const task = getTaskByStaffId(staffId);
    const normalizedTask = task ? normalizeTask(task) : null;

    return JSON.stringify({
      task: normalizedTask,
      canEdit: normalizedTask ? canEditTask(normalizedTask) : false,
    } satisfies CareerEmploymentFeedbackStaffSnapshot);
  },

  getCompletedCareerPostSnapshot(careerPostId: string): string {
    return JSON.stringify({
      task: getCompletedTaskByCareerPostId(careerPostId),
    } satisfies CareerEmploymentFeedbackCompletedSnapshot);
  },

  getApprovedSummarySnapshot(employeeUniqueId: string): string {
    return JSON.stringify({
      tasks: getCompletedTasksByEmployeeUniqueId(employeeUniqueId),
    } satisfies CareerEmploymentFeedbackApprovedSummarySnapshot);
  },

  remindLater(taskId: string): boolean {
    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return false;

    const now = Date.now();

    tasks[index] = {
      ...tasks[index],
      state: "remind_later",
      remindUntil: now + REMIND_LATER_DAYS * DAY_MS,
      updatedAt: now,
    };

    writeTasks(tasks);
    return true;
  },

  dismiss(taskId: string): boolean {
    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.id === taskId);
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

  complete(
    taskId: string,
    selectedTags: CareerEmploymentFeedbackTag[],
    privateNote: string,
  ): boolean {
    const safeTags = normalizeSelectedTags(selectedTags);

    if (safeTags.length === 0) return false;

    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return false;

    const now = Date.now();
    const current = normalizeTask(tasks[index]);

    if (current.state === "completed" && !canEditTask(current, now)) {
      return false;
    }

    const isEdit = current.state === "completed" && typeof current.completedAt === "number";
    const nextEditHistory = isEdit
      ? [...(current.editHistory ?? []), { editedAt: now }]
      : (current.editHistory ?? []);

    tasks[index] = {
      ...current,
      state: "completed",
      selectedTags: safeTags,
      privateNote: sanitizePrivateNote(privateNote),
      completedAt: current.completedAt ?? now,
      editWindowExpiresAt: current.editWindowExpiresAt ?? now + HOUR_MS,
      editCount: isEdit ? (current.editCount ?? 0) + 1 : (current.editCount ?? 0),
      editHistory: nextEditHistory,
      updatedAt: now,
    };

    writeTasks(tasks);
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
  MAX_PRIVATE_NOTE_LENGTH,
  MAX_EDIT_COUNT,
} as const;
