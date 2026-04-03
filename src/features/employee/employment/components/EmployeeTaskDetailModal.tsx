// src/features/employee/employment/components/EmployeeTaskDetailModal.tsx
//
// Employee side — task detail modal (Root Map 8.1.4).
// Shows full task info + interactive checklist.
// Employee can toggle checklist items — cannot edit task details.

import { CenterModal } from "../../../../shared/components/CenterModal";
import type { TaskEntry } from "../../../employer/hrManagement/types/taskAssignment.types";
import { TASK_STATUS_CONFIG } from "../../../employer/hrManagement/helpers/taskConstants";
import { taskAssignmentStorage } from "../../../employer/hrManagement/storage/taskAssignment.storage";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(task: TaskEntry): boolean {
  if (task.status === "completed") return false;
  return task.dueDate < Date.now();
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  task: TaskEntry;
  open: boolean;
  onClose: () => void;
};

export function EmployeeTaskDetailModal({ task, open, onClose }: Props) {
  const cfg = TASK_STATUS_CONFIG[task.status];
  const overdue = isOverdue(task);
  const doneCount = task.checklist.filter((i) => i.completedAt).length;
  const totalCount = task.checklist.length;
  const isCompleted = task.status === "completed";

  const handleToggle = (itemId: string) => {
    if (isCompleted) return;
    taskAssignmentStorage.toggleChecklistItem(task.id, itemId, "employee");
  };

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Task Details" maxWidth={480}>
      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-emp-text, var(--wm-er-text))", lineHeight: 1.4, flex: 1 }}>
            {task.title}
          </div>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 800,
              background: cfg.bg,
              color: cfg.color,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Meta Row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12,
            color: "var(--wm-emp-muted, var(--wm-er-muted))",
            marginBottom: 14,
          }}
        >
          <span style={{ color: overdue ? "#dc2626" : undefined, fontWeight: overdue ? 700 : 400 }}>
            📅 {overdue ? "Overdue · " : "Due "}{formatDate(task.dueDate)}
          </span>
          {task.location && <span>📍 {task.location}</span>}
          {totalCount > 0 && <span>✅ {doneCount}/{totalCount} done</span>}
        </div>

        {/* Overdue Warning */}
        {overdue && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              fontSize: 12,
              fontWeight: 700,
              color: "#dc2626",
              marginBottom: 14,
            }}
          >
            ⚠️ This task is overdue. Please complete it as soon as possible.
          </div>
        )}

        {/* Description */}
        {task.description && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Instructions
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--wm-emp-text, var(--wm-er-text))",
                lineHeight: 1.6,
                padding: "10px 12px",
                borderRadius: 8,
                background: "#f9fafb",
                border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
              }}
            >
              {task.description}
            </div>
          </div>
        )}

        {/* Checklist */}
        {totalCount > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Checklist ({doneCount}/{totalCount})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {task.checklist.map((item) => {
                const checked = !!item.completedAt;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    disabled={isCompleted}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${checked ? "#bbf7d0" : "var(--wm-emp-border, var(--wm-er-border, #e5e7eb))"}`,
                      background: checked ? "#f0fdf4" : "#fff",
                      cursor: isCompleted ? "default" : "pointer",
                      width: "100%",
                      textAlign: "left",
                      opacity: isCompleted && !checked ? 0.5 : 1,
                    }}
                  >
                    {/* Checkbox Visual */}
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: checked ? "none" : "2px solid #d1d5db",
                        background: checked ? "#15803d" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {checked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>

                    {/* Label */}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: checked
                          ? "var(--wm-emp-muted, var(--wm-er-muted))"
                          : "var(--wm-emp-text, var(--wm-er-text))",
                        textDecoration: checked ? "line-through" : "none",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Info */}
        {isCompleted && task.completedAt && (
          <div
            style={{
              marginTop: 14,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              fontSize: 12,
              fontWeight: 700,
              color: "#15803d",
            }}
          >
            ✅ Completed on {formatDate(task.completedAt)}
          </div>
        )}

        {/* Close Button */}
        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </CenterModal>
  );
}