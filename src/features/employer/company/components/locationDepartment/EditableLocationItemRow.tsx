// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EditableLocationItemRow.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\components\locationDepartment\EditableLocationItemRow.tsx

import type { CSSProperties } from "react";

const BORDER_COLOR = "#d1d5db";
const FOCUS_COLOR = "var(--wm-er-accent-hr)";

const inputStyle: CSSProperties = {
  flex: 1,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 600,
  color: "#1e293b",
  border: `1.5px solid ${BORDER_COLOR}`,
  borderRadius: "var(--wm-radius-8)",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

function handleInputFocus(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.style.borderColor = FOCUS_COLOR;
}

function handleInputBlur(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.style.borderColor = BORDER_COLOR;
}

type Props = {
  item: string;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDeleteRequest: () => void;
};

export function EditableLocationItemRow({
  item,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteRequest,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: "var(--wm-radius-8)",
        border: `1px solid ${BORDER_COLOR}`,
        background: "#f9fafb",
      }}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            value={editValue}
            onChange={(event) => onEditValueChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSaveEdit();
              }

              if (event.key === "Escape") {
                onCancelEdit();
              }
            }}
            autoFocus
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />

          <button
            type="button"
            onClick={onSaveEdit}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              color: "#15803d",
              padding: "0 4px",
            }}
          >
            Save
          </button>

          <button
            type="button"
            onClick={onCancelEdit}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--wm-er-muted)",
              padding: "0 4px",
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
            onClick={onStartEdit}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              color: "#0369a1",
              padding: "0 4px",
            }}
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onDeleteRequest}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              color: "#dc2626",
              padding: "0 4px",
            }}
          >
            Remove
          </button>
        </>
      )}
    </div>
  );
}
