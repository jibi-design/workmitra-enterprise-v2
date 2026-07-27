// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CompanyHolidaysCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\components\config\CompanyHolidaysCard.tsx

import { useState, type CSSProperties } from "react";
import { ConfirmModal, type ConfirmData } from "../../../../../shared/components/ConfirmModal";
import { companyConfigStorage, type CompanyConfig } from "../../storage/companyConfig.storage";

const PURPLE = "#7c3aed";
const FOCUS_COLOR = "var(--wm-er-accent-hr)";
const BORDER_COLOR = "#d1d5db";

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  fontWeight: 600,
  color: "#1e293b",
  border: `1.5px solid ${BORDER_COLOR}`,
  borderRadius: "var(--wm-radius-8)",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

const sectionTitle: CSSProperties = {
  fontWeight: 900,
  fontSize: 13,
  color: "var(--wm-er-text)",
  marginBottom: 4,
};

const sectionHint: CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted)",
  lineHeight: 1.5,
  marginBottom: 12,
  paddingBottom: 10,
  borderBottom: `1px solid ${BORDER_COLOR}`,
};

const purpleBtnStyle: CSSProperties = {
  padding: "10px 20px",
  borderRadius: "var(--wm-radius-8)",
  fontSize: 13,
  fontWeight: 700,
  border: "none",
  background: PURPLE,
  color: "#fff",
  cursor: "pointer",
};

const purpleBtnDisabledStyle: CSSProperties = {
  ...purpleBtnStyle,
  opacity: 0.5,
  cursor: "default",
};

function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.style.borderColor = FOCUS_COLOR;
}

function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.style.borderColor = BORDER_COLOR;
}

function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  config: CompanyConfig;
};

export function CompanyHolidaysCard({ config }: Props) {
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmData | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newDate || !newName.trim()) return;

    const added = companyConfigStorage.addHoliday(newDate, newName);

    if (added) {
      setNewDate("");
      setNewName("");
    }
  };

  const handleDeleteRequest = (id: string, name: string) => {
    setPendingDeleteId(id);
    setDeleteConfirm({
      title: "Remove Holiday",
      message: `Remove "${name}" from company holidays?`,
      tone: "warn",
      confirmLabel: "Remove",
      cancelLabel: "Keep",
    });
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId) {
      companyConfigStorage.removeHoliday(pendingDeleteId);
    }

    setPendingDeleteId(null);
    setDeleteConfirm(null);
  };

  const canAdd = Boolean(newDate && newName.trim());

  return (
    <div>
      <div style={sectionTitle}>Company Holidays</div>

      <div style={sectionHint}>
        Add your company&rsquo;s public holidays and special off days here. These dates will be
        automatically marked as &ldquo;Off&rdquo; in attendance for all employees. No need to mark
        each employee separately.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={newDate}
            onChange={(event) => setNewDate(event.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div>
          <label style={labelStyle}>Holiday Name</label>
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Enter holiday name"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        style={{ marginTop: 8, ...(canAdd ? purpleBtnStyle : purpleBtnDisabledStyle) }}
      >
        + Add Holiday
      </button>

      {config.holidays.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {config.holidays.map((holiday) => (
            <div
              key={holiday.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                background: "#f9fafb",
                borderRadius: "var(--wm-radius-8)",
                border: `1px solid ${BORDER_COLOR}`,
              }}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                  {holiday.name}
                </span>
                <span style={{ fontSize: 12, color: "var(--wm-er-muted)", marginLeft: 8 }}>
                  {formatDate(holiday.date)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteRequest(holiday.id, holiday.name)}
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

      {config.holidays.length === 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-er-muted)" }}>
          No holidays added yet. Add your company holidays so they appear automatically in
          attendance.
        </div>
      )}

      <ConfirmModal
        confirm={deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setPendingDeleteId(null);
          setDeleteConfirm(null);
        }}
      />
    </div>
  );
}
