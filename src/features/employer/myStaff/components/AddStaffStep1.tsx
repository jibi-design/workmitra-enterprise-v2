// src/features/employer/myStaff/components/AddStaffStep1.tsx

import type { IdRegistryEntry } from "../helpers/addStaffHelpers";
import { INPUT_STYLE, LABEL_STYLE, CANCEL_BTN_STYLE, nextBtnStyle } from "../helpers/addStaffStyles";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type AddStaffStep1Props = {
  uniqueId: string;
  onUniqueIdChange: (val: string) => void;
  lookupResult: IdRegistryEntry | null;
  lookupError: string;
  onLookup: () => void;
  onNext: () => void;
  onCancel: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function AddStaffStep1({
  uniqueId,
  onUniqueIdChange,
  lookupResult,
  lookupError,
  onLookup,
  onNext,
  onCancel,
}: AddStaffStep1Props) {
  return (
    <>
      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-muted)",
          lineHeight: 1.5,
          marginBottom: 12,
          padding: "8px 12px",
          borderRadius: 8,
          background: "rgba(3,105,161,0.05)",
          border: "1px solid rgba(3,105,161,0.12)",
        }}
      >
        Enter the employee's WorkMitra Unique ID. You can find it on their Work Vault profile or ask them directly.
      </div>

      <label style={LABEL_STYLE}>Employee Unique ID</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={uniqueId}
          onChange={(e) => onUniqueIdChange(e.target.value)}
          placeholder="Enter WorkMitra ID"
          style={{ ...INPUT_STYLE, flex: 1 }}
        />
        <button
          type="button"
          onClick={onLookup}
          disabled={!uniqueId.trim()}
          style={{
            padding: "0 16px",
            borderRadius: 10,
            border: "none",
            background: uniqueId.trim()
              ? "var(--wm-er-accent-console, #0369a1)"
              : "#e5e7eb",
            color: uniqueId.trim() ? "#fff" : "#9ca3af",
            fontWeight: 600,
            fontSize: 12,
            cursor: uniqueId.trim() ? "pointer" : "not-allowed",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Look Up
        </button>
      </div>

      {lookupError && (
        <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, marginTop: 8 }}>
          {lookupError}
        </div>
      )}

      {lookupResult && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            background: "rgba(22,163,74,0.06)",
            border: "1px solid rgba(22,163,74,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#16a34a"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"
              />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#16a34a" }}>
              Employee Found
            </span>
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              fontWeight: 700,
              color: "var(--wm-er-text)",
            }}
          >
            {lookupResult.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            ID: {lookupResult.uniqueId}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" onClick={onCancel} style={CANCEL_BTN_STYLE}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!lookupResult}
          style={nextBtnStyle(!!lookupResult)}
        >
          Next
        </button>
      </div>
    </>
  );
}