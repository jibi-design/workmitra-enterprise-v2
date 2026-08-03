// src/features/employee/workVault/components/VaultDocumentCard.tsx

import { useState } from "react";
import type { VaultDocument } from "../types/vaultTypes";
import { VAULT_ACCENT } from "../constants/vaultConstants";

function IconPdf() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2 4 4h-4V4ZM6 20V4h6v6h6v10H6Z"
      />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2ZM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5Z"
      />
    </svg>
  );
}

type DocCredentialStatus = "valid" | "expiring" | "expired" | "locked";

const STATUS_LABEL: Record<DocCredentialStatus, string> = {
  valid: "Valid",
  expiring: "Expiring",
  expired: "Expired",
  locked: "Locked",
};

function resolveDocCredentialStatus(
  doc: VaultDocument,
  folderLocked: boolean,
  now: number,
): DocCredentialStatus {
  if (folderLocked) return "locked";
  if (!doc.expiryDate) return "valid";

  const expiryMs = new Date(`${doc.expiryDate}T00:00:00`).getTime();
  if (Number.isNaN(expiryMs)) return "valid";
  if (expiryMs < now) return "expired";

  const daysLeft = (expiryMs - now) / (1000 * 60 * 60 * 24);
  if (daysLeft <= 30) return "expiring";
  return "valid";
}

type VaultDocumentCardProps = {
  doc: VaultDocument;
  onView: (docId: string) => void;
  onDelete: (docId: string) => void;
  /** When folder is OTP-hidden, treat credentials as Locked in the UI. */
  folderLocked?: boolean;
};

export function VaultDocumentCard({
  doc,
  onView,
  onDelete,
  folderLocked = false,
}: VaultDocumentCardProps) {
  const [now] = useState(() => Date.now());
  const [revealed, setRevealed] = useState(false);
  const status = resolveDocCredentialStatus(doc, folderLocked, now);

  const uploadDate = new Date(doc.uploadedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const hasImagePreview = Boolean(doc.thumbnailBase64 && doc.fileType === "image");

  return (
    <div
      role="button"
      tabIndex={0}
      className={`wm-vault-doc-card${revealed ? " wm-vault-doc-card--revealed" : ""}`}
      onClick={() => onView(doc.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(doc.id);
        }
      }}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
    >
      <div className="wm-vault-doc-card__main">
        <div
          className={`wm-vault-doc-card__thumb${
            status === "locked" ? " wm-vault-doc-card__thumb--locked" : ""
          }`}
          style={
            !hasImagePreview
              ? {
                  background:
                    doc.fileType === "pdf" ? "rgba(220, 38, 38, 0.08)" : "rgba(15, 23, 42, 0.04)",
                }
              : undefined
          }
        >
          {hasImagePreview ? (
            <img
              src={doc.thumbnailBase64}
              alt=""
              className="wm-vault-doc-card__thumb-img"
              draggable={false}
            />
          ) : doc.fileType === "pdf" ? (
            <span style={{ color: "#dc2626" }}>
              <IconPdf />
            </span>
          ) : (
            <span style={{ color: VAULT_ACCENT }}>
              <IconImage />
            </span>
          )}
          {(status === "locked" || (hasImagePreview && !revealed)) && (
            <span className="wm-vault-doc-card__thumb-veil" aria-hidden="true">
              {status === "locked" ? "Locked" : "Secure"}
            </span>
          )}
        </div>

        <div className="wm-vault-doc-card__copy">
          <div className="wm-vault-doc-card__title">{doc.name}</div>
          <div className="wm-vault-doc-card__meta">
            <span className="wm-vault-doc-card__meta-text">{uploadDate}</span>
            <span className="wm-vault-doc-card__meta-type">{doc.fileType}</span>
            <span className={`wm-vault-doc-status wm-vault-doc-status--${status}`}>
              {STATUS_LABEL[status]}
              {status === "expiring" && doc.expiryDate ? ` · ${doc.expiryDate}` : ""}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="wm-vault-doc-card__delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(doc.id);
        }}
        aria-label={`Delete ${doc.name}`}
      >
        ×
      </button>
    </div>
  );
}
