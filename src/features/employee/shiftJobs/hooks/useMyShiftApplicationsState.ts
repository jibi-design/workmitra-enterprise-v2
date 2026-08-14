// App name: Job Mitra
// File name: useMyShiftApplicationsState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\useMyShiftApplicationsState.ts

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { shiftApplicationsStorage } from "../storage/shiftApplications.storage";
import { shiftWorkspacesStorage } from "../../shiftJobs/storage/shiftWorkspaces.storage";
import type {
  ShiftApplicationData,
  ShiftPostData,
} from "../../shiftJobs/types/shiftApplicationTypes";
import {
  computeKpi,
  computeTabCounts,
  getWithdrawConfirmMessage,
  getWithdrawConfirmTitle,
  isWithdrawableStatus,
  statusLabel,
  tabMatch,
} from "../../shiftJobs/helpers/shiftApplicationHelpers";
import { employeeShiftApplicationsBannerCopy } from "../../shiftJobs/helpers/shiftApplications.smartResume";
import { settleMyShiftApplicationsConfirm } from "../../shiftJobs/helpers/myShiftApplications.confirm";
import { useMyShiftApplicationsLanding } from "./useMyShiftApplicationsLanding";
import {
  isPlannerApplication,
  isShiftApplication,
} from "../../planner/helpers/plannerDomainFilters";
import { employeePlanApplicationSummaryPath } from "../../planner/helpers/plannerEmployeeRoutes";

export type ApplicationsDomain = "shift" | "planner";

export function useMyShiftApplicationsState(domain: ApplicationsDomain = "shift") {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [withdrawConfirm, setWithdrawConfirm] = useState<ConfirmData | null>(null);
  const [pendingWithdrawApplication, setPendingWithdrawApplication] =
    useState<ShiftApplicationData | null>(null);
  const [pendingAttendanceApplication, setPendingAttendanceApplication] =
    useState<ShiftApplicationData | null>(null);
  const [toast, setToast] = useState("");

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

  const domainApps = useMemo(
    () =>
      apps.filter((app) =>
        domain === "planner" ? isPlannerApplication(app) : isShiftApplication(app),
      ),
    [apps, domain],
  );

  const kpi = useMemo(() => computeKpi(domainApps), [domainApps]);
  const counts = useMemo(() => computeTabCounts(domainApps), [domainApps]);
  const [tab, setTab] = useMyShiftApplicationsLanding(domainApps, tabFromUrl);
  const resumeBanner = useMemo(
    () => (domain === "shift" ? employeeShiftApplicationsBannerCopy(domainApps) : null),
    [domain, domainApps],
  );

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
    () => domainApps.filter((application) => tabMatch(application.status, tab)),
    [domainApps, tab],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }, []);

  const openFindShifts = useCallback(() => {
    nav(domain === "planner" ? ROUTE_PATHS.employeePlannerBrowse : ROUTE_PATHS.employeeShiftSearch);
  }, [nav, domain]);

  const openApplication = useCallback(
    (application: ShiftApplicationData) => {
      if (domain === "planner" && application.planId) {
        nav(employeePlanApplicationSummaryPath(application.planId));
        return;
      }

      const workspaceId = workspaceByPostId.get(application.postId);

      if (workspaceId && application.status === "confirmed") {
        const workspacePath =
          domain === "planner"
            ? ROUTE_PATHS.employeePlannerWorkspace
            : ROUTE_PATHS.employeeShiftWorkspace;
        nav(workspacePath.replace(":workspaceId", workspaceId));
        return;
      }

      nav(ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", application.postId));
    },
    [nav, workspaceByPostId, domain],
  );

  const requestWithdrawApplication = useCallback(
    (application: ShiftApplicationData) => {
      if (application.status === "confirmed") {
        setPendingWithdrawApplication(application);
        setWithdrawConfirm({
          title: "Cancel confirmed shift?",
          message:
            "This releases your confirmed slot. The employer will be notified to find a replacement. Use only if you cannot attend.",
          tone: "danger",
          confirmLabel: "Cancel confirmation",
          cancelLabel: "Keep confirmation",
        });
        return;
      }

      if (!isWithdrawableStatus(application.status)) {
        showToast(`${statusLabel(application.status)} applications cannot be withdrawn here.`);
        return;
      }

      setPendingWithdrawApplication(application);

      setWithdrawConfirm({
        title: getWithdrawConfirmTitle(application),
        message: getWithdrawConfirmMessage(application),
        tone: "danger",
        confirmLabel: "Withdraw",
        cancelLabel: "Keep application",
      });
    },
    [showToast],
  );

  const requestConfirmAttendanceApplication = useCallback(
    (application: ShiftApplicationData) => {
      if (application.status !== "confirmed") {
        showToast("Only confirmed shifts can record attendance intent.");
        return;
      }

      if (application.attendanceConfirmedAt !== undefined) {
        showToast("Attendance intent is already saved for this shift.");
        return;
      }

      setPendingAttendanceApplication(application);

      setWithdrawConfirm({
        title: "Confirm attendance intent?",
        message:
          "Saves Attendance Intent / Check-in Signal only — not a legal timecard, QR check-in, live timer, or payroll punch-in.",
        tone: "warn",
        confirmLabel: "Save attendance intent",
        cancelLabel: "Not now",
      });
    },
    [showToast],
  );

  const handleCancelWithdraw = useCallback(() => {
    setWithdrawConfirm(null);
    setPendingWithdrawApplication(null);
    setPendingAttendanceApplication(null);
  }, []);

  const handleConfirmWithdraw = useCallback(() => {
    settleMyShiftApplicationsConfirm({
      pendingAttendance: pendingAttendanceApplication,
      pendingWithdraw: pendingWithdrawApplication,
      showToast,
    });
    setWithdrawConfirm(null);
    setPendingWithdrawApplication(null);
    setPendingAttendanceApplication(null);
  }, [pendingAttendanceApplication, pendingWithdrawApplication, showToast]);

  return {
    tab,
    kpi,
    counts,
    postMap,
    filteredApplications,
    withdrawConfirm,
    toast,
    resumeBanner,
    setTab,
    openFindShifts,
    openApplication,
    requestWithdrawApplication,
    requestConfirmAttendanceApplication,
    handleCancelWithdraw,
    handleConfirmWithdraw,
  };
}
