// src/features/employer/hrManagement/storage/taskAssignment.storage.ts
//
// CRUD service for Task Assignment (Root Map Section 5.3.B).
// Employer assigns tasks — employee marks completion.
// Status flow: Assigned → In Progress → Completed.

import type {
  TaskEntry,
  TaskFormData,
  TaskChecklistItem,
  TaskStatus,
} from "../types/taskAssignment.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_task_assignment_v1";
const CHANGED_EVENT = "wm:task-assignment-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): TaskEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TaskEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: TaskEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "task_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function genItemId(): string {
  return "tci_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const taskAssignmentStorage = {

  // ── Read ──

  /** Get all tasks for a specific HR candidate (sorted: active first, then by date) */
  getAllForCandidate(hrCandidateId: string): TaskEntry[] {
    return read()
      .filter((t) => t.hrCandidateId === hrCandidateId)
      .sort((a, b) => {
        // Active tasks first (assigned, in_progress), then completed
        const aActive = a.status !== "completed" ? 0 : 1;
        const bActive = b.status !== "completed" ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        // Within same group, newest first
        return b.createdAt - a.createdAt;
      });
  },

  /** Get active tasks only (assigned + in_progress) */
  getActiveTasks(hrCandidateId: string): TaskEntry[] {
    return read()
      .filter((t) => t.hrCandidateId === hrCandidateId && t.status !== "completed")
      .sort((a, b) => a.dueDate - b.dueDate);
  },

  /** Get completed tasks only */
  getCompletedTasks(hrCandidateId: string): TaskEntry[] {
    return read()
      .filter((t) => t.hrCandidateId === hrCandidateId && t.status === "completed")
      .sort((a, b) => (b.completedAt ?? b.updatedAt) - (a.completedAt ?? a.updatedAt));
  },

  /** Get a single task by ID */
  getById(id: string): TaskEntry | null {
    return read().find((t) => t.id === id) ?? null;
  },

  /** Count active tasks for a candidate */
  countActive(hrCandidateId: string): number {
    return read().filter(
      (t) => t.hrCandidateId === hrCandidateId && t.status !== "completed",
    ).length;
  },

  // ── Create ──

  /** Assign a new task to an employee */
  assignTask(hrCandidateId: string, form: TaskFormData): string {
    const now = Date.now();

    const checklist: TaskChecklistItem[] = form.checklistItems
      .map((label) => label.trim())
      .filter((label) => label.length > 0)
      .map((label) => ({
        id: genItemId(),
        label,
      }));

    const task: TaskEntry = {
      id: genId(),
      hrCandidateId,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: new Date(form.dueDate).getTime(),
      location: form.location.trim(),
      status: "assigned",
      checklist,
      createdAt: now,
      updatedAt: now,
    };

    const all = read();
    write([task, ...all]);
    return task.id;
  },

  // ── Update ──

  /** Update task status (employer or system) */
  updateStatus(id: string, newStatus: TaskStatus): boolean {
    const all = read();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    const now = Date.now();
    all[idx] = {
      ...all[idx],
      status: newStatus,
      completedAt: newStatus === "completed" ? now : undefined,
      updatedAt: now,
    };

    write(all);
    return true;
  },

  /** Toggle a checklist item completion */
  toggleChecklistItem(
    taskId: string,
    itemId: string,
    completedBy: "employee" | "employer",
  ): boolean {
    const all = read();
    const idx = all.findIndex((t) => t.id === taskId);
    if (idx === -1) return false;

    const task = all[idx];
    const checklist = task.checklist.map((item) => {
      if (item.id !== itemId) return item;
      if (item.completedAt) {
        // Uncheck
        return { ...item, completedAt: undefined, completedBy: undefined };
      }
      // Check
      return { ...item, completedAt: Date.now(), completedBy };
    });

    const allDone = checklist.length > 0 && checklist.every((i) => i.completedAt);
    const now = Date.now();

    all[idx] = {
      ...task,
      checklist,
      // Auto-complete task when all checklist items done
      status: allDone ? "completed" : task.status === "assigned" ? "in_progress" : task.status,
      completedAt: allDone ? now : undefined,
      updatedAt: now,
    };

    write(all);
    return true;
  },

  /** Add a new checklist item to an existing task */
  addChecklistItem(taskId: string, label: string): boolean {
    const all = read();
    const idx = all.findIndex((t) => t.id === taskId);
    if (idx === -1) return false;

    const task = all[idx];
    if (task.status === "completed") return false;

    const newItem: TaskChecklistItem = {
      id: genItemId(),
      label: label.trim(),
    };

    all[idx] = {
      ...task,
      checklist: [...task.checklist, newItem],
      updatedAt: Date.now(),
    };

    write(all);
    return true;
  },

  /** Delete a task (with confirmation — handled by UI) */
  deleteTask(id: string): boolean {
    const all = read();
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    write(filtered);
    return true;
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
};