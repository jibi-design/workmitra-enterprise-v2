// src/features/employee/employment/components/EmployeeTaskCard.tsx
//
// Employee side — individual task card (Root Map 8.1.4).
// Shows task title, status, due date, checklist count.
// Tap opens detail modal. Employee cannot edit task details.

import type { TaskEntry } from "../../../employer/hrManagement/types/taskAssignment.types";
import { TASK_STATUS_CONFIG } from "../../../employer/hrManagement/helpers/taskConstants";

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
  onOpen: (taskId: string) => void;
};

export function EmployeeTaskCard({ task, onOpen }: Props) {
  const cfg = TASK_STATUS_CONFIG[task.status];
  const overdue = isOverdue(task);
  const doneCount = task.checklist.filter((i) => i.completedAt).length;
  const totalCount = task.checklist.length;
  const isCompleted = task.status === "completed";

  return (
    <button
      type="button"
      onClick={() => onOpen(task.id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        borderRadius: 10,
        border: `1px solid ${overdue ? "#fecaca" : "var(--wm-emp-border, var(--wm-er-border, #e5e7eb))"}`,
        background: overdue ? "#fef2f210" : isCompleted ? "#fafafa" : "#fff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {/* Row 1: Title + Status Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: isCompleted
              ? "var(--wm-emp-muted, var(--wm-er-muted))"
              : "var(--wm-emp-text, var(--wm-er-text))",
            lineHeight: 1.4,
            flex: 1,
            textDecoration: isCompleted ? "line-through" : "none",
          }}
        >
          {task.title}
        </div>
        <span
          style={{
            padding: "2px 8px",
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

      {/* Row 2: Due date + Location + Checklist count */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          fontSize: 11,
          color: "var(--wm-emp-muted, var(--wm-er-muted))",
        }}
      >
        <span style={{ color: overdue ? "#dc2626" : undefined, fontWeight: overdue ? 700 : 400 }}>
          📅 {overdue ? "Overdue · " : "Due "}{formatDate(task.dueDate)}
        </span>
        {task.location && <span>📍 {task.location}</span>}
        {totalCount > 0 && (
          <span>
            ✅ {doneCount}/{totalCount} done
          </span>
        )}
      </div>
    </button>
  );
}