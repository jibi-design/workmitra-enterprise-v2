// src/features/employee/workVault/pages/EmployeeVaultAccessLogPage.tsx
//
// Access History — HR vault sessions (DB when auth on) + Shift/Career doc access.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { VaultEmptyState } from "../../../vault/components/VaultEmptyState";
import { VAULT_ACCENT, vaultAccentMix } from "../constants/vaultConstants";
import type { VaultAccessEntry } from "../types/vaultTypes";
import {
  getAccessLogSorted,
  hydrateVaultSessionsFromDb,
  revokeSession,
} from "../services/vaultAccessService";
import { getAllFolders } from "../services/vaultFolderService";
import { isVaultApiSyncEnabled } from "../services/vaultGateApi.service";
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
  const config: Record<
    StatusType,
    { bg: string; border: string; color: string; label: string; icon: string }
  > = {
    active: {
      bg: "rgba(22,163,74,0.08)",
      border: "rgba(22,163,74,0.25)",
      color: "#15803d",
      label: "Active",
      icon: "⚡",
    },
    viewed: {
      bg: "rgba(22,163,74,0.08)",
      border: "rgba(22,163,74,0.25)",
      color: "#15803d",
      label: "Viewed",
      icon: "✅",
    },
    expired: {
      bg: "rgba(107,114,128,0.08)",
      border: "rgba(107,114,128,0.2)",
      color: "#6b7280",
      label: "Expired",
      icon: "⏰",
    },
    revoked: {
      bg: "rgba(220,38,38,0.08)",
      border: "rgba(220,38,38,0.2)",
      color: "#dc2626",
      label: "Revoked",
      icon: "🚫",
    },
  };
  const c = config[status];
  return (
    <span
      style={{
        height: 22,
        padding: "0 8px",
        borderRadius: "var(--wm-radius-pill)",
        fontSize: 10,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        flexShrink: 0,
      }}
    >
      {c.icon} {c.label}
    </span>
  );
}

/* ------------------------------------------------ */
/* HR Access Entry Row                              */
/* ------------------------------------------------ */
function HrAccessRow({
  entry,
  onRevoke,
  revoking,
}: {
  entry: VaultAccessEntry;
  onRevoke?: (sessionId: string) => void;
  revoking?: boolean;
}) {
  const allFolders = useMemo(() => getAllFolders(), []);

  const accessDate = new Date(entry.accessedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const accessTime = new Date(entry.accessedAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const folderNames = entry.visibleFolderIds
    .map((id) => allFolders.find((f) => f.id === id)?.name)
    .filter(Boolean);

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-button)",
        border: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))",
        background: "#fff",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>
          {entry.employerName || "Unknown Employer"}
        </div>
        <StatusBadge status={entry.status as StatusType} />
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 10,
          fontWeight: 600,
          color: "var(--wm-er-accent-career)",
          marginBottom: 4,
        }}
      >
        HR Verification
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>
        {accessDate} at {accessTime}
      </div>
      {folderNames.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {folderNames.map((name) => (
            <span
              key={name}
              style={{
                height: 22,
                padding: "0 8px",
                borderRadius: "var(--wm-radius-pill)",
                fontSize: 11,
                fontWeight: 600,
                background: `${vaultAccentMix(4)}`,
                border: `1px solid ${vaultAccentMix(10)}`,
                color: VAULT_ACCENT,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
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
      {entry.status === "active" && onRevoke && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            className="wm-vault-revoke"
            disabled={revoking}
            onClick={() => onRevoke(entry.id)}
            style={{
              cursor: revoking ? "wait" : "pointer",
              opacity: revoking ? 0.7 : 1,
            }}
          >
            {revoking ? "Revoking…" : "Revoke session"}
          </button>
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
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const accessTime = new Date(entry.accessedAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const domainLabel = entry.domain === "shift" ? "Shift Jobs" : "Career Jobs";
  const domainColor = entry.domain === "shift" ? "#16a34a" : "#1d4ed8";

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-button)",
        border: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))",
        background: "#fff",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>
          {entry.employerName || "Unknown Employer"}
        </div>
        <StatusBadge status={entry.status as StatusType} />
      </div>
      <div
        style={{ marginTop: 4, fontSize: 10, fontWeight: 600, color: domainColor, marginBottom: 4 }}
      >
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
  | { kind: "hr"; entry: VaultAccessEntry; ts: number }
  | { kind: "doc"; entry: DocAccessLogEntry; ts: number };

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployeeVaultAccessLogPage() {
  const nav = useNavigate();
  const [hrLog, setHrLog] = useState<VaultAccessEntry[]>(() => getAccessLogSorted());
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setHrLog(getAccessLogSorted());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (isVaultApiSyncEnabled()) {
        await hydrateVaultSessionsFromDb();
      }
      if (!cancelled) refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const unified = useMemo((): UnifiedEntry[] => {
    const hrEntries = hrLog.map((e): UnifiedEntry => ({ kind: "hr", entry: e, ts: e.accessedAt }));
    const docEntries = docAccessSessionStorage
      .getAccessLog()
      .map((e): UnifiedEntry => ({ kind: "doc", entry: e, ts: e.accessedAt }));
    return [...hrEntries, ...docEntries].sort((a, b) => b.ts - a.ts);
  }, [hrLog]);

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);
    try {
      const ok = await revokeSession(sessionId);
      if (!ok && isVaultApiSyncEnabled()) {
        // keep UI; hydrate may restore truth
      }
      await hydrateVaultSessionsFromDb();
      refresh();
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <div className="wm-stackGrid">
      <DomainHero
        variant="settings"
        audience="employee"
        icon={
          <button
            type="button"
            className="wm-domainHeroIconBtn wm-vault-tap"
            onClick={() => nav("/employee/vault")}
            aria-label="Back to vault"
          >
            <IconBack />
          </button>
        }
        title="Access History"
        subtitle={`${unified.length} ${unified.length === 1 ? "record" : "records"} · Who viewed your documents`}
        description="Review and revoke vault access sessions for your documents."
      />

      {/* Info Note */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "var(--wm-radius-10)",
          background: `${vaultAccentMix(3)}`,
          border: `1px solid ${vaultAccentMix(7)}`,
          fontSize: 12,
          color: "var(--wm-emp-muted)",
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        Access history is permanent. This ensures full transparency of who has viewed your
        documents.
      </div>

      {/* Entries */}
      <div style={{ marginTop: 16 }}>
        {unified.length === 0 ? (
          <VaultEmptyState
            title="No access records yet"
            subtitle="When an employer views your documents, it will appear here."
          />
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {unified.map((item) =>
              item.kind === "hr" ? (
                <HrAccessRow
                  key={`hr-${item.entry.id}`}
                  entry={item.entry}
                  onRevoke={handleRevoke}
                  revoking={revokingId === item.entry.id}
                />
              ) : (
                <DocAccessRow key={`doc-${item.entry.id}`} entry={item.entry} />
              ),
            )}
          </div>
        )}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}
