// src/features/employer/hrManagement/components/OnboardingAddItemModal.tsx
//
// Simple modal to add a custom onboarding checklist item.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";

type Props = {
  open: boolean;
  onAdd: (label: string) => void;
  onClose: () => void;
};

export function OnboardingAddItemModal({ open, onAdd, onClose }: Props) {
  const [label, setLabel] = useState("");

  const trimmed = label.trim();
  const isValid = trimmed.length >= 2;

  const handleSubmit = () => {
    if (!isValid) return;
    onAdd(trimmed);
    setLabel("");
  };

  const handleClose = () => {
    setLabel("");
    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={handleClose} ariaLabel="Add onboarding item" maxWidth={400}>
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
          Add Checklist Item
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, marginBottom: 14 }}>
          Add a custom item to the onboarding checklist for this employee.
        </div>

        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Complete safety training"
          maxLength={100}
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter" && isValid) handleSubmit(); }}
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 13,
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 8,
            outline: "none",
            background: "#fff",
            color: "var(--wm-er-text)",
            boxSizing: "border-box",
          }}
        />

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="wm-primarybtn"
            type="button"
            disabled={!isValid}
            onClick={handleSubmit}
            style={{ opacity: isValid ? 1 : 0.5 }}
          >
            Add Item
          </button>
        </div>
      </div>
    </CenterModal>
  );
}