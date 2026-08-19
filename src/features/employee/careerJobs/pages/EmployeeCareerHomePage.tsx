// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerHomePage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerHomePage.tsx

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EmployeeMyCurrentJobCard } from "../components/EmployeeMyCurrentJobCard";
import { EmployeeCareerAvailabilityBanner } from "../components/careerHome/EmployeeCareerAvailabilityBanner";
import { EmployeeCareerCompletedRecordsSection } from "../components/careerHome/EmployeeCareerCompletedRecordsSection";
import { EmployeeCareerHomeHeader } from "../components/careerHome/EmployeeCareerHomeHeader";
import { getAppsSnapshot, subscribeApps } from "../helpers/careerApplicationHelpers";
import { getCareerSearchSnapshot, subscribeCareerSearch } from "../helpers/careerSearchHelpers";
import {
  getCareerWorkspacesSnapshot,
  subscribeCareerWorkspaces,
} from "../helpers/careerWorkspaceHooks";
import { hydrateCareerSavedJobsFromServer } from "../storage/employeeCareerSavedJobs.sync";

function isBlockingCareerSearchStage(stage: string): boolean {
  return stage !== "withdrawn" && stage !== "rejected" && stage !== "offer_declined";
}

function isActiveApplicationStage(stage: string): boolean {
  return (
    stage !== "withdrawn" &&
    stage !== "rejected" &&
    stage !== "offer_declined" &&
    stage !== "hired" &&
    stage !== "completed"
  );
}

function isNextStepStage(stage: string): boolean {
  const normalizedStage = stage.toLowerCase();

  if (normalizedStage === "offer_declined" || normalizedStage === "withdrawn") return false;

  return (
    normalizedStage.includes("shortlist") ||
    normalizedStage.includes("discussion") ||
    normalizedStage.includes("interview") ||
    normalizedStage.includes("offer") ||
    normalizedStage.includes("selected")
  );
}

function isActiveWorkspaceStatus(status: string): boolean {
  return status === "onboarding" || status === "active";
}

export function EmployeeCareerHomePage() {
  const nav = useNavigate();

  useEffect(() => {
    void hydrateCareerSavedJobsFromServer();
  }, []);

  const posts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );
  const apps = useSyncExternalStore(subscribeApps, getAppsSnapshot, getAppsSnapshot);
  const workspaces = useSyncExternalStore(
    subscribeCareerWorkspaces,
    getCareerWorkspacesSnapshot,
    getCareerWorkspacesSnapshot,
  );

  const discoverablePosts = useMemo(() => {
    const blockedJobIds = new Set(
      apps.filter((app) => isBlockingCareerSearchStage(app.stage)).map((app) => app.jobId),
    );

    return posts.filter((post) => !blockedJobIds.has(post.id));
  }, [posts, apps]);

  const activeJobCount = discoverablePosts.length;

  const activeApplicationCount = useMemo(
    () => apps.filter((app) => isActiveApplicationStage(app.stage)).length,
    [apps],
  );

  const nextStepCount = useMemo(
    () => apps.filter((app) => isNextStepStage(app.stage)).length,
    [apps],
  );

  const activeWorkspaceCount = useMemo(
    () => workspaces.filter((workspace) => isActiveWorkspaceStatus(workspace.status)).length,
    [workspaces],
  );

  return (
    <div className="wm-ee-vCareer wm-stackGrid">
      <EmployeeCareerHomeHeader
        activeJobCount={activeJobCount}
        activeApplicationCount={activeApplicationCount}
        nextStepCount={nextStepCount}
        activeWorkspaceCount={activeWorkspaceCount}
        onSearchJobs={() => nav(ROUTE_PATHS.employeeCareerSearch)}
        onMyApplications={() => nav(ROUTE_PATHS.employeeCareerApplications)}
      />

      <EmployeeCareerAvailabilityBanner
        activeJobCount={activeJobCount}
        activeApplicationCount={activeApplicationCount}
        activeWorkspaceCount={activeWorkspaceCount}
      />

      <EmployeeMyCurrentJobCard onOpen={() => nav(ROUTE_PATHS.employeeCareerWorkspaces)} />

      <EmployeeCareerCompletedRecordsSection />
    </div>
  );
}
