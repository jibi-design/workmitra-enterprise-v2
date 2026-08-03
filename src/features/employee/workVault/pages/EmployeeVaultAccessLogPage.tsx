// src/features/employee/workVault/pages/EmployeeVaultAccessLogPage.tsx
//
// Access History — HR vault sessions (DB when auth on) + Shift/Career doc access.
// L-V audit polish: searchable security timeline (presentation only).

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { VaultEmptyState } from "../../../vault/components/VaultEmptyState";
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

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

type StatusType = "active" | "viewed" | "expired" | "revoked";

function StatusBadge({ status }: { status: StatusType }) {
  const label =
    status === "active"
      ? "Active"
      : status === "viewed"
        ? "Viewed"
        : status === "expired"
          ? "Expired"
          : "Revoked";
  const toneClass =
    status === "active" || status === "viewed"
      ? "wm-vault-doc-status--valid"
      : status === "revoked"
        ? "wm-vault-doc-status--expired"
        : "wm-vault-doc-status--locked";

  return <span className={`wm-vault-doc-status ${toneClass}`}>{label}</span>;
}

type UnifiedEntry =
  | { kind: "hr"; entry: VaultAccessEntry; ts: number }
  | { kind: "doc"; entry: DocAccessLogEntry; ts: number };

function formatAccessStamp(ts: number): string {
  const accessDate = new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const accessTime = new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${accessDate} at ${accessTime}`;
}

/** Honest local-context badges — no fabricated IP/device telemetry. */
function ContextBadges({ domainLabel, sessionKind }: { domainLabel: string; sessionKind: string }) {
  return (
    <div className="wm-vault-timeline-item__badges">
      <span className="wm-vault-ctx-badge wm-vault-ctx-badge--domain">{domainLabel}</span>
      <span className="wm-vault-ctx-badge wm-vault-ctx-badge--device">Device · Local app</span>
      <span className="wm-vault-ctx-badge wm-vault-ctx-badge--network">
        Network · Scope-bound ({sessionKind})
      </span>
    </div>
  );
}

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
  const folderNames = entry.visibleFolderIds
    .map((id) => allFolders.find((f) => f.id === id)?.name)
    .filter(Boolean);

  const dotClass =
    entry.status === "active"
      ? "wm-vault-timeline-item__dot--active"
      : entry.status === "revoked"
        ? "wm-vault-timeline-item__dot--revoked"
        : "";

  return (
    <article className="wm-vault-timeline-item" role="listitem">
      <span className={`wm-vault-timeline-item__dot ${dotClass}`} aria-hidden="true" />
      <div className="wm-vault-timeline-item__head">
        <div>
          <div className="wm-vault-timeline-item__title">
            {entry.employerName || "Unknown Employer"}
          </div>
          <div className="wm-vault-timeline-item__time">{formatAccessStamp(entry.accessedAt)}</div>
        </div>
        <StatusBadge status={entry.status as StatusType} />
      </div>

      <ContextBadges domainLabel="HR Verification" sessionKind="vault OTP" />

      {folderNames.length > 0 && (
        <div className="wm-vault-timeline-item__badges">
          {folderNames.map((name) => (
            <span key={name} className="wm-vault-ctx-badge">
              {name}
            </span>
          ))}
        </div>
      )}

      {entry.employerIdentifier ? (
        <div className="wm-vault-timeline-item__time" style={{ marginTop: 8 }}>
          ID: {entry.employerIdentifier}
        </div>
      ) : null}

      {entry.status === "active" && onRevoke ? (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            className="wm-vault-revoke"
            disabled={revoking}
            onClick={() => onRevoke(entry.id)}
            style={{ cursor: revoking ? "wait" : "pointer", opacity: revoking ? 0.7 : 1 }}
          >
            {revoking ? "Revoking…" : "Revoke session"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function DocAccessRow({ entry }: { entry: DocAccessLogEntry }) {
  const domainLabel = entry.domain === "shift" ? "Shift Jobs" : "Career Jobs";

  return (
    <article className="wm-vault-timeline-item" role="listitem">
      <span
        className={`wm-vault-timeline-item__dot${
          entry.status === "revoked" ? " wm-vault-timeline-item__dot--revoked" : ""
        }`}
        aria-hidden="true"
      />
      <div className="wm-vault-timeline-item__head">
        <div>
          <div className="wm-vault-timeline-item__title">
            {entry.employerName || "Unknown Employer"}
          </div>
          <div className="wm-vault-timeline-item__time">{formatAccessStamp(entry.accessedAt)}</div>
        </div>
        <StatusBadge status={entry.status as StatusType} />
      </div>
      <ContextBadges domainLabel={`${domainLabel} · Doc Access`} sessionKind="HMAC grant" />
    </article>
  );
}

export function EmployeeVaultAccessLogPage() {
  const nav = useNavigate();
  const [hrLog, setHrLog] = useState<VaultAccessEntry[]>(() => getAccessLogSorted());
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return unified;
    return unified.filter((item) => {
      if (item.kind === "hr") {
        const e = item.entry;
        const haystack =
          `${e.employerName} ${e.employerIdentifier} ${e.status} hr verification vault`.toLowerCase();
        return haystack.includes(q);
      }
      const e = item.entry;
      const haystack =
        `${e.employerName} ${e.employerId} ${e.status} ${e.domain} doc access`.toLowerCase();
      return haystack.includes(q);
    });
  }, [unified, query]);

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
        subtitle={`${filtered.length} of ${unified.length} ${unified.length === 1 ? "record" : "records"} · Security timeline`}
        description="Review and revoke vault access sessions for your documents."
      />

      <div className="wm-vault-audit-note">
        Access history is permanent. Device and network badges reflect local vault context — they do
        not invent IP telemetry that was not recorded.
      </div>

      <div className="wm-vault-audit-search">
        <input
          type="search"
          className="wm-vault-audit-search__input"
          placeholder="Search employer, status, or domain…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search access history"
        />
      </div>

      {filtered.length === 0 ? (
        <VaultEmptyState
          title={unified.length === 0 ? "No access records yet" : "No matching records"}
          subtitle={
            unified.length === 0
              ? "When an employer views your documents, it will appear here."
              : "Try a different employer name, status, or domain keyword."
          }
        />
      ) : (
        <div className="wm-vault-timeline" role="list">
          {filtered.map((item) =>
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

      <div style={{ height: 80 }} />
    </div>
  );
}
