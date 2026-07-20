// App: Job Mitra / WorkMitra_Enterprise_v2
// File: careerEmploymentFeedback.storage.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\employmentFeedback\careerEmploymentFeedback.storage.ts

export type CareerEmploymentFeedbackState = "pending" | "remind_later" | "dismissed" | "completed";

export type CareerEmploymentFeedbackTag =
  | "reliable"
  | "punctual"
  | "good_communication"
  | "completed_assigned_work"
  | "followed_workplace_instructions"
  | "eligible_for_rehire";

export type CareerEmploymentFeedbackEditEvent = {
  editedAt: number;
};

export type CareerEmploymentFeedbackTask = {
  id: string;
  staffId: string;
  careerPostId?: string;
  employeeUniqueId: string;
  employeeName: string;
  jobTitle: string;
  companyName: string;
  state: CareerEmploymentFeedbackState;
  createdAt: number;
  updatedAt: number;
  remindUntil?: number;
  dismissedAt?: number;
  completedAt?: number;
  editWindowExpiresAt?: number;
  editCount?: number;
  editHistory?: CareerEmploymentFeedbackEditEvent[];
  selectedTags?: CareerEmploymentFeedbackTag[];
  privateNote?: string;
};

export type CareerEmploymentFeedbackHomeSnapshot = {
  pendingCount: number;
  latestTask: CareerEmploymentFeedbackTask | null;
};

export type CareerEmploymentFeedbackStaffSnapshot = {
  task: CareerEmploymentFeedbackTask | null;
  canEdit: boolean;
};

export type CareerEmploymentFeedbackCompletedSnapshot = {
  task: CareerEmploymentFeedbackTask | null;
};

export type CareerEmploymentFeedbackApprovedSummarySnapshot = {
  tasks: CareerEmploymentFeedbackTask[];
};

export const CAREER_EMPLOYMENT_FEEDBACK_TAGS: readonly {
  value: CareerEmploymentFeedbackTag;
  label: string;
}[] = [
  { value: "reliable", label: "Reliable" },
  { value: "punctual", label: "Punctual" },
  { value: "good_communication", label: "Good communication" },
  { value: "completed_assigned_work", label: "Completed assigned work" },
  { value: "followed_workplace_instructions", label: "Followed workplace instructions" },
  { value: "eligible_for_rehire", label: "Eligible for rehire" },
] as const;

const STORAGE_KEY = "wm_career_employment_feedback_tasks_v1";
const CHANGED_EVENT = "wm:career-employment-feedback-changed";
const REMIND_LATER_DAYS = 14;
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const MAX_PRIVATE_NOTE_LENGTH = 160;
const MAX_SELECTED_FEEDBACK_TAGS = 6;
const MAX_EDIT_COUNT = 3;

function read(): CareerEmploymentFeedbackTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CareerEmploymentFeedbackTask[]) : [];
  } catch {
    return [];
  }
}

function write(tasks: CareerEmploymentFeedbackTask[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function makeId(): string {
  return `cef_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function sortNewestFirst(tasks: CareerEmploymentFeedbackTask[]): CareerEmploymentFeedbackTask[] {
  return [...tasks].sort((a, b) => b.updatedAt - a.updatedAt);
}

function getAllTasks(): CareerEmploymentFeedbackTask[] {
  return sortNewestFirst(read());
}

function normalizeTask(task: CareerEmploymentFeedbackTask): CareerEmploymentFeedbackTask {
  return {
    ...task,
    editCount: task.editCount ?? 0,
    editHistory: Array.isArray(task.editHistory) ? task.editHistory : [],
  };
}

function getTaskByStaffId(staffId: string): CareerEmploymentFeedbackTask | null {
  return getAllTasks().find((task) => task.staffId === staffId) ?? null;
}

function getCompletedTaskByCareerPostId(careerPostId: string): CareerEmploymentFeedbackTask | null {
  if (!careerPostId) return null;

  return (
    getAllTasks().find(
      (task) => task.careerPostId === careerPostId && task.state === "completed",
    ) ?? null
  );
}

function getCompletedTasksByEmployeeUniqueId(
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

function isHomeVisible(task: CareerEmploymentFeedbackTask, now = Date.now()): boolean {
  if (task.state === "pending") return true;
  if (task.state === "remind_later")
    return typeof task.remindUntil === "number" && task.remindUntil > now;
  return false;
}

function getVisibleHomeTasks(): CareerEmploymentFeedbackTask[] {
  const now = Date.now();
  return getAllTasks().filter((task) => isHomeVisible(task, now));
}

function canEditTask(task: CareerEmploymentFeedbackTask, now = Date.now()): boolean {
  return (
    task.state === "completed" &&
    typeof task.editWindowExpiresAt === "number" &&
    task.editWindowExpiresAt > now &&
    (task.editCount ?? 0) < MAX_EDIT_COUNT
  );
}

function sanitizePrivateNote(value: string): string | undefined {
  const cleaned = value.trim().slice(0, MAX_PRIVATE_NOTE_LENGTH);
  return cleaned || undefined;
}

const VALID_FEEDBACK_TAGS = new Set<CareerEmploymentFeedbackTag>(
  CAREER_EMPLOYMENT_FEEDBACK_TAGS.map((tag) => tag.value),
);

function normalizeSelectedTags(tags: CareerEmploymentFeedbackTag[]): CareerEmploymentFeedbackTag[] {
  return Array.from(new Set(tags))
    .filter((tag) => VALID_FEEDBACK_TAGS.has(tag))
    .slice(0, MAX_SELECTED_FEEDBACK_TAGS);
}

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
    const existing = read();
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

    write([task, ...existing]);
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
    const tasks = read();
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return false;

    const now = Date.now();

    tasks[index] = {
      ...tasks[index],
      state: "remind_later",
      remindUntil: now + REMIND_LATER_DAYS * DAY_MS,
      updatedAt: now,
    };

    write(tasks);
    return true;
  },

  dismiss(taskId: string): boolean {
    const tasks = read();
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return false;

    const now = Date.now();

    tasks[index] = {
      ...tasks[index],
      state: "dismissed",
      dismissedAt: now,
      updatedAt: now,
    };

    write(tasks);
    return true;
  },

  complete(
    taskId: string,
    selectedTags: CareerEmploymentFeedbackTag[],
    privateNote: string,
  ): boolean {
    const safeTags = normalizeSelectedTags(selectedTags);

    if (safeTags.length === 0) return false;

    const tasks = read();
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

    write(tasks);
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
