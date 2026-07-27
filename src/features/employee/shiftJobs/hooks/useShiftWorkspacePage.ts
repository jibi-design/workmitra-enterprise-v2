// App name: Job Mitra
// File name: useShiftWorkspacePage.ts

import { useCallback, useEffect, useMemo, useSyncExternalStore, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { employerSettingsStorage } from "../../../../shared/employerProfile/employerSettingsPublic";
import { getEmployerShiftPosts } from "../../../shared/shift/shiftEmployerPublic";
import { reviewCenterStorage } from "../../../shared/reviewCenter/storage/reviewCenter.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { syncVaultShiftRatings } from "../../workVault/services/shiftVaultHistory.service";
import { isReadOnlyStatus } from "../helpers/shiftWorkspaceDisplayHelpers";
import { getSafeExternalMapsUrl } from "../helpers/shiftWorkspacePage.helpers";
import { shiftWorkspacesStorage } from "../storage/shiftWorkspaces.storage";

export function useShiftWorkspacePage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { workspaceId = "" } = useParams();
  const [ratingOpen, setRatingOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const workspaces = useSyncExternalStore(
    shiftWorkspacesStorage.subscribe,
    shiftWorkspacesStorage.getAll,
    shiftWorkspacesStorage.getAll,
  );

  const workspace = workspaces.find((item) => item.id === workspaceId) ?? null;

  useEffect(() => {
    if (!workspace) return;
    const plannerPost = getEmployerShiftPosts().find((p) => p.id === workspace.postId);
    const isPlannerWorkspace = Boolean(plannerPost?.source === "planner" && plannerPost.planId);
    const onShiftWorkspaceRoute = loc.pathname.startsWith("/employee/shift/workspace/");
    const onPlannerWorkspaceRoute = loc.pathname.startsWith("/employee/planner/workspace/");
    if (isPlannerWorkspace && onShiftWorkspaceRoute) {
      nav(ROUTE_PATHS.employeePlannerWorkspace.replace(":workspaceId", workspaceId), {
        replace: true,
      });
    } else if (!isPlannerWorkspace && onPlannerWorkspaceRoute) {
      nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspaceId), {
        replace: true,
      });
    }
  }, [workspace, workspaceId, loc.pathname, nav]);

  useEffect(() => {
    if (workspaceId) shiftWorkspacesStorage.markRead(workspaceId);
  }, [workspaceId]);

  const handleRatingSubmitted = useCallback(() => {
    const currentWorkspace = shiftWorkspacesStorage.getById(workspaceId);
    const workerMlId = employeeProfileStorage.get().uniqueId ?? "";
    const employerMlId = employerSettingsStorage.get().uniqueId ?? "";

    if (currentWorkspace && workerMlId && employerMlId) {
      const savedRating = ratingStorage.getWorkerRatingForJob(
        workerMlId,
        currentWorkspace.postId,
        employerMlId,
      );

      if (savedRating) {
        shiftWorkspacesStorage.saveRating(
          workspaceId,
          savedRating.stars,
          savedRating.comment ?? "",
        );

        const updatedWorkspace = shiftWorkspacesStorage.getById(workspaceId);
        if (updatedWorkspace) {
          syncVaultShiftRatings(updatedWorkspace);
        }
      }
    }

    reviewCenterStorage.resolveBySource({
      domain: "shift",
      sourceId: workspaceId,
      toRole: "employee",
      action: "employer_request_employee_review",
    });

    setRatingOpen(false);
    setNotice({
      title: "Rating submitted",
      message: "Thank you for your feedback.",
      tone: "success",
    });
  }, [workspaceId]);

  const handleReplySuccess = useCallback(() => {
    setNotice({
      title: "Reply sent",
      message: "Your reply is saved. The employer can see it inside the app.",
      tone: "success",
    });
  }, []);

  const derived = useMemo(() => {
    if (!workspace) {
      return null;
    }

    const readOnly = isReadOnlyStatus(workspace.status);
    const workerMlId = employeeProfileStorage.get().uniqueId ?? "";
    const employerMlId = employerSettingsStorage.get().uniqueId ?? "";
    const canRate =
      workspace.status === "completed" && Boolean(workerMlId) && Boolean(employerMlId);
    const hasRated = workspace.rating
      ? true
      : workerMlId && employerMlId
        ? ratingStorage.hasWorkerRatedEmployer(workerMlId, workspace.postId, employerMlId)
        : false;
    const safeMapsLink = getSafeExternalMapsUrl(workspace.mapsLink);
    const plannerPost = getEmployerShiftPosts().find((p) => p.id === workspace.postId);
    const planEntry =
      plannerPost?.planId && plannerPost.source === "planner"
        ? plannerPublicIndex.getByPlanId(plannerPost.planId)
        : null;
    const isPlannerDomain = loc.pathname.startsWith("/employee/planner/") || Boolean(planEntry);

    return {
      readOnly,
      workerMlId,
      employerMlId,
      canRate,
      hasRated,
      safeMapsLink,
      plannerPost,
      planEntry,
      isPlannerDomain,
      title: `${workspace.companyName} - ${workspace.jobName}`,
    };
  }, [workspace, loc.pathname]);

  function handleExited() {
    if (!derived) return;
    nav(
      derived.isPlannerDomain
        ? ROUTE_PATHS.employeePlannerWorkspaces
        : ROUTE_PATHS.employeeShiftWorkspaces,
    );
  }

  return {
    workspace,
    workspaceId,
    ratingOpen,
    setRatingOpen,
    notice,
    setNotice,
    derived,
    handleRatingSubmitted,
    handleReplySuccess,
    handleExited,
  };
}
