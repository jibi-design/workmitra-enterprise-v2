// App name: Job Mitra
// File name: EmployerCareerCandidateWorkVaultReviewPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\pages\EmployerCareerCandidateWorkVaultReviewPage.tsx

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DocAccessDocumentList } from "../../../../shared/docAccess/components/DocAccessDocumentList";
import { DocAccessOtpStep } from "../../../../shared/docAccess/components/DocAccessOtpStep";
import { DocAccessSessionTimer } from "../../../../shared/docAccess/components/DocAccessSessionTimer";
import { VaultProfileTab } from "../../../employee/workVault/components/VaultProfileTab";
import {
  getVaultSectionData,
  type VaultSectionData,
} from "../../../employee/workVault/services/vaultDataAggregator";
import { useDocAccessModalState } from "../docAccess/useDocAccessModalState";
import {
  CAREER_APPS_KEY,
  CAREER_POSTS_KEY,
  safeParse,
  safeRead,
} from "../helpers/careerStorageUtils";
import type { CareerApplication, CareerJobPost } from "../types/careerTypes";

type ReviewTab = "profile" | "documents";

const PAGE_STYLE = {
  minHeight: "100%",
  paddingBottom: 28,
} as const;

const HERO_STYLE = {
  marginTop: 2,
  padding: "16px 16px",
  borderRadius: 22,
  border: "1px solid rgba(124,58,237,0.14)",
  background:
    "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(255,255,255,0.98) 48%, rgba(240,253,244,0.86))",
  boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
} as const;

const TAB_ROW_STYLE = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
} as const;

export function EmployerCareerCandidateWorkVaultReviewPage() {
  const nav = useNavigate();
  const { postId = "", appId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<ReviewTab>("profile");

  const posts = useMemo(() => safeParse<CareerJobPost>(safeRead(CAREER_POSTS_KEY)), []);
  const apps = useMemo(() => safeParse<CareerApplication>(safeRead(CAREER_APPS_KEY)), []);

  const post = useMemo(() => posts.find((item) => item.id === postId) ?? null, [posts, postId]);

  const application = useMemo(
    () => apps.find((item) => item.id === appId && item.jobId === postId) ?? null,
    [apps, appId, postId],
  );

  const baseVaultData = useMemo(() => getVaultSectionData(), []);
  const vaultData = useMemo(
    () => (application ? buildCareerEmployerVaultData(application, baseVaultData) : baseVaultData),
    [application, baseVaultData],
  );

  const workerName =
    application?.profileSnapshot?.fullName?.trim() ||
    application?.employeeName?.trim() ||
    vaultData.identity.fullName ||
    "Candidate";

  const workerWmId =
    application?.profileSnapshot?.uniqueId?.trim() ||
    application?.employeeId?.trim() ||
    vaultData.identity.uniqueId ||
    application?.id ||
    "";

  const accessState = useDocAccessModalState({
    workerWmId,
    domain: "career",
    onClose: () => undefined,
  });

  if (!post || !application) {
    return (
      <div style={PAGE_STYLE}>
        <section style={HERO_STYLE}>
          <div className="wm-pageTitle">Profile & Documents</div>
          <div className="wm-pageSub">Candidate record not found.</div>
        </section>

        <button
          className="wm-outlineBtn"
          type="button"
          style={{ width: "100%", marginTop: 12 }}
          onClick={() => nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId))}
        >
          Back to post dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={PAGE_STYLE}>
      <section style={HERO_STYLE}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div className="wm-pageTitle">Review Profile & Documents</div>

            <div
              className="wm-pageSub"
              style={{
                marginTop: 4,
                fontSize: 13,
                fontWeight: 750,
                color: "var(--wm-er-text)",
                lineHeight: 1.35,
              }}
            >
              {workerName} · Career Work Vault review
            </div>
          </div>

          {accessState.sessionActive && <DocAccessSessionTimer />}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 12.5,
            color: "var(--wm-er-muted)",
            lineHeight: 1.6,
            fontWeight: 600,
          }}
        >
          {accessState.sessionActive
            ? "Access verified. You can review the employee profile and shared documents until this session expires."
            : "This is a protected Work Vault review. Enter the employee-generated access code first. Profile and documents will open only after the code is verified."}
        </div>
      </section>

      {!accessState.sessionActive ? (
        <section
          className="wm-ee-card"
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 18,
            border: "1px solid rgba(124,58,237,0.16)",
            background: "linear-gradient(135deg, rgba(124,58,237,0.045), rgba(255,255,255,0.98))",
          }}
        >
          <DocAccessOtpStep
            workerName={workerName}
            otpError={accessState.otpError}
            onSubmit={accessState.handleOtpSubmit}
            onClose={() => nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId))}
          />
        </section>
      ) : (
        <>
          <div style={TAB_ROW_STYLE}>
            <ReviewTabButton
              label="Profile"
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
            <ReviewTabButton
              label="Documents"
              active={activeTab === "documents"}
              onClick={() => setActiveTab("documents")}
            />
          </div>

          {activeTab === "profile" && <VaultProfileTab data={vaultData} readOnlyEmployerView />}

          {activeTab === "documents" && (
            <section
              className="wm-ee-card"
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 18,
                border: "1px solid rgba(124,58,237,0.16)",
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.045), rgba(255,255,255,0.98))",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 950,
                  color: "var(--wm-er-text)",
                  marginBottom: 5,
                }}
              >
                Shared Documents
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--wm-er-muted)",
                  lineHeight: 1.55,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Only folders marked visible by the employee will appear here. Hidden folders and
                hidden documents are not shown.
              </div>

              <DocAccessDocumentList
                folders={accessState.folders}
                documents={accessState.documents}
              />
            </section>
          )}

          <button
            type="button"
            onClick={accessState.handleEndSession}
            style={{
              width: "100%",
              marginTop: 14,
              padding: "10px 0",
              borderRadius: 11,
              border: "1px solid rgba(220,38,38,0.25)",
              background: "rgba(220,38,38,0.06)",
              color: "#dc2626",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            End Work Vault Session
          </button>
        </>
      )}

      <button
        className="wm-outlineBtn"
        type="button"
        style={{ width: "100%", marginTop: 14 }}
        onClick={() => nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId))}
      >
        Back to candidate list
      </button>
    </div>
  );
}

function ReviewTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 42,
        borderRadius: 14,
        border: active ? "1px solid rgba(124,58,237,0.34)" : "1px solid rgba(148,163,184,0.18)",
        background: active
          ? "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(255,255,255,0.98))"
          : "rgba(255,255,255,0.92)",
        color: active ? "#7c3aed" : "var(--wm-er-muted)",
        fontSize: 13,
        fontWeight: 850,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function buildCareerEmployerVaultData(
  application: CareerApplication,
  base: VaultSectionData,
): VaultSectionData {
  const profile = application.profileSnapshot;
  const fallbackSkills = cleanList(profile?.skills ?? []);

  return {
    ...base,
    identity: {
      ...base.identity,
      fullName:
        profile?.fullName?.trim() ||
        application.employeeName ||
        base.identity.fullName ||
        "Candidate",
      city: profile?.city?.trim() || base.identity.city || "Not specified",
      uniqueId: profile?.uniqueId?.trim() || application.employeeId || base.identity.uniqueId,
    },
    professionalSummary: {
      ...base.professionalSummary,
      headline:
        base.professionalSummary.headline ||
        application.resumeSummary ||
        profile?.experience ||
        "Career job candidate",
    },
    skills:
      base.skills.length > 0
        ? base.skills
        : fallbackSkills.map((name) => ({
            name,
            proficiency: "beginner",
            endorsedByCount: 0,
            endorsedByCompanies: [],
          })),
  };
}

function cleanList(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = value.trim();
    const key = cleaned.toLowerCase();

    if (!cleaned || seen.has(key)) continue;

    seen.add(key);
    result.push(cleaned);
  }

  return result;
}
