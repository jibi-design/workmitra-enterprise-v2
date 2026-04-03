// src/features/employer/hrManagement/helpers/taskHooks.ts
//
// React hooks for Task Assignment (Root Map Section 5.3.B).
// Subscribes to task storage changes — auto-refreshes UI.

import { useState, useEffect } from "react";
import type { TaskEntry } from "../types/taskAssignment.types";
import { taskAssignmentStorage } from "../storage/taskAssignment.storage";

// ─────────────────────────────────────────────────────────────────────────────
// useTasks — get all tasks for a candidate (auto-refresh)
// ─────────────────────────────────────────────────────────────────────────────

export function useTasks(hrCandidateId: string): TaskEntry[] {
  const [tasks, setTasks] = useState<TaskEntry[]>(
    () => taskAssignmentStorage.getAllForCandidate(hrCandidateId),
  );

  useEffect(() => {
    const refresh = () => setTasks(taskAssignmentStorage.getAllForCandidate(hrCandidateId));
    refresh();
    return taskAssignmentStorage.subscribe(refresh);
  }, [hrCandidateId]);

  return tasks;
}