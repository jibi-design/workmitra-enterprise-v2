// src/features/employer/hrManagement/helpers/taskConstants.ts
//
// Shared constants for Task Assignment (Root Map Section 5.3.B).
// Status visual config used across all task components.

import type { TaskStatus } from "../types/taskAssignment.types";

// ─────────────────────────────────────────────────────────────────────────────
// Status Visual Config
// ─────────────────────────────────────────────────────────────────────────────

export type TaskStatusConfig = {
  label: string;
  color: string;
  bg: string;
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusConfig> = {
  assigned:    { label: "Assigned",    color: "#0369a1", bg: "#eff6ff" },
  in_progress: { label: "In Progress", color: "#d97706", bg: "#fffbeb" },
  completed:   { label: "Completed",   color: "#15803d", bg: "#f0fdf4" },
};

export const TASK_STATUS_LIST: readonly TaskStatus[] = [
  "assigned", "in_progress", "completed",
] as const;
