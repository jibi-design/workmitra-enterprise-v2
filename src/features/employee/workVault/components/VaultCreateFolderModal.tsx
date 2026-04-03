// src/features/employee/workVault/components/VaultCreateFolderModal.tsx

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { VAULT_ACCENT } from "../constants/vaultConstants";
import { validateFolderName } from "../helpers/vaultValidation";

/* ------------------------------------------------ */
/* Icon Options                                     */
/* ------------------------------------------------ */
const ICON_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "id", label: "Identity" },
  { value: "cert", label: "Certificate" },
  { value: "edu", label: "Education" },
  { value: "license", label: "License" },
  { value: "other", label: "Other" },
] as const;

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type VaultCreateFolderModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, icon: string) => void;
  /** If provided, modal acts as rename — pre-fills name and hides icon picker. */
  editMode?: { currentName: string };
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function VaultCreateFolderModal({
  open,
  onClose,
  onConfirm,
  editMode,
}: VaultCreateFolderModalProps) {
  const [name, setName] = useState(editMode?.currentName ?? "");
  const [icon, setIcon] = useState("other");
  const [error, setError] = useState("");

  function handleConfirm() {
    const result = validateFolderName(name);
    if (!result.valid) {
      setError(result.reason);
      return;
    }
    setError("");
    onConfirm(name.trim(), icon);
    setName("");
    setIcon("other");
  }

  function handleClose() {
    setName("");
    setIcon("other");
    setError("");
    onClose();
  }

  return (
    <CenterModal open={open} onBackdropClose={handleClose}>
      <div style={{ padding: "20px 20px 16px" }}>
        {/* Header */}
        <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-emp-text)", marginBottom: 16 }}>
          {editMode ? "Rename Folder" : "Create Folder"}
        </div>

        {/* Folder name input */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)", marginBottom: 6, display: "block" }}
          >
            Folder name
          </label>
          <input
            className="wm-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
              }
            }}
            placeholder="e.g. Work Certificates"
            autoFocus
          />
          {error && (
            <div style={{ fontSize: 12, color: "var(--wm-error)", marginTop: 4, fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>

        {/* Icon picker (only for create mode) */}
        {!editMode && (
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)", marginBottom: 6, display: "block" }}
            >
              Folder type
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ICON_OPTIONS.map((opt) => {
                const isActive = icon === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIcon(opt.value)}
                    style={{
                      height: 30,
                      padding: "0 12px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      border: isActive
                        ? `1.5px solid ${VAULT_ACCENT}`
                        : "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.10))",
                      background: isActive ? `${VAULT_ACCENT}10` : "transparent",
                      color: isActive ? VAULT_ACCENT : "var(--wm-emp-text)",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              height: 38,
              padding: "0 20px",
              borderRadius: 10,
              border: "none",
              background: VAULT_ACCENT,
              color: "#fff",
              fontWeight: 900,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {editMode ? "Rename" : "Create"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}