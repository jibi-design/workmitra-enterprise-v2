// src/features/employer/hrManagement/components/TaskCard.tsx
//
// Single task card for Employer view.
// Shows: title, status badge, due date, location, checklist with toggles.
// Employer can toggle checklist items and delete task.

import { useState } from "react";
import type { TaskEntry } from "../types/taskAssignment.types";
import { taskAssignmentStorage } from "../storage/taskAssignment.storage";
import { TASK_STATUS_CONFIG } from "../helpers/taskConstants";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TaskCardProps = {
  task: TaskEntry;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TaskCard({ task }: TaskCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmData | null>(null);
  const [now] = useState(() => Date.now());

  const statusCfg = TASK_STATUS_CONFIG[task.status];
  const isCompleted = task.status === "completed";

  const dueDisplay = new Date(task.dueDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isOverdue = !isCompleted && task.dueDate < now;
  const completedCount = task.checklist.filter((i) => i.completedAt).length;
  const totalCount = task.checklist.length;

  const handleToggleItem = (itemId: string) => {
    taskAssignmentStorage.toggleChecklistItem(task.id, itemId, "employer");
  };

  const handleDeleteRequest = () => {
    setDeleteConfirm({
      title: "Delete Task",
      message: `This will permanently delete the task "${task.title}" and all its checklist items. This action cannot be undone.`,
      tone: "danger",
      confirmLabel: "Delete Task",
      cancelLabel: "Keep It",
    });
  };

  const handleDeleteConfirm = () => {
    taskAssignmentStorage.deleteTask(task.id);
    setDeleteConfirm(null);
  };

  const handleMarkComplete = () => {
    taskAssignmentStorage.updateStatus(task.id, "completed");
  };

  return (
    <div
      style={{
        padding: 14,
        background: isCompleted ? "#fafafa" : "#fff",
        borderRadius: 10,
        border: `1px solid ${isOverdue ? "#fca5a5" : "var(--wm-er-border, #e5e7eb)"}`,
        opacity: isCompleted ? 0.75 : 1,
      }}
    >
      {/* Header: Title + Status Badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 14,
              color: "var(--wm-er-text)",
              textDecoration: isCompleted ? "line-through" : "none",
            }}
          >
            {task.title}
          </div>
          {task.description && (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 3, lineHeight: 1.4 }}>
              {task.description}
            </div>
          )}
        </div>
        <span
          style={{
            padding: "3px 8px",
            borderRadius: 6,
            background: statusCfg.bg,
            color: statusCfg.color,
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0.3,
            whiteSpace: "nowrap",
          }}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Meta: Due Date + Location */}
      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
          <span style={{ color: "var(--wm-er-muted)" }}>Due:</span>
          <span
            style={{
              fontWeight: 700,
              color: isOverdue ? "#dc2626" : "var(--wm-er-text)",
            }}
          >
            {dueDisplay}
            {isOverdue && " (overdue)"}
          </span>
        </div>
        {task.location && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
            <span style={{ color: "var(--wm-er-muted)" }}>Location:</span>
            <span style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>{task.location}</span>
          </div>
        )}
      </div>

      {/* Checklist */}
      {task.checklist.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", marginBottom: 6 }}>
            CHECKLIST ({completedCount}/{totalCount})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {task.checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleItem(item.id)}
                disabled={isCompleted}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 10px",
                  background: item.completedAt ? "#f0fdf4" : "#f9fafb",
                  border: `1px solid ${item.completedAt ? "#bbf7d0" : "var(--wm-er-border, #e5e7eb)"}`,
                  borderRadius: 6,
                  cursor: isCompleted ? "default" : "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: 14 }}>
                  {item.completedAt ? "☑" : "☐"}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: item.completedAt ? "#15803d" : "var(--wm-er-text)",
                    textDecoration: item.completedAt ? "line-through" : "none",
                    fontWeight: item.completedAt ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {!isCompleted && (
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleDeleteRequest}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              color: "#dc2626",
              padding: 0,
            }}
          >
            Delete Task
          </button>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleMarkComplete}
            style={{ fontSize: 11, padding: "6px 14px" }}
          >
            Mark Completed
          </button>
        </div>
      )}

      {/* Completed timestamp */}
      {isCompleted && task.completedAt && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--wm-er-muted)" }}>
          Completed on{" "}
          {new Date(task.completedAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        confirm={deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}