// App name: Job Mitra
// File name: useMyShiftApplicationsState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\useMyShiftApplicationsState.ts

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { PulseEvent, PulseSectionId } from "../../../pulse/pulseRegistry";
import { usePulseStore } from "../../../pulse/pulseStore";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { shiftApplicationsStorage } from "../storage/shiftApplications.storage";
import { shiftWorkspacesStorage } from "../../shiftJobs/storage/shiftWorkspaces.storage";
import type {
  ApplicationTab,
  ShiftApplicationData,
  ShiftPostData,
} from "../../shiftJobs/types/shiftApplicationTypes";
import {
  computeKpi,
  computeTabCounts,
  isWithdrawableStatus,
  statusLabel,
  tabMatch,
} from "../../shiftJobs/helpers/shiftApplicationHelpers";
import {
  isPlannerApplication,
  isShiftApplication,
} from "../../planner/helpers/plannerDomainFilters";
import { employeePlanApplicationSummaryPath } from "../../planner/helpers/plannerEmployeeRoutes";

export type ApplicationsDomain = "shift" | "planner";

export function useMyShiftApplicationsState(domain: ApplicationsDomain = "shift") {
  const nav = useNavigate();
  const [tab, setTab] = useState<ApplicationTab>("all");
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
        showToast("Only confirmed shifts can be attendance-confirmed.");
        return;
      }

      if (application.attendanceConfirmedAt !== undefined) {
        showToast("Attendance is already confirmed for this shift.");
        return;
      }

      setPendingAttendanceApplication(application);

      setWithdrawConfirm({
        title: "Confirm shift attendance?",
        message: "Confirm only if you are available and will attend this shift on time.",
        tone: "warn",
        confirmLabel: "I will attend",
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
    if (pendingAttendanceApplication) {
      const result = shiftApplicationsStorage.confirmAttendance(pendingAttendanceApplication.id);

      setWithdrawConfirm(null);
      setPendingWithdrawApplication(null);
      setPendingAttendanceApplication(null);

      if (result.ok) {
        usePulseStore.getState().resolvePulseTrailByTarget({
          eventId: PulseEvent.SHIFT_CONFIRMATION_REQUIRED,
          postId: pendingAttendanceApplication.postId,
          appId: pendingAttendanceApplication.id,
          sectionId: PulseSectionId.EMPLOYEE_SHIFT_CONFIRMATION_CARD,
        });

        showToast("Attendance confirmed.");
        return;
      }

      if (result.reason === "already_confirmed") {
        showToast("Attendance is already confirmed.");
        return;
      }

      if (result.reason === "not_confirmed") {
        showToast("This shift is not confirmed yet.");
        return;
      }

      if (result.reason === "not_found") {
        showToast("Application not found. Please refresh and try again.");
        return;
      }

      showToast("Unable to save attendance confirmation. Please try again.");
      return;
    }

    if (!pendingWithdrawApplication) {
      setWithdrawConfirm(null);
      return;
    }

    const result = shiftApplicationsStorage.withdrawApplication(pendingWithdrawApplication.id);

    setWithdrawConfirm(null);
    setPendingWithdrawApplication(null);
    setPendingAttendanceApplication(null);

    if (result.ok) {
      showToast("Application withdrawn.");
      return;
    }

    if (result.reason === "not_withdrawable") {
      showToast("This application can no longer be withdrawn.");
      return;
    }

    if (result.reason === "not_found") {
      showToast("Application not found. Please refresh and try again.");
      return;
    }

    showToast("Unable to save withdrawal. Please try again.");
  }, [pendingAttendanceApplication, pendingWithdrawApplication, showToast]);

  return {
    tab,
    kpi,
    counts,
    postMap,
    filteredApplications,
    withdrawConfirm,
    toast,
    setTab,
    openFindShifts,
    openApplication,
    requestWithdrawApplication,
    requestConfirmAttendanceApplication,
    handleCancelWithdraw,
    handleConfirmWithdraw,
  };
}

function getWithdrawConfirmTitle(application: ShiftApplicationData): string {
  if (application.status === "shortlisted") {
    return "Withdraw from shortlist?";
  }

  if (application.status === "waiting") {
    return "Leave backup list?";
  }

  return "Withdraw this application?";
}

function getWithdrawConfirmMessage(application: ShiftApplicationData): string {
  if (application.status === "shortlisted") {
    return "You are currently shortlisted. Withdraw only if you are no longer available for this shift.";
  }

  if (application.status === "waiting") {
    return "You are currently on the backup list. Withdraw only if you do not want to stay available for this shift.";
  }

  return "Employer will no longer review this application after withdrawal.";
}
