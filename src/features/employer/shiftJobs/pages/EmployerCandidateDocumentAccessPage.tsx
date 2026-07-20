// App name: Job Mitra
// File name: EmployerCandidateDocumentAccessPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\pages\EmployerCandidateDocumentAccessPage.tsx

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { VaultProfileTab } from "../../../employee/workVault/components/VaultProfileTab";
import type { VaultSectionData } from "../../../employee/workVault/services/vaultDataAggregator";
import { getAppsSnapshot, getPostsSnapshot } from "../helpers/dashboardHelpers";
import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";

const PAGE_STYLE: CSSProperties = {
  minHeight: "100%",
  paddingBottom: 24,
};

const HERO_STYLE: CSSProperties = {
  marginTop: 2,
  padding: "16px 16px",
  borderRadius: 22,
  border: "1px solid rgba(124,58,237,0.14)",
  background:
    "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(255,255,255,0.98) 48%, rgba(240,253,244,0.86))",
  boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
};

export function EmployerCandidateDocumentAccessPage() {
  const nav = useNavigate();
  const { postId = "", appId = "" } = useParams();

  const post = useMemo(() => {
    return getPostsSnapshot().find((item) => item.id === postId) ?? null;
  }, [postId]);

  const application = useMemo(() => {
    return getAppsSnapshot().find((item) => item.id === appId && item.postId === postId) ?? null;
  }, [appId, postId]);

  if (!post || !application) {
    return (
      <div style={PAGE_STYLE}>
        <section style={HERO_STYLE}>
          <div className="wm-pageTitle">Worker profile</div>
          <div className="wm-pageSub">Candidate record not found.</div>
        </section>

        <button
          className="wm-outlineBtn"
          type="button"
          style={{ marginTop: 12 }}
          onClick={() => nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId))}
        >
          Back to post dashboard
        </button>
      </div>
    );
  }

  const profile = application.profileSnapshot;
  const workerName = profile?.fullName?.trim() || "Worker Profile";
  const vaultData = buildCandidateSafeVaultData(application);

  return (
    <div style={PAGE_STYLE}>
      <section style={HERO_STYLE}>
        <div className="wm-pageTitle">Worker profile</div>
        <div className="wm-pageSub">
          {workerName} · {post.jobName}
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.55 }}>
          Safe profile view for Shift Job selection. This page uses the candidate application
          snapshot only. Private documents and full Work Vault files are not shown here.
        </div>
      </section>

      <VaultProfileTab data={vaultData} readOnlyEmployerView />

      <button
        className="wm-outlineBtn"
        type="button"
        style={{ width: "100%", marginTop: 14 }}
        onClick={() => nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId))}
      >
        Back to candidate list
      </button>
    </div>
  );
}

function buildCandidateSafeVaultData(application: EmployeeShiftApplication): VaultSectionData {
  const profile = application.profileSnapshot;
  const skills = Array.isArray(profile?.skills) ? cleanList(profile.skills) : [];

  return {
    identity: {
      fullName: profile?.fullName?.trim() || "Worker Profile",
      city: profile?.city?.trim() || "Not specified",
      photoDataUrl: "",
      uniqueId: profile?.uniqueId?.trim() || "",
      phoneVerified: false,
      emailVerified: false,
      memberSince: application.createdAt || Date.now(),
    },
    professionalSummary: {
      headline: profile?.experience?.trim() || "Shift job candidate",
      employmentStatus: "available",
      expectedRoleType: "contract",
      noticePeriod: "immediate",
      currentCompany: "",
      employmentStatusAuto: false,
      resolvedStatus: "available",
      resolvedCompany: "",
    },
    workExperience: [],
    workStats: {
      totalCareerPositions: 0,
      verifiedPositions: 0,
      totalShiftsCompleted: 0,
      totalWorkforceCompanies: 0,
      totalCompaniesWorked: 0,
    },
    education: {
      level: "none",
      certifications: [],
    },
    skills: skills.map((name) => ({
      name,
      proficiency: "beginner",
      endorsedByCount: 0,
      endorsedByCompanies: [],
    })),
    performance: {
      overallRating: null,
      totalReviews: 0,
      ratingBreakdown: {
        star5: 0,
        star4: 0,
        star3: 0,
        star2: 0,
        star1: 0,
      },
      attendanceRate: null,
      reliabilityScore: null,
    },
    references: [],
    achievements: [],
    activity: {
      memberSince: application.createdAt || Date.now(),
      lastActive: application.createdAt || Date.now(),
      responseRate: null,
      profileViewsThisMonth: null,
    },
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
