// src/features/employer/hrManagement/components/TaskAssignmentSection.tsx
//
// Task Assignment — Parent Container (Root Map Section 5.3.B).
// Assembles: TaskAssignModal + TaskCard list.
// Shows active tasks first, then completed history.
// "+ Assign Task" button to create new tasks.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { TaskFormData } from "../types/taskAssignment.types";
import { taskAssignmentStorage } from "../storage/taskAssignment.storage";
import { useTasks } from "../helpers/taskHooks";
import { TaskAssignModal } from "./TaskAssignModal";
import { TaskCard } from "./TaskCard";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  record: HRCandidateRecord;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TaskAssignmentSection({ record }: Props) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const allTasks = useTasks(record.id);
  const activeTasks = allTasks.filter((t) => t.status !== "completed");
  const completedTasks = allTasks.filter((t) => t.status === "completed");
  const displayCompleted = showCompleted ? completedTasks : completedTasks.slice(0, 3);

  const handleAssign = (form: TaskFormData) => {
    taskAssignmentStorage.assignTask(record.id, form);
    setShowAssignModal(false);
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      {/* Section Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
            Task Assignment
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            Assign and track daily tasks
          </div>
        </div>
        <button
          className="wm-primarybtn"
          type="button"
          onClick={() => setShowAssignModal(true)}
          style={{ fontSize: 12, padding: "7px 14px" }}
        >
          + Assign Task
        </button>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 12, color: "var(--wm-er-text)", marginBottom: 8 }}>
            Active Tasks ({activeTasks.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div style={{ marginTop: activeTasks.length > 0 ? 18 : 0 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 8 }}>
            Completed ({completedTasks.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayCompleted.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          {completedTasks.length > 3 && !showCompleted && (
            <button
              type="button"
              onClick={() => setShowCompleted(true)}
              style={{
                marginTop: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 800,
                color: "var(--wm-er-accent-console)",
              }}
            >
              View all {completedTasks.length} completed →
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {allTasks.length === 0 && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
          No tasks assigned yet. Use the button above to assign a task.
        </div>
      )}

      {/* Assign Task Modal */}
      <TaskAssignModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssign}
      />
    </div>
  );
}
