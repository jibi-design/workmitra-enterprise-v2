// src/features/employer/hrManagement/pages/BulkTaskAssignPage.tsx

import { useState, useEffect, useMemo } from "react";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { taskAssignmentStorage } from "../storage/taskAssignment.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { TaskFormData } from "../types/taskAssignment.types";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { BulkTaskForm } from "../components/BulkTaskForm";
import { BulkTaskEmployeeList } from "../components/BulkTaskEmployeeList";

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function BulkTaskAssignPage() {
  /* ---- Employee list ---- */
  const [employees, setEmployees] = useState<HRCandidateRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  /* ---- Task form ---- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [location, setLocation] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  /* ---- UI state ---- */
  const [assignConfirm, setAssignConfirm] = useState<ConfirmData | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const refresh = () => {
      setEmployees(hrManagementStorage.getAll().filter((r) => r.status === "active"));
    };
    refresh();
    return hrManagementStorage.subscribe(refresh);
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase().trim();
    return employees.filter((r) =>
      r.employeeName.toLowerCase().includes(q) ||
      r.jobTitle.toLowerCase().includes(q) ||
      (r.department?.toLowerCase().includes(q) ?? false) ||
      (r.location?.toLowerCase().includes(q) ?? false)
    );
  }, [employees, searchQuery]);

  /* ---- Selection handlers ---- */
  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filteredEmployees.map((r) => r.id)));
  const deselectAll = () => setSelectedIds(new Set());

  /* ---- Checklist handlers ---- */
  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setChecklistItems((prev) => [...prev, trimmed]);
    setNewItem("");
  };

  const handleRemoveItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---- Validation ---- */
  const canAssign = title.trim().length > 0 && dueDate.length > 0 && selectedIds.size > 0;
  const allSelected = filteredEmployees.length > 0 && filteredEmployees.every((r) => selectedIds.has(r.id));

  /* ---- Assign ---- */
  const handleAssignRequest = () => {
    if (!canAssign) return;
    setAssignConfirm({
      title: "Assign Task to Multiple Employees",
      message: `This will assign the task "${title.trim()}" to ${selectedIds.size} employee${selectedIds.size > 1 ? "s" : ""}. Each employee will see this task individually.`,
      tone: "neutral",
      confirmLabel: `Assign to ${selectedIds.size}`,
      cancelLabel: "Cancel",
    });
  };

  const handleAssignConfirm = () => {
    const form: TaskFormData = { title, description, dueDate, location, checklistItems };

    let assignedCount = 0;
    for (const id of selectedIds) {
      taskAssignmentStorage.assignTask(id, form);
      assignedCount++;
    }

    setTitle("");
    setDescription("");
    setDueDate("");
    setLocation("");
    setChecklistItems([]);
    setNewItem("");
    setSelectedIds(new Set());
    setAssignConfirm(null);
    setSuccessMessage(`Task assigned to ${assignedCount} employee${assignedCount > 1 ? "s" : ""}!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div>
      

      {/* Header */}
      <div style={{
        padding: 16, background: "#fff", borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: "rgba(3, 105, 161, 0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#0369a1" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: "var(--wm-er-text)" }}>Bulk Task Assignment</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>
              Create one task and assign it to multiple employees at once
            </div>
          </div>
        </div>
        {successMessage && (
          <div style={{
            marginTop: 10, padding: "10px 14px", borderRadius: 8,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            fontSize: 13, fontWeight: 700, color: "#15803d",
          }}>{successMessage}</div>
        )}
      </div>

      {/* Task Form */}
      <BulkTaskForm
        title={title} onTitleChange={setTitle}
        description={description} onDescriptionChange={setDescription}
        dueDate={dueDate} onDueDateChange={setDueDate}
        location={location} onLocationChange={setLocation}
        checklistItems={checklistItems}
        newItem={newItem} onNewItemChange={setNewItem}
        onAddItem={handleAddItem} onRemoveItem={handleRemoveItem}
      />

      {/* Employee Selection */}
      <BulkTaskEmployeeList
        employees={employees}
        filteredEmployees={filteredEmployees}
        selectedIds={selectedIds}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggle={toggleEmployee}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        allSelected={allSelected}
      />

      {/* Assign Button */}
      <div style={{ marginTop: 12, marginBottom: 32 }}>
        <button className="wm-primarybtn" type="button" onClick={handleAssignRequest}
          disabled={!canAssign} style={{ width: "100%", fontSize: 14, padding: "12px 0", opacity: canAssign ? 1 : 0.5 }}>
          {selectedIds.size > 0
            ? `Assign Task to ${selectedIds.size} Employee${selectedIds.size > 1 ? "s" : ""}`
            : "Select employees to assign"
          }
        </button>
        {!canAssign && title.trim() && dueDate && selectedIds.size === 0 && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#d97706", textAlign: "center" }}>
            Please select at least one employee to assign this task.
          </div>
        )}
      </div>

      <ConfirmModal confirm={assignConfirm} onConfirm={handleAssignConfirm} onCancel={() => setAssignConfirm(null)} />
    </div>
  );
}
