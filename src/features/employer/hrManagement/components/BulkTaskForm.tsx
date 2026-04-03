// src/features/employer/hrManagement/components/BulkTaskForm.tsx

import type { CSSProperties } from "react";

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const INPUT: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box" as const,
};

const LABEL: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type BulkTaskFormProps = {
  title: string;
  onTitleChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  dueDate: string;
  onDueDateChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  checklistItems: string[];
  newItem: string;
  onNewItemChange: (val: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function BulkTaskForm({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  dueDate,
  onDueDateChange,
  location,
  onLocationChange,
  checklistItems,
  newItem,
  onNewItemChange,
  onAddItem,
  onRemoveItem,
}: BulkTaskFormProps) {
  return (
    <div style={{
      marginTop: 10, padding: 16, background: "#fff", borderRadius: 12,
      border: "1px solid var(--wm-er-border, #e5e7eb)",
    }}>
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 12 }}>
        Task Details
      </div>

      <div>
        <label style={LABEL}>Task Title *</label>
        <input type="text" value={title} onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. Complete site inspection" style={INPUT} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={LABEL}>Description</label>
        <textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Detailed instructions for the task..." rows={3}
          style={{ ...INPUT, resize: "vertical" }} />
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={LABEL}>Due Date *</label>
          <input type="date" value={dueDate} onChange={(e) => onDueDateChange(e.target.value)} style={INPUT} />
        </div>
        <div>
          <label style={LABEL}>Location / Site</label>
          <input type="text" value={location} onChange={(e) => onLocationChange(e.target.value)}
            placeholder="e.g. Site B" style={INPUT} />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={LABEL}>Checklist Items</label>

        {checklistItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
            {checklistItems.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "7px 10px", background: "#f9fafb", borderRadius: 6,
                border: "1px solid var(--wm-er-border, #e5e7eb)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>☐</span>
                  <span style={{ fontSize: 13, color: "var(--wm-er-text)" }}>{item}</span>
                </div>
                <button type="button" onClick={() => onRemoveItem(i)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 14, color: "#dc2626", padding: "0 4px",
                }}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" value={newItem}
            onChange={(e) => onNewItemChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddItem(); } }}
            placeholder="Add checklist item..."
            style={{ ...INPUT, flex: 1 }} />
          <button type="button" onClick={onAddItem} disabled={!newItem.trim()}
            style={{
              padding: "0 14px", border: "1px solid var(--wm-er-border, #e5e7eb)",
              borderRadius: 8,
              background: newItem.trim() ? "var(--wm-er-accent-console, #0369a1)" : "#f3f4f6",
              color: newItem.trim() ? "#fff" : "var(--wm-er-muted)",
              cursor: newItem.trim() ? "pointer" : "default",
              fontSize: 13, fontWeight: 700,
            }}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
