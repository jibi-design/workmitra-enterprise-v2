// App name: Job Mitra | EmployerCandidateDocumentAccessPage.tsx — DomainHero (Wave 2)

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";
import { VaultProfileTab } from "../../../shared/workVault/vaultPublic";
import type { VaultSectionData } from "../../../shared/workVault/vaultPublic";
import { getAppsSnapshot, getPostsSnapshot } from "../helpers/dashboardHelpers";
import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";

export function EmployerCandidateDocumentAccessPage() {
  const nav = useNavigate();
  const { postId = "", appId = "" } = useParams();

  const post = useMemo(() => {
    return getPostsSnapshot().find((item) => item.id === postId) ?? null;
  }, [postId]);

  const application = useMemo(() => {
    return getAppsSnapshot().find((item) => item.id === appId && item.postId === postId) ?? null;
  }, [appId, postId]);

  const backToDashboard = () =>
    nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId));

  if (!post || !application) {
    return (
      <div
        className="wm-er-vShift wm-stackGrid"
        data-testid="employer-candidate-doc-missing"
        style={{ paddingBottom: 24, gap: "var(--wm-stack-gap)" }}
      >
        <DomainHero
          variant="shift"
          audience="employer"
          icon={<ProfileHeroIcon />}
          title="Worker profile"
          subtitle="Candidate record not found"
          description="This application may have been removed or the link is outdated."
        />
        <EnterpriseEmpty
          domain="shift"
          title="Candidate not available"
          subtitle="Return to the post dashboard to continue reviewing applicants."
          primaryLabel="Back to post dashboard"
          onPrimary={backToDashboard}
          testId="employer-candidate-doc-empty"
        />
      </div>
    );
  }

  const profile = application.profileSnapshot;
  const workerName = profile?.fullName?.trim() || "Worker Profile";
  const vaultData = buildCandidateSafeVaultData(application);

  return (
    <div
      className="wm-er-vShift wm-stackGrid"
      data-testid="employer-candidate-doc-page"
      style={{ paddingBottom: 24, gap: "var(--wm-stack-gap)" }}
    >
      <DomainHero
        variant="shift"
        audience="employer"
        icon={<ProfileHeroIcon />}
        title="Worker profile"
        subtitle={`${workerName} · ${post.jobName}`}
        description="Safe profile view for Shift selection. Uses the application snapshot only — private documents and full Work Vault files are not shown."
        trailing={<span className="wm-domainHeroBadge">Safe view</span>}
      />

      <VaultProfileTab data={vaultData} readOnlyEmployerView />

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

function ProfileHeroIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
      />
    </svg>
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
      totalPlannerEpochs: 0,
      totalWorkforceCompanies: 0,
      totalCompaniesWorked: 0,
    },
    plannerGrowth: {
      epochs: [],
      totalEpochs: 0,
      finalizedEpochs: 0,
      totalPlans: 0,
      availabilityScore: null,
      reliabilityScore: null,
      plannerRatingAverage: null,
      plannerRatingCount: 0,
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
      domainRatings: {
        career: { average: null, count: 0 },
        shift: { average: null, count: 0 },
        planner: { average: null, count: 0 },
      },
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
