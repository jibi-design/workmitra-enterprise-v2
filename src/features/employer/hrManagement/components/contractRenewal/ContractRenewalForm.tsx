// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ContractRenewalForm.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\contractRenewal\ContractRenewalForm.tsx

import { inputStyle } from "./contractRenewalStyles";
import { FieldLabel } from "./contractRenewalUi";

type Props = {
  renewDateStr: string;
  renewNote: string;
  onRenewDateChange: (value: string) => void;
  onRenewNoteChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ContractRenewalForm({
  renewDateStr,
  renewNote,
  onRenewDateChange,
  onRenewNoteChange,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div
      style={{
        marginTop: 4,
        padding: 12,
        borderRadius: 10,
        background: "var(--wm-er-bg, #f9fafb)",
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 8 }}>
        Renew Contract
      </div>

      <FieldLabel text="New End Date *" />
      <input
        type="date"
        value={renewDateStr}
        onChange={(event) => onRenewDateChange(event.target.value)}
        style={inputStyle}
      />

      <div style={{ marginTop: 8 }}>
        <FieldLabel text="Renewal Note *" />
        <textarea
          value={renewNote}
          onChange={(event) => onRenewNoteChange(event.target.value)}
          placeholder="e.g. Extended for another 6 months due to project continuation"
          rows={2}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            background: "#fff",
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
            color: "var(--wm-er-text)",
          }}
        >
          Cancel
        </button>

        <button
          className="wm-primarybtn"
          type="button"
          onClick={onConfirm}
          disabled={!renewDateStr || !renewNote.trim()}
          style={{ flex: 1, fontSize: 12 }}
        >
          Confirm Renewal
        </button>
      </div>
    </div>
  );
}
