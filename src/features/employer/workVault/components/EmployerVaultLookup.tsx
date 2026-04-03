// src/features/employer/workVault/components/EmployerVaultLookup.tsx

import { useState } from "react";
import { validateId } from "../../../../shared/identity/validators/idValidator";
import { lookupById } from "../../../../shared/identity/registry/idRegistry";
import { VAULT_ACCENT } from "../../../employee/workVault/constants/vaultConstants";
import type { IdRegistryEntry } from "../../../../shared/identity/types/identityTypes";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type EmployerVaultLookupProps = {
  onEmployeeFound: (entry: IdRegistryEntry) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerVaultLookup({ onEmployeeFound }: EmployerVaultLookupProps) {
  const [idInput, setIdInput] = useState("");
  const [error, setError] = useState("");

  function handleSearch() {
    const trimmed = idInput.trim().toUpperCase();

    if (!trimmed) {
      setError("Please enter an Employee ID.");
      return;
    }

    const validation = validateId(trimmed);
    if (!validation.valid) {
      setError(validation.reason);
      return;
    }

    const entry = lookupById(trimmed);
    if (!entry) {
      setError("No employee found with this ID. Please check and try again.");
      return;
    }

    if (entry.role !== "employee") {
      setError("This ID belongs to an employer account, not an employee.");
      return;
    }

    setError("");
    onEmployeeFound(entry);
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label
          style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)", marginBottom: 6, display: "block" }}
        >
          Employee Unique ID
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="wm-input"
            style={{ flex: 1, letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase" }}
            value={idInput}
            onChange={(e) => {
              setIdInput(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="WM-XXXX-XXX-XXXX"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSearch}
            style={{
              height: 42,
              padding: "0 18px",
              borderRadius: 10,
              border: "none",
              background: VAULT_ACCENT,
              color: "#fff",
              fontWeight: 900,
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Search
          </button>
        </div>
        {error && (
          <div style={{ fontSize: 12, color: "var(--wm-error)", marginTop: 6, fontWeight: 600 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.6 }}>
        Enter the employee's WorkMitra ID to view their public profile and request document access.
      </div>
    </div>
  );
}