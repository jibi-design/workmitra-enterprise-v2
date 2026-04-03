// src/features/employee/workVault/components/VaultFolderCard.tsx

import type { VaultFolder } from "../types/vaultTypes";
import { VAULT_ACCENT } from "../constants/vaultConstants";

/* ------------------------------------------------ */
/* Folder Icons                                     */
/* ------------------------------------------------ */
function FolderIcon({ icon }: { icon: string }) {
  const iconMap: Record<string, string> = {
    id: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm8 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 8h8v-1c0-1.33-2.67-2-4-2s-4 .67-4 2v1Z",
    cert: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z",
    edu: "M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3Zm0 12.55L5 12.36V11l7 3.82 7-3.82v1.36L12 15.55Z",
    license: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm4 8H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1Z",
    other: "M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z",
  };

  const path = iconMap[icon] ?? iconMap.other;

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d={path} />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Visibility Badge                                 */
/* ------------------------------------------------ */
function VisibilityBadge({ visibility }: { visibility: "visible" | "hidden" }) {
  const isVisible = visibility === "visible";
  return (
    <span
      style={{
        height: 22,
        padding: "0 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        border: isVisible
          ? "1px solid rgba(22, 163, 74, 0.25)"
          : "1px solid rgba(220, 38, 38, 0.25)",
        background: isVisible
          ? "rgba(22, 163, 74, 0.08)"
          : "rgba(220, 38, 38, 0.08)",
        color: isVisible ? "#15803d" : "#dc2626",
        flexShrink: 0,
      }}
    >
      {isVisible ? "Visible" : "Hidden"}
    </span>
  );
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type VaultFolderCardProps = {
  folder: VaultFolder;
  documentCount: number;
  onTap: (folderId: string) => void;
  onToggleVisibility: (folderId: string) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function VaultFolderCard({
  folder,
  documentCount,
  onTap,
  onToggleVisibility,
}: VaultFolderCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onTap(folder.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap(folder.id);
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 14,
        border: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {/* Left: icon + info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${VAULT_ACCENT}12`,
            color: VAULT_ACCENT,
            flexShrink: 0,
          }}
        >
          <FolderIcon icon={folder.icon} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "var(--wm-emp-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {folder.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", marginTop: 2 }}>
            {documentCount} {documentCount === 1 ? "document" : "documents"}
          </div>
        </div>
      </div>

      {/* Right: visibility badge + toggle */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
      >
        <VisibilityBadge visibility={folder.visibility} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(folder.id);
          }}
          aria-label={`Toggle visibility for ${folder.name}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--wm-emp-muted)",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            {folder.visibility === "visible" ? (
              <path
                fill="currentColor"
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5ZM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3Z"
              />
            ) : (
              <path
                fill="currentColor"
                d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7ZM2 4.27l2.28 2.28.46.46A11.8 11.8 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27ZM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2Zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01Z"
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}