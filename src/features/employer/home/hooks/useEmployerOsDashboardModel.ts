/** Live Employer OS model — Shift + Career + Planner kept as separate lanes. */

import { useMemo, useSyncExternalStore } from "react";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { readCareerWorkspaces } from "../../careerJobs/helpers/careerNormalizers";
import {
  getCareerAppsSnapshot,
  getCareerPostsSnapshot,
  subscribeCareerDashboard,
} from "../../careerJobs/helpers/careerDashboardHelpers";
import {
  getAppsSnapshot,
  getPostsSnapshot,
  subscribeDashboard as subscribeShiftDashboard,
} from "../../shiftJobs/helpers/dashboardHelpers.snapshots";
import {
  getWorkspacesSnapshot,
  subscribeWorkspaces,
} from "../../shiftJobs/storage/shiftWorkspaceStorage";
import { listPlannerApplicationBatches } from "../../planner/services/plannerBatchApproval.service";
import { DEMAND_PLANS_CHANGED_EVENT } from "../../planner/storage/demandPlanner.schema";
import { demandPlannerStorage } from "../../planner/storage/demandPlannerStorage";
import {
  EMPLOYER_COMPLIANCE_CHANGED,
  employerComplianceStorage,
} from "../../compliance/storage/employerCompliance.storage";
import {
  buildEmployerInterviewRows,
  buildEmployerMatchCandidates,
} from "../helpers/employerDashboard.helpers";
import { computeCareerOsSnapshot } from "../helpers/employerDashboard.osCareer";
import {
  EMPTY_LANE_PREVIEW_LIVE,
  type LanePreviewLiveInput,
} from "../helpers/employerDashboard.lanePreview.live";
import { computeOsRibbonExtras, type OsRibbonExtras } from "../helpers/employerDashboard.osExtras";
import {
  buildWorkspaceStrip,
  type EmployerOsWorkspaceStrip,
} from "../helpers/employerDashboard.osOps";
import {
  buildPlannerBudgetRows,
  buildPlannerGapRows,
  buildPlannerOpenRows,
  buildPlannerOsRows,
  computePlannerOsSnapshot,
  countPlannerOpenWeeks,
  countPlannerUnfilledTotal,
  countPlannerWorkerDaysTotal,
} from "../helpers/employerDashboard.osPlanner";
import {
  buildShiftGateRows,
  buildShiftOpenRows,
  buildShiftOsRows,
  buildShiftRosterRows,
  computeShiftOsSnapshot,
  countShiftGateReady,
  countShiftRosterMatches,
  countShiftsStartingSoon,
  countUpcomingShiftPosts,
} from "../helpers/employerDashboard.osShift";
import type {
  EmployerOsDomainSnapshot,
  EmployerOsOpenRow,
  EmployerOsTrackerRow,
} from "../helpers/employerDashboard.osTypes";

export type EmployerOsDashboardModel = {
  readonly shiftSnap: EmployerOsDomainSnapshot;
  readonly careerSnap: EmployerOsDomainSnapshot;
  readonly plannerSnap: EmployerOsDomainSnapshot;
  readonly workspaces: EmployerOsWorkspaceStrip;
  readonly shiftRows: readonly EmployerOsTrackerRow[];
  readonly plannerRows: readonly EmployerOsTrackerRow[];
  readonly shiftOpen: readonly EmployerOsOpenRow[];
  readonly plannerOpen: readonly EmployerOsOpenRow[];
  readonly shiftRoster: readonly EmployerOsOpenRow[];
  readonly shiftGate: readonly EmployerOsOpenRow[];
  readonly plannerGaps: readonly EmployerOsOpenRow[];
  readonly plannerBudget: readonly EmployerOsOpenRow[];
  readonly shiftStartingSoon: number;
  readonly shiftUpcoming: number;
  readonly extras: OsRibbonExtras;
  readonly laneLive: LanePreviewLiveInput;
};

type OsBundle = {
  careerPosts: ReturnType<typeof getCareerPostsSnapshot>;
  careerApps: ReturnType<typeof getCareerAppsSnapshot>;
  careerWorkspaces: ReturnType<typeof readCareerWorkspaces>;
  shiftPosts: ReturnType<typeof getPostsSnapshot>;
  shiftApps: ReturnType<typeof getAppsSnapshot>;
  shiftWorkspaces: ReturnType<typeof getWorkspacesSnapshot>;
  plans: ReturnType<typeof demandPlannerStorage.getAll>;
  batches: ReturnType<typeof listPlannerApplicationBatches>;
  documents: ReturnType<typeof employerComplianceStorage.getAll>;
};

function safeRead<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch {
    return fallback;
  }
}

function readBundle(): OsBundle {
  return {
    careerPosts: safeRead(getCareerPostsSnapshot, []),
    careerApps: safeRead(getCareerAppsSnapshot, []),
    careerWorkspaces: safeRead(readCareerWorkspaces, []),
    shiftPosts: safeRead(getPostsSnapshot, []),
    shiftApps: safeRead(getAppsSnapshot, []),
    shiftWorkspaces: safeRead(getWorkspacesSnapshot, []),
    plans: safeRead(() => demandPlannerStorage.getAll(), []),
    batches: safeRead(listPlannerApplicationBatches, []),
    documents: safeRead(() => [...employerComplianceStorage.getAll()], []),
  };
}

let bundle: OsBundle = readBundle();

