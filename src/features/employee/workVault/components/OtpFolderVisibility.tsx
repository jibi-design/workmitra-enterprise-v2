// src/features/employee/workVault/components/OtpFolderVisibility.tsx

import type { VaultFolder } from "../types/vaultTypes";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type OtpFolderVisibilityProps = {
  folders: VaultFolder[];
  visibleCount: number;
  hiddenCount: number;
  onToggleFolder: (folderId: string) => void;
  onBulkVisibility: (visibility: "visible" | "hidden") => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function OtpFolderVisibility({
  folders,
  visibleCount,
  hiddenCount,
  onToggleFolder,
  onBulkVisibility,
}: OtpFolderVisibilityProps) {
  return (
    <section style={{ marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)", letterSpacing: 0.5 }}>
          Folder visibility
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => onBulkVisibility("visible")}
            style={{
              height: 26, padding: "0 8px", borderRadius: 6,
              border: "1px solid rgba(22, 163, 74, 0.25)", background: "rgba(22, 163, 74, 0.08)",
              color: "#15803d", fontSize: 10, fontWeight: 700, cursor: "pointer",
            }}
          >
            Show All
          </button>
          <button
            type="button"
            onClick={() => onBulkVisibility("hidden")}
            style={{
              height: 26, padding: "0 8px", borderRadius: 6,
              border: "1px solid rgba(220, 38, 38, 0.25)", background: "rgba(220, 38, 38, 0.08)",
              color: "#dc2626", fontSize: 10, fontWeight: 700, cursor: "pointer",
            }}
          >
            Hide All
          </button>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginBottom: 10 }}>
        {visibleCount} visible · {hiddenCount} hidden
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {folders
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((folder) => {
            const isVisible = folder.visibility === "visible";
            return (
              <div
                key={folder.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 10,
                  border: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
                  background: "#fff",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
                  {folder.name}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFolder(folder.id)}
                  style={{
                    height: 28, padding: "0 10px", borderRadius: 999,
                    fontSize: 11, fontWeight: 700,
                    border: isVisible
                      ? "1px solid rgba(22, 163, 74, 0.25)"
                      : "1px solid rgba(220, 38, 38, 0.25)",
                    background: isVisible
                      ? "rgba(22, 163, 74, 0.08)"
                      : "rgba(220, 38, 38, 0.08)",
                    color: isVisible ? "#15803d" : "#dc2626",
                    cursor: "pointer",
                  }}
                >
                  {isVisible ? "Visible" : "Hidden"}
                </button>
              </div>
            );
          })}
      </div>
    </section>
  );
}