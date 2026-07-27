// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EditableLocationList.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\components\locationDepartment\EditableLocationList.tsx

import { useState } from "react";
import { ConfirmModal, type ConfirmData } from "../../../../../shared/components/ConfirmModal";
import { EditableLocationAddRow } from "./EditableLocationAddRow";
import { EditableLocationItemRow } from "./EditableLocationItemRow";

const BORDER_COLOR = "#d1d5db";

type Props = {
  title: string;
  subtitle: string;
  items: string[];
  onAdd: (name: string) => boolean;
  onRemove: (name: string) => boolean;
  onRename: (oldName: string, newName: string) => boolean;
  placeholder: string;
};

export function EditableLocationList({
  title,
  subtitle,
  items,
  onAdd,
  onRemove,
  onRename,
  placeholder,
}: Props) {
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirm, setConfirm] = useState<ConfirmData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleAdd() {
    const trimmed = newItem.trim();

    if (!trimmed) return;

    const success = onAdd(trimmed);

    if (success) {
      setNewItem("");
      setError("");
      return;
    }

    setError("Already exists or invalid name.");
    setTimeout(() => setError(""), 2000);
  }

  function handleRename(oldName: string) {
    const trimmed = editValue.trim();

    if (!trimmed || trimmed === oldName) {
      setEditingItem(null);
      return;
    }

    const success = onRename(oldName, trimmed);

    if (success) {
      setEditingItem(null);
      setError("");
      return;
    }

    setError("Name already exists.");
    setTimeout(() => setError(""), 2000);
  }

  function handleDeleteRequest(name: string) {
    setDeleteTarget(name);
    setConfirm({
      title: `Remove ${title.slice(0, -1)}`,
      message: `Remove "${name}" from the list? This won't affect employees already assigned to it.`,
      tone: "danger",
      confirmLabel: "Remove",
      cancelLabel: "Keep",
    });
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      onRemove(deleteTarget);
      setDeleteTarget(null);
      setConfirm(null);
    }
  }

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-button)",
        border: `1px solid ${BORDER_COLOR}`,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--wm-radius-8)",
            background: "rgba(3, 105, 161, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0369a1",
            flexShrink: 0,
          }}
        >
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

      <EditableLocationAddRow
        value={newItem}
        placeholder={placeholder}
        onChange={setNewItem}
        onAdd={handleAdd}
      />

      {error && (
        <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, marginBottom: 8 }}>
          {error}
        </div>
      )}

      {items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item) => (
            <EditableLocationItemRow
              key={item}
              item={item}
              isEditing={editingItem === item}
              editValue={editValue}
              onEditValueChange={setEditValue}
              onStartEdit={() => {
                setEditingItem(item);
                setEditValue(item);
              }}
              onCancelEdit={() => setEditingItem(null)}
              onSaveEdit={() => handleRename(item)}
              onDeleteRequest={() => handleDeleteRequest(item)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "14px 0",
            fontSize: 12,
            color: "var(--wm-er-muted)",
          }}
        >
          No {title.toLowerCase()} added yet.
        </div>
      )}

      <ConfirmModal
        confirm={confirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirm(null);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
