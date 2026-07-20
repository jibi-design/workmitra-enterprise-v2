// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EditableLocationAddRow.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\components\locationDepartment\EditableLocationAddRow.tsx

import type { CSSProperties } from "react";

const BORDER_COLOR = "#d1d5db";
const FOCUS_COLOR = "var(--wm-er-accent-hr)";

const inputStyle: CSSProperties = {
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

function handleInputFocus(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.style.borderColor = FOCUS_COLOR;
}

function handleInputBlur(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.style.borderColor = BORDER_COLOR;
}

type Props = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onAdd: () => void;
};

export function EditableLocationAddRow({ value, placeholder, onChange, onAdd }: Props) {
  const canAdd = Boolean(value.trim());

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onAdd();
          }
        }}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />

      <button
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        style={{
          padding: "0 14px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          border: "none",
          cursor: canAdd ? "pointer" : "default",
          background: canAdd ? "#b45309" : "#f3f4f6",
          color: canAdd ? "#fff" : "var(--wm-er-muted)",
        }}
      >
        + Add
      </button>
    </div>
  );
}
