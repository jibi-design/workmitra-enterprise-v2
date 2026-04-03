// src/features/employer/hrManagement/types/taskAssignment.types.ts
//
// Types for Task Assignment (Root Map Section 5.3.B).
// Employer assigns tasks to employees with checklist items.
// Status flow: Assigned → In Progress → Completed.
// Employee can only mark completion — cannot edit task details.

// ─────────────────────────────────────────────────────────────────────────────
// Task Status (lifecycle)
// ─────────────────────────────────────────────────────────────────────────────

export type TaskStatus = "assigned" | "in_progress" | "completed";

// ─────────────────────────────────────────────────────────────────────────────
// Checklist Item (sub-task within a task)
// ─────────────────────────────────────────────────────────────────────────────

export type TaskChecklistItem = {
  /** Unique item ID */
  id: string;
  /** Item label / description */
  label: string;
  /** Completed timestamp (undefined = not done) */
  completedAt?: number;
  /** Who marked it complete */
  completedBy?: "employee" | "employer";
};

// ─────────────────────────────────────────────────────────────────────────────
// Task Entry (main entity)
// ─────────────────────────────────────────────────────────────────────────────

export type TaskEntry = {
  /** Unique task ID */
  id: string;
  /** HR candidate record ID (links to HRCandidateRecord) */
  hrCandidateId: string;
  /** Task title */
  title: string;
  /** Task description (optional detailed instructions) */
  description: string;
  /** Due date (timestamp) */
  dueDate: number;
  /** Location / Site (optional) */
  location: string;
  /** Current status */
  status: TaskStatus;
  /** Checklist items (sub-tasks) */
  checklist: TaskChecklistItem[];
  /** Completion timestamp */
  completedAt?: number;
  /** Created timestamp */
  createdAt: number;
  /** Last updated timestamp */
  updatedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Create Task Form Data
// ─────────────────────────────────────────────────────────────────────────────

export type TaskFormData = {
  title: string;
  description: string;
  dueDate: string;
  location: string;
  checklistItems: string[];
};