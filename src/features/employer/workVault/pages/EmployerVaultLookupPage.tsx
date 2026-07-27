// App name: Job Mitra
// File name: EmployerVaultLookupPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\pages\EmployerVaultLookupPage.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import type { IdRegistryEntry } from "../../../../shared/identity/types/identityTypes";
import {
  getVaultSectionData,
  VAULT_ACCENT,
  vaultAccentMix,
  type VaultSectionData,
} from "../../../shared/workVault/vaultPublic";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import {
  getWorkspacesSnapshot,
  subscribeWorkspaces,
} from "../../shiftJobs/storage/shiftWorkspaceStorage";
import { EmployerVaultAccessSessions } from "../components/accessSessions/EmployerVaultAccessSessions";
import { EmployerVaultLookup } from "../components/EmployerVaultLookup";
import { EmployerVaultProfileView } from "../components/EmployerVaultProfileView";
import { EmployerFutureVerificationPanel } from "../components/futureVerification/EmployerFutureVerificationPanel";
import { EmployerTrustRecordsPanel } from "../components/trustRecords/EmployerTrustRecordsPanel";

type TabId = "trust" | "verify";

const TAB_LABELS: Record<TabId, string> = {
  trust: "Trust Records",
  verify: "Verify Worker",
};

const TAB_ORDER: TabId[] = ["trust", "verify"];

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

export function EmployerVaultLookupPage() {
  const nav = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>("trust");
  const [foundEntry, setFoundEntry] = useState<IdRegistryEntry | null>(null);
  const [sectionData, setSectionData] = useState<VaultSectionData | null>(null);

  const workspaces = useSyncExternalStore(
    subscribeWorkspaces,
    getWorkspacesSnapshot,
    getWorkspacesSnapshot,
  );

  const workerReviews = useSyncExternalStore(
    ratingStorage.subscribe,
    ratingStorage.getAllWRRatings,
    ratingStorage.getAllWRRatings,
  );

  const employerWorkerRatings = useSyncExternalStore(
    ratingStorage.subscribe,
    ratingStorage.getAllERRatings,
    ratingStorage.getAllERRatings,
  );

  const receivedWorkerReviews = useMemo(() => {
    const employerMlId = employerSettingsStorage.get().uniqueId ?? "";
    const workspacePostIds = new Set(workspaces.map((workspace) => workspace.postId));

    return workerReviews.filter((review) => {
      if (review.domain !== "shift") return false;
      if (employerMlId && review.employerMlId === employerMlId) return true;
      return workspacePostIds.has(review.jobId);
    });
  }, [workerReviews, workspaces]);

  const givenWorkerRatings = useMemo(() => {
    const employerMlId = employerSettingsStorage.get().uniqueId ?? "";
    const workspacePostIds = new Set(workspaces.map((workspace) => workspace.postId));

    return employerWorkerRatings.filter((rating) => {
      if (rating.domain !== "shift") return false;
      if (employerMlId && rating.employerMlId === employerMlId) return true;
      return workspacePostIds.has(rating.jobId);
    });
  }, [employerWorkerRatings, workspaces]);

  function handleEmployeeFound(entry: IdRegistryEntry) {
    setFoundEntry(entry);
    setSectionData(getVaultSectionData());
  }

  function handleUnlockProfile() {
    if (!foundEntry) return;
    nav(`/employer/vault/view/${foundEntry.id}`);
  }

  function handleOpenWorkspace(workspaceId: string) {
    nav(ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", workspaceId));
  }

  return (
    <div className="wm-stackGrid">
      <DomainHero
        variant="settings"
        audience="employer"
        icon={
          <span style={{ color: VAULT_ACCENT }}>
            <IconShield />
          </span>
        }
        title="Employer Trust Vault"
        subtitle="Permanent trust records, worker feedback, and worker access tools"
        description="Look up workers, review trust records, and manage verification sessions."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: 5,
          borderRadius: "var(--wm-radius-18)",
          background: "rgba(248,250,252,0.94)",
          border: "1px solid rgba(226,232,240,0.9)",
        }}
      >
        {TAB_ORDER.map((tab) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                minHeight: 40,
                border: active ? `1px solid ${vaultAccentMix(20)}` : "1px solid transparent",
                borderRadius: "var(--wm-radius-chip)",
                background: active
                  ? "linear-gradient(180deg, rgba(245,243,255,0.96), rgba(255,255,255,0.98))"
                  : "transparent",
                color: active ? VAULT_ACCENT : "var(--wm-er-muted)",
                fontSize: 12,
                fontWeight: active ? 950 : 800,
                cursor: "pointer",
                boxShadow: active ? "0 8px 18px rgba(124,58,237,0.08)" : "none",
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {activeTab === "trust" && (
        <EmployerTrustRecordsPanel
          reviews={receivedWorkerReviews}
          workerRatings={givenWorkerRatings}
          workspaces={workspaces}
          onOpenWorkspace={handleOpenWorkspace}
        />
      )}

      {activeTab === "verify" && (
        <>
          <section
            className="wm-vault-card"
            style={{
              marginTop: 16,
              padding: 16,
            }}
          >
            <EmployerVaultLookup onEmployeeFound={handleEmployeeFound} />
          </section>

          {foundEntry && sectionData && (
            <div style={{ marginTop: 16 }}>
              <EmployerVaultProfileView data={sectionData} unlocked={false} />

              <button
                type="button"
                className="wm-vault-cta wm-vault-cta--primary"
                onClick={handleUnlockProfile}
                style={{ marginTop: 20 }}
              >
                <IconUnlock />
                Unlock Full Profile
              </button>

              <div
                style={{
                  marginTop: 8,
                  textAlign: "center",
                  fontSize: 11,
                  color: "var(--wm-er-muted)",
                  lineHeight: 1.5,
                }}
              >
                Ask the employee to share their 6-digit access code from the Job Mitra app.
              </div>
            </div>
          )}

          <EmployerFutureVerificationPanel />

          <div style={{ marginTop: 14 }}>
            <EmployerVaultAccessSessions />
          </div>
        </>
      )}

      <div style={{ height: 80 }} />
    </div>
  );
}
