// src/features/employer/hrManagement/components/TaskAssignModal.tsx
//
// Modal form to assign a new task to an employee.
// Root Map: "+ Assign Task" button → Title, description, due date, location, checklist items.

import { useState } from "react";
import type { TaskFormData } from "../types/taskAssignment.types";
import { CenterModal } from "../../../../shared/components/CenterModal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TaskAssignModalProps = {
  open: boolean;
  onClose: () => void;
  onAssign: (form: TaskFormData) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TaskAssignModal({ open, onClose, onAssign }: TaskAssignModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [location, setLocation] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setChecklistItems((prev) => [...prev, trimmed]);
    setNewItem("");
  };

  const handleRemoveItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim() || !dueDate) return;

    onAssign({
      title,
      description,
      dueDate,
      location,
      checklistItems,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setLocation("");
    setChecklistItems([]);
    setNewItem("");
  };

  const canSubmit = title.trim().length > 0 && dueDate.length > 0;

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Assign Task" maxWidth={480}>
      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
          Assign New Task
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2, marginBottom: 16 }}>
          Create a task with optional checklist items for the employee.
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>Task Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete site inspection"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed instructions..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Due Date + Location */}
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Location / Site</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Site B"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Checklist Items</label>

          {checklistItems.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              {checklistItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    background: "#f9fafb",
                    borderRadius: 6,
                    border: "1px solid var(--wm-er-border, #e5e7eb)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>☐</span>
                    <span style={{ fontSize: 13, color: "var(--wm-er-text)" }}>{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(i)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 14,
                      color: "#dc2626",
                      padding: "0 4px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              placeholder="Add checklist item..."
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              style={{
                padding: "0 14px",
                border: "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 8,
                background: newItem.trim() ? "var(--wm-er-accent-console, #0369a1)" : "#f3f4f6",
                color: newItem.trim() ? "#fff" : "var(--wm-er-muted)",
                cursor: newItem.trim() ? "pointer" : "default",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.5 }}
          >
            Assign Task
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
