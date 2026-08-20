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
import { computeCareerOsSnapshot } from "../helpers/employerDashboard.osCareer";
import {
  buildWorkspaceStrip,
  type EmployerOsWorkspaceStrip,
} from "../helpers/employerDashboard.osOps";
import {
  buildPlannerOpenRows,
  buildPlannerOsRows,
  computePlannerOsSnapshot,
} from "../helpers/employerDashboard.osPlanner";
import {
  buildShiftOpenRows,
  buildShiftOsRows,
  computeShiftOsSnapshot,
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
  return () => {
    unsubCareer();
    unsubShift();
    unsubShiftWs();
    window.removeEventListener(DEMAND_PLANS_CHANGED_EVENT, refresh);
    window.removeEventListener("wm:employee-shift-applications-changed", refresh);
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
      return {
        shiftSnap: computeShiftOsSnapshot(shiftPosts, shiftApps),
        careerSnap: computeCareerOsSnapshot(careerPosts, careerApps),
        plannerSnap: computePlannerOsSnapshot(plans, batches),
        workspaces: buildWorkspaceStrip(shiftWorkspaces, careerWorkspaces),
        shiftRows: buildShiftOsRows(shiftApps, shiftPosts),
        plannerRows: buildPlannerOsRows(batches),
        shiftOpen: buildShiftOpenRows(shiftPosts),
        plannerOpen: buildPlannerOpenRows(plans),
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
      };
    }
  }, [data]);
}
