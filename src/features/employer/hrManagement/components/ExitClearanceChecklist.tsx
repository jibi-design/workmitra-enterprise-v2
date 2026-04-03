// src/features/employer/hrManagement/components/ExitClearanceChecklist.tsx
//
// Interactive clearance checklist for exit processing.

import { useState } from "react";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import type { ExitProcessingData } from "../types/exitProcessing.types";

type Props = {
  recordId: string;
  exitData: ExitProcessingData;
};

export function ExitClearanceChecklist({ recordId, exitData }: Props) {
  const [newItem, setNewItem] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const items = exitData.clearanceItems;
  const completed = items.filter((i) => i.completedAt).length;
  const total = items.length;
  const allDone = total > 0 && completed === total;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleToggle = (itemId: string) => {
    hrManagementStorage.toggleClearanceItem(recordId, itemId);
  };

  const handleAdd = () => {
    if (!newItem.trim()) return;
    hrManagementStorage.addClearanceItem(recordId, newItem);
    setNewItem("");
    setShowAdd(false);
  };

  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
          Exit Clearance
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: allDone ? "#16a34a" : "var(--wm-er-muted)" }}>
          {completed}/{total} done
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ background: "var(--wm-er-bg, #f1f5f9)", borderRadius: 4, height: 6, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: allDone ? "#16a34a" : "var(--wm-er-accent-hr)", borderRadius: 4, transition: "width 0.3s" }} />
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggle(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              background: item.completedAt ? "rgba(22,163,74,0.04)" : "var(--wm-er-bg, #f9fafb)",
              border: `1px solid ${item.completedAt ? "rgba(22,163,74,0.2)" : "var(--wm-er-border, #e5e7eb)"}`,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: `2px solid ${item.completedAt ? "#16a34a" : "#d1d5db"}`,
                background: item.completedAt ? "#16a34a" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {item.completedAt && (
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: item.completedAt ? "#16a34a" : "var(--wm-er-text)",
                textDecoration: item.completedAt ? "line-through" : "none",
                flex: 1,
              }}
            >
              {item.label}
            </span>
            {!item.isDefault && !item.completedAt && (
              <span style={{ fontSize: 9, fontWeight: 800, color: "var(--wm-er-muted)", padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.04)" }}>Custom</span>
            )}
          </div>
        ))}
      </div>

      {/* Add item */}
      {!showAdd ? (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: 800,
            color: "var(--wm-er-accent-hr)",
            background: "none",
            border: "1px dashed var(--wm-er-border, #e5e7eb)",
            borderRadius: 8,
            padding: "8px 14px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          + Add Clearance Item
        </button>
      ) : (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="New clearance item"
            maxLength={100}
            style={{
              flex: 1,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid var(--wm-er-border, #e5e7eb)",
              borderRadius: 8,
              outline: "none",
              color: "var(--wm-er-text)",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="wm-primarybtn" type="button" onClick={handleAdd} disabled={!newItem.trim()} style={{ fontSize: 11, padding: "8px 14px" }}>
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowAdd(false); setNewItem(""); }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--wm-er-border, #e5e7eb)", background: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", color: "var(--wm-er-muted)" }}
          >
            ×
          </button>
        </div>
      )}

      {/* All done message */}
      {allDone && (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", fontSize: 12, fontWeight: 800, color: "#16a34a", textAlign: "center" }}>
          ✓ All clearance items completed
        </div>
      )}
    </div>
  );
}
