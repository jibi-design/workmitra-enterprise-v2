// src/features/employee/employment/components/EmployeeTaskViewSection.tsx
//
// Employee side — Task View section (Root Map 8.1.4).
// Lists assigned tasks with Active/Completed tabs.
// Employee can view details + toggle checklist items.
// Cannot create, edit, or delete tasks.

import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { taskAssignmentStorage } from "../../../employer/hrManagement/storage/taskAssignment.storage";
import type { TaskEntry } from "../../../employer/hrManagement/types/taskAssignment.types";
import { EmployeeTaskCard } from "./EmployeeTaskCard";
import { EmployeeTaskDetailModal } from "./EmployeeTaskDetailModal";

// ─────────────────────────────────────────────────────────────────────────────
// Filter Tabs
// ─────────────────────────────────────────────────────────────────────────────

type TabKey = "active" | "completed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  hrCandidateId: string;
};

export function EmployeeTaskViewSection({ hrCandidateId }: Props) {
  const [tab, setTab] = useState<TabKey>("active");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const subscribe = useCallback(
    (cb: () => void) => taskAssignmentStorage.subscribe(cb),
    [],
  );

  const getSnapshot = useCallback(
    () => JSON.stringify(taskAssignmentStorage.getAllForCandidate(hrCandidateId)),
    [hrCandidateId],
  );

  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const allTasks: TaskEntry[] = useMemo(() => {
    try { return JSON.parse(raw); } catch { return []; }
  }, [raw]);

  const tasks = useMemo(() => {
    return tab === "active"
      ? allTasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate - b.dueDate)
      : allTasks.filter((t) => t.status === "completed").sort((a, b) => (b.completedAt ?? b.updatedAt) - (a.completedAt ?? a.updatedAt));
  }, [allTasks, tab]);

  const selectedTask = selectedTaskId
    ? allTasks.find((t) => t.id === selectedTaskId) ?? null
    : null;

  const activeCount = allTasks.filter((t) => t.status !== "completed").length;
  const completedCount = allTasks.filter((t) => t.status === "completed").length;

  // Don't render section if no tasks assigned at all
  if (allTasks.length === 0) return null;

  return (
    <div className="wm-ee-card">
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
          My Tasks
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>
          Tasks assigned to you by your employer
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 12,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
        }}
      >
        {TABS.map((t) => {
          const isActive = tab === t.key;
          const count = t.key === "active" ? activeCount : completedCount;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: "8px 0",
                fontSize: 12,
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "#fff" : "var(--wm-emp-muted, var(--wm-er-muted))",
                background: isActive ? "#b45309" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Task List */}
      {tasks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((task) => (
            <EmployeeTaskCard
              key={task.id}
              task={task}
              onOpen={setSelectedTaskId}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            color: "var(--wm-emp-muted, var(--wm-er-muted))",
            fontSize: 13,
          }}
        >
          {tab === "active"
            ? "No active tasks right now."
            : "No completed tasks yet."}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTask && (
        <EmployeeTaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}