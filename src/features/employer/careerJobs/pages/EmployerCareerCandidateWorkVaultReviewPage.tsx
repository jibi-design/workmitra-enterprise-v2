// App name: Job Mitra
// File name: EmployerCareerCandidateWorkVaultReviewPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\pages\EmployerCareerCandidateWorkVaultReviewPage.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { DocAccessOtpStep } from "../../../../shared/docAccess/components/DocAccessOtpStep";
import { DocAccessSessionTimer } from "../../../../shared/docAccess/components/DocAccessSessionTimer";
import { VaultProfileTab } from "../../../shared/workVault/vaultPublic";
import { getVaultSectionData } from "../../../shared/workVault/vaultPublic";
import { useDocAccessModalState } from "../docAccess/useDocAccessModalState";
import {
  CAREER_APPS_CHANGED,
  CAREER_APPS_KEY,
  CAREER_POSTS_CHANGED,
  CAREER_POSTS_KEY,
  safeParse,
  safeRead,
} from "../helpers/careerStorageUtils";
import type { CareerApplication, CareerJobPost } from "../types/careerTypes";
import {
  buildCareerEmployerVaultData,
  PAGE_STYLE,
  TAB_ROW_STYLE,
} from "./EmployerCareerCandidateWorkVaultReviewPage.helpers";
import {
  DocumentsTabPanel,
  ReviewTabButton,
} from "./EmployerCareerCandidateWorkVaultReviewPage.parts";

type ReviewTab = "profile" | "documents";

function subscribeCareerReviewStores(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(CAREER_POSTS_CHANGED, handler);
  window.addEventListener(CAREER_APPS_CHANGED, handler);
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  return () => {
    window.removeEventListener(CAREER_POSTS_CHANGED, handler);
    window.removeEventListener(CAREER_APPS_CHANGED, handler);
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
  };
}

function getCareerPostsRawSnapshot(): string | null {
  return safeRead(CAREER_POSTS_KEY);
}

function getCareerAppsRawSnapshot(): string | null {
  return safeRead(CAREER_APPS_KEY);
}

export function EmployerCareerCandidateWorkVaultReviewPage() {
  const nav = useNavigate();
  const { postId = "", appId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<ReviewTab>("profile");

  const postsRaw = useSyncExternalStore(
    subscribeCareerReviewStores,
    getCareerPostsRawSnapshot,
    () => null,
  );
  const appsRaw = useSyncExternalStore(
    subscribeCareerReviewStores,
    getCareerAppsRawSnapshot,
    () => null,
  );

  const posts = useMemo(() => safeParse<CareerJobPost>(postsRaw), [postsRaw]);
  const apps = useMemo(() => safeParse<CareerApplication>(appsRaw), [appsRaw]);

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

  const workerMlId =
    application?.profileSnapshot?.uniqueId?.trim() ||
    application?.employeeId?.trim() ||
    vaultData.identity.uniqueId ||
    application?.id ||
    "";

  const accessState = useDocAccessModalState({
    workerMlId,
    domain: "career",
    onClose: () => undefined,
  });

  const backToDashboard = () =>
    nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId));

  if (!post || !application) {
    return (
      <div className="wm-er-vCareer wm-stackGrid" style={PAGE_STYLE}>
        <DomainHero
          variant="career"
          audience="employer"
          title="Profile & Documents"
          subtitle="Candidate record not found"
          description="Return to the post dashboard and select an application again."
        />
        <button
          className="wm-outlineBtn"
          type="button"
          style={{ width: "100%" }}
          onClick={backToDashboard}
        >
          Back to post dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="wm-er-vCareer wm-stackGrid" style={PAGE_STYLE}>
      <DomainHero
        variant="career"
        audience="employer"
        title="Review Profile & Documents"
        subtitle={`${workerName} · Career Work Vault review`}
        description={
          accessState.sessionActive
            ? "Access verified. You can review the employee profile and shared documents until this session expires."
            : "Enter the employee-generated access code first. Profile and documents open only after verification."
        }
        trailing={accessState.sessionActive ? <DocAccessSessionTimer /> : null}
      />

      {!accessState.sessionActive ? (
        <section
          className="wm-ee-card"
          style={{
            padding: 14,
            borderRadius: "var(--wm-radius-chip)",
            border: "1px solid rgba(124,58,237,0.16)",
            background: "linear-gradient(135deg, rgba(124,58,237,0.045), rgba(255,255,255,0.98))",
          }}
        >
          <DocAccessOtpStep
            workerName={workerName}
            otpError={accessState.otpError}
            onSubmit={accessState.handleOtpSubmit}
            onClose={backToDashboard}
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
            <DocumentsTabPanel folders={accessState.folders} documents={accessState.documents} />
          )}

          <button
            type="button"
            className="wm-dangerBtn"
            onClick={accessState.handleEndSession}
            style={{ width: "100%" }}
          >
            End Work Vault Session
          </button>
        </>
      )}

      <button
        className="wm-outlineBtn"
        type="button"
        style={{ width: "100%" }}
        onClick={backToDashboard}
      >
        Back to candidate list
      </button>
    </div>
  );
}
