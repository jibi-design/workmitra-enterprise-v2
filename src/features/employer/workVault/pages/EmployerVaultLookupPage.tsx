// src/features/employer/workVault/pages/EmployerVaultLookupPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VAULT_ACCENT } from "../../../employee/workVault/constants/vaultConstants";
import type { IdRegistryEntry } from "../../../../shared/identity/types/identityTypes";
import { getVaultSectionData } from "../../../employee/workVault/services/vaultDataAggregator";
import type { VaultSectionData } from "../../../employee/workVault/services/vaultDataAggregator";
import { EmployerVaultLookup } from "../components/EmployerVaultLookup";
import { EmployerVaultProfileView } from "../components/EmployerVaultProfileView";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8Z"
      />
    </svg>
  );
}

function IconUnlock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2Z"
      />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerVaultLookupPage() {
  const nav = useNavigate();
  const [foundEntry, setFoundEntry] = useState<IdRegistryEntry | null>(null);
  const [sectionData, setSectionData] = useState<VaultSectionData | null>(null);

  function handleEmployeeFound(entry: IdRegistryEntry) {
    setFoundEntry(entry);
    setSectionData(getVaultSectionData());
  }

  function handleUnlockProfile() {
    if (!foundEntry) return;
    nav(`/employer/vault/view/${foundEntry.id}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: VAULT_ACCENT }}>
              <IconShield />
            </span>
            Verify Employee
          </div>
          <div className="wm-pageSub">
            Look up an employee by their WorkMitra ID to view their profile and documents.
          </div>
        </div>
      </div>

      {/* Lookup Input */}
      <section
        className="wm-ee-card"
        style={{
          marginTop: 16,
          padding: "16px",
          borderRadius: 14,
          border: `1px solid ${VAULT_ACCENT}12`,
        }}
      >
        <EmployerVaultLookup onEmployeeFound={handleEmployeeFound} />
      </section>

      {/* Public Profile + Locked Sections */}
      {foundEntry && sectionData && (
        <div style={{ marginTop: 16 }}>
          {/* Profile View — unlocked=false shows public only */}
          <EmployerVaultProfileView data={sectionData} unlocked={false} />

          {/* Unlock Button */}
          <button
            type="button"
            onClick={handleUnlockProfile}
            style={{
              width: "100%",
              marginTop: 20,
              height: 48,
              borderRadius: 14,
              border: "none",
              background: VAULT_ACCENT,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <IconUnlock />
            Unlock Full Profile (OTP Required)
          </button>

          {/* Hint */}
          <div
            style={{
              marginTop: 8,
              textAlign: "center",
              fontSize: 11,
              color: "var(--wm-er-muted)",
              lineHeight: 1.5,
            }}
          >
            Ask the employee to share their 6-digit access code from the WorkMitra app.
          </div>
        </div>
      )}

      <div style={{ height: 80 }} />
    </div>
  );
}