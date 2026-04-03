// src/features/employee/workVault/components/VaultDocumentCard.tsx

import { useState } from "react";
import type { VaultDocument } from "../types/vaultTypes";
import { VAULT_ACCENT } from "../constants/vaultConstants";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconPdf() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2 4 4h-4V4ZM6 20V4h6v6h6v10H6Z" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2ZM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type VaultDocumentCardProps = {
  doc: VaultDocument;
  onView: (docId: string) => void;
  onDelete: (docId: string) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function VaultDocumentCard({ doc, onView, onDelete }: VaultDocumentCardProps) {
  const [now] = useState(() => Date.now());

  const isExpired = doc.expiryDate
    ? new Date(doc.expiryDate + "T00:00:00").getTime() < now
    : false;

  const uploadDate = new Date(doc.uploadedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(doc.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(doc.id);
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {/* Left: thumbnail + info */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {/* Thumbnail */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            background: doc.fileType === "pdf"
              ? "rgba(220, 38, 38, 0.08)"
              : `${VAULT_ACCENT}10`,
          }}
        >
          {doc.thumbnailBase64 && doc.fileType === "image" ? (
            <img
              src={doc.thumbnailBase64}
              alt={doc.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : doc.fileType === "pdf" ? (
            <span style={{ color: "#dc2626" }}><IconPdf /></span>
          ) : (
            <span style={{ color: VAULT_ACCENT }}><IconImage /></span>
          )}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "var(--wm-emp-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {doc.name}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--wm-emp-muted)" }}>
              {uploadDate}
            </span>
            <span style={{ fontSize: 11, color: "var(--wm-emp-muted)", textTransform: "uppercase", fontWeight: 800 }}>
              {doc.fileType}
            </span>
            {doc.expiryDate && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: isExpired ? "rgba(220, 38, 38, 0.08)" : "rgba(22, 163, 74, 0.08)",
                  color: isExpired ? "#dc2626" : "#15803d",
                  border: isExpired
                    ? "1px solid rgba(220, 38, 38, 0.20)"
                    : "1px solid rgba(22, 163, 74, 0.20)",
                }}
              >
                {isExpired ? "Expired" : `Exp: ${doc.expiryDate}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: delete */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(doc.id);
        }}
        aria-label={`Delete ${doc.name}`}
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          border: "none",
          background: "rgba(220, 38, 38, 0.08)",
          color: "#dc2626",
          fontSize: 15,
          fontWeight: 900,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}