function subscribe(onChange: () => void): () => void {
  const refresh = () => {
    bundle = readBundle();
    onChange();
  };
  const unsubCareer = subscribeCareerDashboard(refresh);
  const unsubShift = subscribeShiftDashboard(refresh);
  const unsubShiftWs = subscribeWorkspaces(refresh);
  window.addEventListener(DEMAND_PLANS_CHANGED_EVENT, refresh);
  window.addEventListener("wm:employee-shift-applications-changed", refresh);
  window.addEventListener(EMPLOYER_COMPLIANCE_CHANGED, refresh);
  return () => {
    unsubCareer();
    unsubShift();
    unsubShiftWs();
    window.removeEventListener(DEMAND_PLANS_CHANGED_EVENT, refresh);
    window.removeEventListener("wm:employee-shift-applications-changed", refresh);
    window.removeEventListener(EMPLOYER_COMPLIANCE_CHANGED, refresh);
  };
}

function getBundle(): OsBundle {
  return bundle;
}

const EMPTY_SNAP: EmployerOsDomainSnapshot = {
  domain: "shift",
  title: "",
  openLabel: "",
  openCount: 0,
  pendingLabel: "",
  pendingCount: 0,
  confirmedLabel: "",
  confirmedCount: 0,
};

const EMPTY_WS: EmployerOsWorkspaceStrip = {
  shiftCount: 0,
  careerCount: 0,
  shiftHref: ROUTE_PATHS.employerShiftWorkspaces,
  careerHref: ROUTE_PATHS.employerMyStaff,
};

export function useEmployerOsDashboardModel(): EmployerOsDashboardModel {
  const data = useSyncExternalStore(subscribe, getBundle, getBundle);
  return useMemo(() => {
    try {
      const careerPosts = Array.isArray(data.careerPosts) ? data.careerPosts : [];
      const careerApps = Array.isArray(data.careerApps) ? data.careerApps : [];
      const careerWorkspaces = Array.isArray(data.careerWorkspaces) ? data.careerWorkspaces : [];
      const shiftPosts = Array.isArray(data.shiftPosts) ? data.shiftPosts : [];
      const shiftApps = Array.isArray(data.shiftApps) ? data.shiftApps : [];
      const shiftWorkspaces = Array.isArray(data.shiftWorkspaces) ? data.shiftWorkspaces : [];
      const plans = Array.isArray(data.plans) ? data.plans : [];
      const batches = Array.isArray(data.batches) ? data.batches : [];
      const documents = Array.isArray(data.documents) ? data.documents : [];
      const matches = buildEmployerMatchCandidates(careerPosts, careerApps, 1);
      const interviews = buildEmployerInterviewRows(
        careerApps,
        new Map(careerPosts.map((post) => [post.id, post])),
      );
      const shiftUpcoming = countUpcomingShiftPosts(shiftPosts);
      return {
        shiftSnap: computeShiftOsSnapshot(shiftPosts, shiftApps),
        careerSnap: computeCareerOsSnapshot(careerPosts, careerApps),
        plannerSnap: computePlannerOsSnapshot(plans, batches),
        workspaces: buildWorkspaceStrip(shiftWorkspaces, careerWorkspaces),
        shiftRows: buildShiftOsRows(shiftApps, shiftPosts),
        plannerRows: buildPlannerOsRows(batches),
        shiftOpen: buildShiftOpenRows(shiftPosts),
        plannerOpen: buildPlannerOpenRows(plans),
        shiftRoster: buildShiftRosterRows(shiftApps, shiftPosts),
        shiftGate: buildShiftGateRows(shiftPosts),
        plannerGaps: buildPlannerGapRows(plans),
        plannerBudget: buildPlannerBudgetRows(plans),
        shiftStartingSoon: countShiftsStartingSoon(shiftPosts),
        shiftUpcoming,
        extras: computeOsRibbonExtras({
          workspaces: shiftWorkspaces,
          apps: shiftApps,
          documents,
        }),
        laneLive: {
          shiftUpcoming,
          shiftRoster: countShiftRosterMatches(shiftApps, shiftPosts),
          shiftGateReady: countShiftGateReady(shiftPosts),
          careerApplicants: careerApps.length,
          careerTopMatch: matches[0]?.matchPercent ?? null,
          careerInterviews: interviews.length,
          plannerWeeks: countPlannerOpenWeeks(plans),
          plannerGaps: countPlannerUnfilledTotal(plans),
          plannerWorkerDays: countPlannerWorkerDaysTotal(plans),
        },
      };
    } catch {
      return {
        shiftSnap: { ...EMPTY_SNAP, domain: "shift", title: "Shift Jobs" },
        careerSnap: { ...EMPTY_SNAP, domain: "career", title: "Career Jobs" },
        plannerSnap: { ...EMPTY_SNAP, domain: "planner", title: "Planner" },
        workspaces: EMPTY_WS,
        shiftRows: [],
        plannerRows: [],
        shiftOpen: [],
        plannerOpen: [],
        shiftRoster: [],
        shiftGate: [],
        plannerGaps: [],
        plannerBudget: [],
        shiftStartingSoon: 0,
        shiftUpcoming: 0,
        extras: {
          workspaceClockedIn: 0,
          gatePending: 0,
          gateFlags: 0,
          vaultExpiring: 0,
        },
        laneLive: EMPTY_LANE_PREVIEW_LIVE,
      };
    }
  }, [data]);
}
