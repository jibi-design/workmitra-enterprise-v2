// src/features/employee/workVault/pages/EmployeeVaultAccessLogPage.tsx
//
// Access History — shows both HR vault access + Shift/Career doc access.

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { VAULT_ACCENT } from "../constants/vaultConstants";
import type { VaultAccessEntry } from "../types/vaultTypes";
import { getAccessLogSorted } from "../services/vaultAccessService";
import { getAllFolders } from "../services/vaultFolderService";
import { docAccessSessionStorage } from "../../../../shared/docAccess/docAccessSessionStorage";
import type { DocAccessLogEntry } from "../../../../shared/docAccess/docAccessSessionStorage";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Status Badge                                     */
/* ------------------------------------------------ */
type StatusType = "active" | "viewed" | "expired" | "revoked";

function StatusBadge({ status }: { status: StatusType }) {
  const config: Record<StatusType, { bg: string; border: string; color: string; label: string; icon: string }> = {
    active:  { bg: "rgba(22,163,74,0.08)",  border: "rgba(22,163,74,0.25)",  color: "#15803d", label: "Active",  icon: "⚡" },
    viewed:  { bg: "rgba(22,163,74,0.08)",  border: "rgba(22,163,74,0.25)",  color: "#15803d", label: "Viewed",  icon: "✅" },
    expired: { bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)", color: "#6b7280", label: "Expired", icon: "⏰" },
    revoked: { bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.2)",  color: "#dc2626", label: "Revoked", icon: "🚫" },
  };
  const c = config[status];
  return (
    <span style={{
      height: 22, padding: "0 8px", borderRadius: 999,
      fontSize: 10, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color, flexShrink: 0,
    }}>
      {c.icon} {c.label}
    </span>
  );
}

/* ------------------------------------------------ */
/* HR Access Entry Row                              */
/* ------------------------------------------------ */
function HrAccessRow({ entry }: { entry: VaultAccessEntry }) {
  const allFolders = useMemo(() => getAllFolders(), []);

  const accessDate = new Date(entry.accessedAt).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
  const accessTime = new Date(entry.accessedAt).toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit",
  });

  const folderNames = entry.visibleFolderIds
    .map((id) => allFolders.find((f) => f.id === id)?.name)
    .filter(Boolean);

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 12,
      border: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))",
      background: "#fff",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>
          {entry.employerName || "Unknown Employer"}
        </div>
        <StatusBadge status={entry.status as StatusType} />
      </div>
      <div style={{ marginTop: 4, fontSize: 10, fontWeight: 600, color: "var(--wm-er-accent-career)", marginBottom: 4 }}>
        HR Verification
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>
        {accessDate} at {accessTime}
      </div>
      {folderNames.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {folderNames.map((name) => (
            <span key={name} style={{
              height: 22, padding: "0 8px", borderRadius: 999,
              fontSize: 11, fontWeight: 600,
              background: `${VAULT_ACCENT}08`, border: `1px solid ${VAULT_ACCENT}18`,
              color: VAULT_ACCENT, display: "inline-flex", alignItems: "center",
            }}>
              {name}
            </span>
          ))}
        </div>
      )}
      {entry.employerIdentifier && (
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-emp-muted)" }}>
          ID: {entry.employerIdentifier}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Doc Access Entry Row (Shift/Career)              */
/* ------------------------------------------------ */
function DocAccessRow({ entry }: { entry: DocAccessLogEntry }) {
  const accessDate = new Date(entry.accessedAt).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
  const accessTime = new Date(entry.accessedAt).toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit",
  });

  const domainLabel = entry.domain === "shift" ? "Shift Jobs" : "Career Jobs";
  const domainColor = entry.domain === "shift" ? "#16a34a" : "#1d4ed8";

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 12,
      border: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))",
      background: "#fff",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>
          {entry.employerName || "Unknown Employer"}
        </div>
        <StatusBadge status={entry.status as StatusType} />
      </div>
      <div style={{ marginTop: 4, fontSize: 10, fontWeight: 600, color: domainColor, marginBottom: 4 }}>
        {domainLabel} · Document Access
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>
        {accessDate} at {accessTime}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Unified log item                                 */
/* ------------------------------------------------ */
type UnifiedEntry =
  | { kind: "hr";  entry: VaultAccessEntry;   ts: number }
  | { kind: "doc"; entry: DocAccessLogEntry;  ts: number };

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployeeVaultAccessLogPage() {
  const nav = useNavigate();

  const unified = useMemo((): UnifiedEntry[] => {
    const hrEntries   = getAccessLogSorted().map((e): UnifiedEntry => ({ kind: "hr",  entry: e, ts: e.accessedAt }));
    const docEntries  = docAccessSessionStorage.getAccessLog().map((e): UnifiedEntry => ({ kind: "doc", entry: e, ts: e.accessedAt }));
    return [...hrEntries, ...docEntries].sort((a, b) => b.ts - a.ts);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => nav("/employee/vault")}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))",
              background: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--wm-emp-text)", flexShrink: 0,
            }}
            aria-label="Back to vault"
          >
            <IconBack />
          </button>
          <div>
            <div className="wm-pageTitle">Access History</div>
            <div className="wm-pageSub">
              {unified.length} {unified.length === 1 ? "record" : "records"} · Who viewed your documents
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div style={{
        marginTop: 12, padding: "10px 14px", borderRadius: 10,
        background: `${VAULT_ACCENT}06`, border: `1px solid ${VAULT_ACCENT}12`,
        fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 600, lineHeight: 1.5,
      }}>
        Access history is permanent. This ensures full transparency of who has viewed your documents.
      </div>

      {/* Entries */}
      <div style={{ marginTop: 16 }}>
        {unified.length === 0 ? (
          <div style={{ padding: "48px 16px", textAlign: "center", color: "var(--wm-emp-muted)", fontSize: 13, lineHeight: 1.6 }}>
            No access records yet.
            <br />
            When an employer views your documents, it will appear here.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {unified.map((item) =>
              item.kind === "hr"
                ? <HrAccessRow key={`hr-${item.entry.id}`} entry={item.entry} />
                : <DocAccessRow key={`doc-${item.entry.id}`} entry={item.entry} />
            )}
          </div>
        )}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}