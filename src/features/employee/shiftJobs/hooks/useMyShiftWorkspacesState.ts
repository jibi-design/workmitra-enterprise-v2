// App name: Job Mitra
// File name: useMyShiftWorkspacesState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\useMyShiftWorkspacesState.ts

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  shiftWorkspacesStorage,
  type ShiftWorkspace,
} from "../../shiftJobs/storage/shiftWorkspaces.storage";
import { filterWorkspaces, getWorkspaceCounts } from "../helpers/myShiftWorkspaces.helpers";
import type { MyShiftWorkspaceTab } from "../types/myShiftWorkspaces.types";
import { shiftApplicationsStorage } from "../storage/shiftApplications.storage";
import { filterWorkspacesByDomain } from "../../planner/helpers/plannerDomainFilters";

export type WorkspacesDomain = "shift" | "planner";

const WORKSPACES_CHANGED_EVENTS = [
  "wm:employee-shift-workspaces-changed",
  "wm:employee-shift-applications-changed",
  "wm:employee-notifications-changed",
] as const;

let cacheKey: string | null = null;
let cacheList: ShiftWorkspace[] = [];

function getWorkspacesSnapshot(): ShiftWorkspace[] {
  const raw = localStorage.getItem("wm_employee_shift_workspaces_v1");

  if (raw === cacheKey) {
    return cacheList;
  }

  cacheKey = raw;
  cacheList = shiftWorkspacesStorage.getAll();
  return cacheList;
}

function subscribeWorkspaces(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);

  for (const eventName of WORKSPACES_CHANGED_EVENTS) {
    window.addEventListener(eventName, handler);
  }

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);

    for (const eventName of WORKSPACES_CHANGED_EVENTS) {
      window.removeEventListener(eventName, handler);
    }
  };
}

export function useMyShiftWorkspacesState(domain: WorkspacesDomain = "shift") {
  const nav = useNavigate();
  const [tab, setTab] = useState<MyShiftWorkspaceTab>("active");
  const [query, setQuery] = useState("");

  const allWorkspaces = useSyncExternalStore(
    subscribeWorkspaces,
    getWorkspacesSnapshot,
    getWorkspacesSnapshot,
  );

  const apps = useSyncExternalStore(
    shiftApplicationsStorage.subscribe,
    shiftApplicationsStorage.getApps,
    shiftApplicationsStorage.getApps,
  );

  const domainWorkspaces = useMemo(
    () => filterWorkspacesByDomain(allWorkspaces, apps, domain),
    [allWorkspaces, apps, domain],
  );

  const counts = useMemo(() => getWorkspaceCounts(domainWorkspaces), [domainWorkspaces]);

  const filteredWorkspaces = useMemo(
    () => filterWorkspaces(domainWorkspaces, tab, query),
    [domainWorkspaces, tab, query],
  );

  const openFindShifts = useCallback(() => {
    nav(domain === "planner" ? ROUTE_PATHS.employeePlannerBrowse : ROUTE_PATHS.employeeShiftSearch);
  }, [nav, domain]);

  const openWorkspace = useCallback(
    (workspaceId: string) => {
      const workspacePath =
        domain === "planner"
          ? ROUTE_PATHS.employeePlannerWorkspace
          : ROUTE_PATHS.employeeShiftWorkspace;
      nav(workspacePath.replace(":workspaceId", workspaceId));
    },
    [nav, domain],
  );

  return {
    tab,
    query,
    counts,
    filteredWorkspaces,
    setTab,
    setQuery,
    openFindShifts,
    openWorkspace,
  };
}
