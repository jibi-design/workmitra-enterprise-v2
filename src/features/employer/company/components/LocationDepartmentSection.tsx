// src/features/employer/company/components/LocationDepartmentSection.tsx
// Work Locations management. Part of Company Settings.
// Session 7: universal placeholder, 1.5px borders, focus = purple.
// Fix: emoji → SVG icon, input readability (fontSize 15, fontWeight 600).

import { useState, useCallback, useSyncExternalStore, useMemo } from "react";
import { companyConfigStorage } from "../storage/companyConfig.storage";
import { hrManagementStorage } from "../../hrManagement/storage/hrManagement.storage";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { IconLocation } from "../helpers/settingsIcons";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const BORDER_COLOR = "#d1d5db";
const FOCUS_COLOR = "var(--wm-er-accent-hr)";

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "9px 12px",
  fontSize: 15,
  fontWeight: 600,
  color: "#1e293b",
  border: `1.5px solid ${BORDER_COLOR}`,
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

/* ------------------------------------------------ */
/* Focus helpers                                    */
/* ------------------------------------------------ */
function handleInputFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = FOCUS_COLOR;
}

function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = BORDER_COLOR;
}

/* ------------------------------------------------ */
/* Editable List Sub-component                      */
/* ------------------------------------------------ */
type ListProps = {
  title: string;
  subtitle: string;
  items: string[];
  onAdd: (name: string) => boolean;
  onRemove: (name: string) => boolean;
  onRename: (oldName: string, newName: string) => boolean;
  placeholder: string;
};

function EditableList({ title, subtitle, items, onAdd, onRemove, onRename, placeholder }: ListProps) {
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirm, setConfirm] = useState<ConfirmData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const success = onAdd(trimmed);
    if (success) {
      setNewItem("");
      setError("");
    } else {
      setError("Already exists or invalid name.");
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleRename = (oldName: string) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingItem(null);
      return;
    }
    const success = onRename(oldName, trimmed);
    if (success) {
      setEditingItem(null);
      setError("");
    } else {
      setError("Name already exists.");
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleDeleteRequest = (name: string) => {
    setDeleteTarget(name);
    setConfirm({
      title: `Remove ${title.slice(0, -1)}`,
      message: `Remove "${name}" from the list? This won't affect employees already assigned to it.`,
      tone: "danger",
      confirmLabel: "Remove",
      cancelLabel: "Keep",
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onRemove(deleteTarget);
      setDeleteTarget(null);
      setConfirm(null);
    }
  };

  return (
    <div style={{
      padding: "14px 16px",
      borderRadius: 12,
      border: `1px solid ${BORDER_COLOR}`,
      background: "#fff",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "rgba(3, 105, 161, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0369a1",
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z"
            />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>{title}</div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>

      {/* Add New */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newItem.trim()}
          style={{
            padding: "0 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            border: "none", cursor: newItem.trim() ? "pointer" : "default",
            background: newItem.trim() ? "#b45309" : "#f3f4f6",
            color: newItem.trim() ? "#fff" : "var(--wm-er-muted)",
          }}
        >
          + Add
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, marginBottom: 8 }}>{error}</div>
      )}

      {/* List */}
      {items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${BORDER_COLOR}`,
                background: "#f9fafb",
              }}
            >
              {editingItem === item ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleRename(item); }
                      if (e.key === "Escape") setEditingItem(null);
                    }}
                    autoFocus
                    style={{ ...inputStyle, padding: "6px 10px", fontSize: 12 }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  <button
                    type="button"
                    onClick={() => handleRename(item)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 700, color: "#15803d", padding: "0 4px",
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, color: "var(--wm-er-muted)", padding: "0 4px",
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)" }}>
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setEditingItem(item); setEditValue(item); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 700, color: "#0369a1", padding: "0 4px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRequest(item)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 700, color: "#dc2626", padding: "0 4px",
                    }}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "14px 0", fontSize: 12, color: "var(--wm-er-muted)" }}>
          No {title.toLowerCase()} added yet.
        </div>
      )}

      <ConfirmModal confirm={confirm} onConfirm={handleDeleteConfirm} onCancel={() => { setConfirm(null); setDeleteTarget(null); }} />
    </div>
  );
}

/* ------------------------------------------------ */
/* Main Section Component                           */
/* ------------------------------------------------ */
export function LocationDepartmentSection() {
  const [autoDetectMsg, setAutoDetectMsg] = useState("");

  const subscribe = useCallback(
    (cb: () => void) => companyConfigStorage.subscribe(cb),
    [],
  );
  const getSnapshot = useCallback(
    () => JSON.stringify({ l: companyConfigStorage.getLocations() }),
    [],
  );
  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { l: locations } = useMemo(() => {
    try { return JSON.parse(raw); } catch { return { l: [] }; }
  }, [raw]);

  const handleAutoDetect = () => {
    const records = hrManagementStorage.getAll();
    const result = companyConfigStorage.autoDetectFromHR(records);
    if (result.locationsAdded === 0) {
      setAutoDetectMsg("No new locations found in employee records.");
    } else {
      setAutoDetectMsg(`Added ${result.locationsAdded} location${result.locationsAdded > 1 ? "s" : ""} from employee records!`);
    }
    setTimeout(() => setAutoDetectMsg(""), 3000);
  };

  return (
    <div style={{
      padding: 16,
      background: "var(--wm-er-card, #fff)",
      borderRadius: 14,
      border: `1px solid ${BORDER_COLOR}`,
    }}>
      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(3, 105, 161, 0.08)",
            border: "1px solid rgba(3, 105, 161, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0369a1",
            flexShrink: 0,
          }}>
            <IconLocation />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
              Work Locations
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>
              Manage your work sites and locations
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAutoDetect}
          style={{
            padding: "7px 12px", fontSize: 11, fontWeight: 700,
            color: "#0369a1", background: "rgba(3, 105, 161, 0.06)",
            border: "1px solid rgba(3, 105, 161, 0.15)",
            borderRadius: 8, cursor: "pointer",
          }}
        >
          Auto-Detect
        </button>
      </div>

      {/* Auto-detect message */}
      {autoDetectMsg && (
        <div style={{
          marginBottom: 12, padding: "8px 12px", borderRadius: 8,
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          fontSize: 12, fontWeight: 700, color: "#15803d",
        }}>
          {autoDetectMsg}
        </div>
      )}

      {/* Locations Only */}
      <EditableList
        title="Locations"
        subtitle="Work sites where your employees are assigned"
        items={locations}
        onAdd={(name) => companyConfigStorage.addLocation(name)}
        onRemove={(name) => companyConfigStorage.removeLocation(name)}
        onRename={(old, nw) => companyConfigStorage.renameLocation(old, nw)}
        placeholder="Enter location name"
      />
    </div>
  );
}