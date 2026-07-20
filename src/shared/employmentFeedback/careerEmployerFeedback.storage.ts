// App: Job Mitra / WorkMitra_Enterprise_v2
// File: careerEmployerFeedback.storage.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\employmentFeedback\careerEmployerFeedback.storage.ts

export type CareerEmployerFeedbackState = "pending" | "remind_later" | "dismissed" | "completed";

export type CareerEmployerFeedbackTag =
  | "work_matched_job_offer"
  | "payment_clarity"
  | "clear_communication"
  | "respectful_workplace"
  | "work_timing_clarity"
  | "would_work_again"
  | "role_clarity"
  | "fair_treatment";

export type CareerEmployerFeedbackSourceRecord = {
  id: string;
  careerPostId: string;
  companyName: string;
  jobTitle: string;
  status: string;
  exitedAt?: number;
};

export type CareerEmployerFeedbackEditEvent = {
  editedAt: number;
};

export type CareerEmployerFeedbackTask = {
  id: string;
  employmentId: string;
  careerPostId: string;
  companyName: string;
  jobTitle: string;
  state: CareerEmployerFeedbackState;
  feedbackWindowExpiresAt: number;
  remindUntil?: number;
  dismissedAt?: number;
  completedAt?: number;
  editWindowExpiresAt?: number;
  editCount?: number;
  editHistory?: CareerEmployerFeedbackEditEvent[];
  selectedTags?: CareerEmployerFeedbackTag[];
  privateComment?: string;
  createdAt: number;
  updatedAt: number;
};

export type CareerEmployerFeedbackRecordSnapshot = {
  task: CareerEmployerFeedbackTask | null;
  canSubmit: boolean;
  canEdit: boolean;
  isExpired: boolean;
  daysLeft: number;
};

export type CareerEmployerFeedbackHomeSnapshot = {
  pendingCount: number;
  latestTask: CareerEmployerFeedbackTask | null;
};

export const CAREER_EMPLOYER_FEEDBACK_TAGS: readonly {
  value: CareerEmployerFeedbackTag;
  label: string;
}[] = [
  { value: "work_matched_job_offer", label: "Work matched job offer" },
  { value: "payment_clarity", label: "Payment / settlement clarity" },
  { value: "clear_communication", label: "Clear communication" },
  { value: "respectful_workplace", label: "Respectful workplace" },
  { value: "work_timing_clarity", label: "Work timing clarity" },
  { value: "would_work_again", label: "Would work again" },
] as const;

const STORAGE_KEY = "wm_career_employer_feedback_tasks_v1";
const CHANGED_EVENT = "wm:career-employer-feedback-changed";
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const FEEDBACK_WINDOW_DAYS = 7;
const REMIND_LATER_HOURS = 24;
const MAX_COMMENT_LENGTH = 160;
const MAX_EDIT_COUNT = 3;

function read(): CareerEmployerFeedbackTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CareerEmployerFeedbackTask[]) : [];
  } catch {
    return [];
  }
}

function write(tasks: CareerEmployerFeedbackTask[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function makeId(): string {
  return `cef_emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function sortNewestFirst(tasks: CareerEmployerFeedbackTask[]): CareerEmployerFeedbackTask[] {
  return [...tasks].sort((a, b) => b.updatedAt - a.updatedAt);
}

function isExitedRecord(record: CareerEmployerFeedbackSourceRecord): boolean {
  return record.status === "exited" && typeof record.exitedAt === "number";
}

function getFeedbackWindowExpiresAt(record: CareerEmployerFeedbackSourceRecord): number {
  return (record.exitedAt ?? 0) + FEEDBACK_WINDOW_DAYS * DAY_MS;
}

function isWithinFeedbackWindow(
  record: CareerEmployerFeedbackSourceRecord,
  now = Date.now(),
): boolean {
  return isExitedRecord(record) && now <= getFeedbackWindowExpiresAt(record);
}

function getDaysLeft(expiresAt: number, now = Date.now()): number {
  if (expiresAt <= now) return 0;
  return Math.max(1, Math.ceil((expiresAt - now) / DAY_MS));
}

function sanitizeComment(value: string): string | undefined {
  const cleaned = value.trim().slice(0, MAX_COMMENT_LENGTH);
  return cleaned || undefined;
}

function findTask(
  tasks: CareerEmployerFeedbackTask[],
  employmentId: string,
): CareerEmployerFeedbackTask | null {
  return tasks.find((task) => task.employmentId === employmentId) ?? null;
}

function buildPendingTask(
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

function ensurePendingTask(
  record: CareerEmployerFeedbackSourceRecord,
): CareerEmployerFeedbackTask | null {
  if (!isWithinFeedbackWindow(record)) return null;

  const tasks = read();
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
      write(tasks.map((task) => (task.id === existing.id ? nextTask : task)));
    }

    return nextTask;
  }

  const task = buildPendingTask(record);
  write([task, ...tasks]);
  return task;
}

function isHomeVisible(task: CareerEmployerFeedbackTask, now = Date.now()): boolean {
  if (task.state === "completed" || task.state === "dismissed") return false;
  if (task.feedbackWindowExpiresAt < now) return false;
  if (task.state === "remind_later")
    return typeof task.remindUntil === "number" && task.remindUntil <= now;
  return task.state === "pending";
}

function canEditTask(task: CareerEmployerFeedbackTask, now = Date.now()): boolean {
  return (
    typeof task.editWindowExpiresAt === "number" &&
    task.editWindowExpiresAt >= now &&
    (task.editCount ?? 0) < MAX_EDIT_COUNT
  );
}

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
    return sortNewestFirst(read());
  },

  getByEmploymentId(employmentId: string): CareerEmployerFeedbackTask | null {
    return findTask(read(), employmentId);
  },

  getRecordSnapshot(record: CareerEmployerFeedbackSourceRecord): string {
    const now = Date.now();
    const finalTask = findTask(read(), record.id);
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
    const tasks = sortNewestFirst(read()).filter(
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
    const tasks = read();
    const index = tasks.findIndex((task) => task.employmentId === employmentId);
    if (index === -1) return false;

    const now = Date.now();

    tasks[index] = {
      ...tasks[index],
      state: "remind_later",
      remindUntil: now + REMIND_LATER_HOURS * HOUR_MS,
      updatedAt: now,
    };

    write(tasks);
    return true;
  },

  dismissHome(employmentId: string): boolean {
    const tasks = read();
    const index = tasks.findIndex((task) => task.employmentId === employmentId);
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

  submit(
    record: CareerEmployerFeedbackSourceRecord,
    selectedTags: CareerEmployerFeedbackTag[],
    privateComment: string,
  ): boolean {
    if (!isWithinFeedbackWindow(record)) return false;
    if (selectedTags.length === 0) return false;

    const now = Date.now();
    const tasks = read();
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

    write(nextTasks);
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
