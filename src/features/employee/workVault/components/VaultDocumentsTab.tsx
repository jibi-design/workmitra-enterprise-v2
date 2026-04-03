// src/features/employee/workVault/components/VaultDocumentsTab.tsx

import { useNavigate } from "react-router-dom";
import { VAULT_ACCENT, DEFAULT_FOLDER_SUGGESTIONS } from "../constants/vaultConstants";
import type { VaultFolder } from "../types/vaultTypes";
import { VaultFolderCard } from "./VaultFolderCard";
import { IconPlus } from "./vaultHomeIcons";

/* ------------------------------------------------ */
/* System folder names (cannot delete)              */
/* ------------------------------------------------ */
const SYSTEM_FOLDER_NAMES = new Set(
  DEFAULT_FOLDER_SUGGESTIONS.map((s) => s.name),
);

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type VaultDocumentsTabProps = {
  folders: VaultFolder[];
  docCounts: Record<string, number>;
  totalDocs: number;
  onCreateFolder: () => void;
  onDeleteFolder: (folderId: string) => void;
  onToggleVisibility: (folderId: string) => void;
  onBulkVisibility: (visibility: "visible" | "hidden") => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function VaultDocumentsTab({
  folders,
  docCounts,
  totalDocs,
  onCreateFolder,
  onDeleteFolder,
  onToggleVisibility,
  onBulkVisibility,
}: VaultDocumentsTabProps) {
  const nav = useNavigate();

  return (
    <div style={{ marginTop: 12 }}>

      {/* Privacy Guide */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          background: "rgba(124, 58, 237, 0.04)",
          border: "1px solid rgba(124, 58, 237, 0.12)",
          marginBottom: 10,
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: VAULT_ACCENT, marginBottom: 6 }}>
          Your documents are private
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>
          <span style={{ fontWeight: 700, color: "var(--wm-emp-text)" }}>Visible</span> — employers can view this folder only with your OTP permission.
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", marginTop: 4 }}>
          <span style={{ fontWeight: 700, color: "var(--wm-emp-text)" }}>Hidden</span> — completely invisible to employers, even with OTP.
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", marginTop: 4 }}>
          <span style={{ fontWeight: 700, color: "var(--wm-emp-text)" }}>OTP</span> — a 6-digit code you share with an employer. They can view your visible documents for 30 minutes only. You can revoke access anytime.
        </div>
      </div>

      {/* Stats Bar */}
      <div
        style={{
          padding: "10px 16px",
          borderRadius: 12,
          background: `${VAULT_ACCENT}08`,
          border: `1px solid ${VAULT_ACCENT}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>
            <span style={{ fontWeight: 700, color: VAULT_ACCENT }}>{folders.length}</span> folders
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>
            <span style={{ fontWeight: 700, color: VAULT_ACCENT }}>{totalDocs}</span> documents
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => onBulkVisibility("visible")}
            style={{
              height: 28, padding: "0 10px", borderRadius: 8,
              border: "1px solid rgba(22, 163, 74, 0.25)", background: "rgba(22, 163, 74, 0.08)",
              color: "#15803d", fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}
          >
            Show All
          </button>
          <button
            type="button"
            onClick={() => onBulkVisibility("hidden")}
            style={{
              height: 28, padding: "0 10px", borderRadius: 8,
              border: "1px solid rgba(220, 38, 38, 0.25)", background: "rgba(220, 38, 38, 0.08)",
              color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}
          >
            Hide All
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onCreateFolder}
          style={{
            flex: 1, height: 44, borderRadius: 12, border: "none",
            background: VAULT_ACCENT, color: "#fff", fontWeight: 700,
            fontSize: 14, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <IconPlus /> New Folder
        </button>
        <button
          type="button"
          onClick={() => nav("/employee/vault/otp")}
          style={{
            flex: 1, height: 44, borderRadius: 12,
            border: `1.5px solid ${VAULT_ACCENT}`, background: "transparent",
            color: VAULT_ACCENT, fontWeight: 700, fontSize: 14,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
          }}
        >
          Generate OTP
        </button>
      </div>

      {/* Access History */}
      <button
        type="button"
        onClick={() => nav("/employee/vault/access-log")}
        style={{
          width: "100%", marginTop: 8, padding: "10px 16px", borderRadius: 12,
          border: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
          background: "#fff", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)",
        }}
      >
        <span>Access History</span>
        <span style={{ fontSize: 16, color: "var(--wm-emp-muted)" }}>{"\u203A"}</span>
      </button>

      {/* Folders List */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)",
            letterSpacing: 0.5, marginBottom: 10,
          }}
        >
          Your folders
        </div>

        {folders.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--wm-emp-muted)", fontSize: 13 }}>
            No folders yet. Tap &quot;New Folder&quot; to get started.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {folders
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((folder) => {
                const isSystem = SYSTEM_FOLDER_NAMES.has(folder.name);
                return (
                  <div key={folder.id} style={{ position: "relative" }}>
                    <VaultFolderCard
                      folder={folder}
                      documentCount={docCounts[folder.id] ?? 0}
                      onTap={(id) => nav(`/employee/vault/folder/${id}`)}
                      onToggleVisibility={onToggleVisibility}
                    />
                    {!isSystem && (
                      <button
                        type="button"
                        onClick={() => onDeleteFolder(folder.id)}
                        aria-label={`Delete ${folder.name}`}
                        style={{
                          position: "absolute", top: 8, right: 8,
                          width: 24, height: 24, borderRadius: 6,
                          border: "none", background: "rgba(220, 38, 38, 0.08)",
                          color: "#dc2626", fontSize: 14, fontWeight: 700,
                          cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center", lineHeight: 1,
                        }}
                      >
                        {"\u00D7"}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}