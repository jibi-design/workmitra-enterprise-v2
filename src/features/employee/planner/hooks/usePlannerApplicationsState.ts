/** Job Mitra | usePlannerApplicationsState.ts | Native planner applications (Hybrid A2 S4) */

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  shiftApplicationsStorage,
  shiftWorkspacesStorage,
  type ShiftApplicationData,
  type ShiftPostData,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { isPlannerApplication } from "../helpers/plannerDomainFilters";
import {
  computePlannerKpi,
  computePlannerTabCounts,
  plannerTabMatch,
  type PlannerApplicationTab,
} from "../helpers/plannerApplicationList.helpers";
import { employeePlanApplicationSummaryPath } from "../helpers/plannerEmployeeRoutes";

export function usePlannerApplicationsState() {
  const nav = useNavigate();
  const [tab, setTab] = useState<PlannerApplicationTab>("all");

  const posts = useSyncExternalStore(
    shiftApplicationsStorage.subscribe,
    shiftApplicationsStorage.getPosts,
    shiftApplicationsStorage.getPosts,
  );

  const apps = useSyncExternalStore(
    shiftApplicationsStorage.subscribe,
    shiftApplicationsStorage.getApps,
    shiftApplicationsStorage.getApps,
  );

  const workspaces = useSyncExternalStore(
    shiftWorkspacesStorage.subscribe,
    shiftWorkspacesStorage.getAll,
    shiftWorkspacesStorage.getAll,
  );

  const plannerApps = useMemo(() => apps.filter(isPlannerApplication), [apps]);
  const kpi = useMemo(() => computePlannerKpi(plannerApps), [plannerApps]);
  const counts = useMemo(() => computePlannerTabCounts(plannerApps), [plannerApps]);

  const postMap = useMemo(() => {
    const map = new Map<string, ShiftPostData>();
    for (const post of posts) {
      map.set(post.id, post);
    }
    return map;
  }, [posts]);

  const workspaceByPostId = useMemo(() => {
    const map = new Map<string, string>();
    for (const workspace of workspaces) {
      if (
        workspace.status === "active" ||
        workspace.status === "upcoming" ||
        workspace.status === "completed"
      ) {
        map.set(workspace.postId, workspace.id);
      }
    }
    return map;
  }, [workspaces]);

  const filteredApplications = useMemo(
    () => plannerApps.filter((application) => plannerTabMatch(application.status, tab)),
    [plannerApps, tab],
  );

  const openDiscover = useCallback(() => {
    nav(ROUTE_PATHS.employeePlannerBrowse);
  }, [nav]);

  const openApplication = useCallback(
    (application: ShiftApplicationData) => {
      if (application.planId) {
        nav(employeePlanApplicationSummaryPath(application.planId));
        return;
      }

      const workspaceId = workspaceByPostId.get(application.postId);
      if (workspaceId && application.status === "confirmed") {
        nav(ROUTE_PATHS.employeePlannerWorkspace.replace(":workspaceId", workspaceId));
      }
    },
    [nav, workspaceByPostId],
  );

  return {
    tab,
    setTab,
    kpi,
    counts,
    postMap,
    filteredApplications,
    openDiscover,
    openApplication,
  };
}
