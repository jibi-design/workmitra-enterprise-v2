// App: Job Mitra / WorkMitra_Enterprise_v2
// File: useEmployeeCareerWorkspacePage.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\hooks\useEmployeeCareerWorkspacePage.ts

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { careerEmploymentFeedbackStorage } from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../../../../shared/employerProfile/employerSettingsPublic";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { employmentLifecycleStorage } from "../../employment/storage/employmentLifecycle.storage";
import { isRatableStatus } from "../helpers/careerWorkspaceDisplayHelpers";
import {
  getLifecycleSnapshot,
  parseCompletedFeedbackSnapshot,
  parseLifecycleRecord,
} from "../helpers/careerWorkspacePage.helpers";
import {
  getCareerWorkspacesSnapshot,
  subscribeCareerWorkspaces,
} from "../helpers/careerWorkspaceHooks";
import { syncVaultCareerRatingsForPost } from "../../workVault/services/careerVaultHistory.service";

export function useEmployeeCareerWorkspacePage() {
  const nav = useNavigate();
  const { workspaceId = "" } = useParams();
  const allWs = useSyncExternalStore(
    subscribeCareerWorkspaces,
    getCareerWorkspacesSnapshot,
    getCareerWorkspacesSnapshot,
  );
  const workspace = allWs.find((item) => item.id === workspaceId) ?? null;
  const careerPostId = workspace?.jobId ?? "";

  const lifecycleRaw = useSyncExternalStore(
    employmentLifecycleStorage.subscribe,
    getLifecycleSnapshot,
    getLifecycleSnapshot,
  );

  const employmentRecord = careerPostId ? parseLifecycleRecord(careerPostId, lifecycleRaw) : null;

  const feedbackRaw = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    () => careerEmploymentFeedbackStorage.getCompletedCareerPostSnapshot(careerPostId),
    () => careerEmploymentFeedbackStorage.getCompletedCareerPostSnapshot(careerPostId),
  );

  const completedFeedback = useMemo(
    () => parseCompletedFeedbackSnapshot(feedbackRaw).task,
    [feedbackRaw],
  );

  const [ratingOpen, setRatingOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const handleRatingSubmitted = () => {
    const careerPostIdForSync = employmentRecord?.careerPostId?.trim() || workspace?.jobId || "";
    if (careerPostIdForSync) {
      syncVaultCareerRatingsForPost(careerPostIdForSync, {
        employeeMlId: employeeProfileStorage.get().uniqueId ?? "",
        employerMlId: employerSettingsStorage.get().uniqueId ?? "",
      });
    }
    setRatingOpen(false);
    setNotice({
      title: "Rating submitted",
      message: "Thank you for your feedback.",
      tone: "success",
    });
  };

  const goCareerHome = useCallback(() => {
    nav(ROUTE_PATHS.employeeCareerHome);
  }, [nav]);

  const openEmploymentDetail = useCallback(
    (employmentId: string) => {
      nav(ROUTE_PATHS.employeeEmploymentDetail.replace(":employmentId", employmentId));
    },
    [nav],
  );

  const workerMlId = employeeProfileStorage.get().uniqueId ?? "";
  const employerMlId = employerSettingsStorage.get().uniqueId ?? "";
  const canRate =
    workspace !== null && isRatableStatus(workspace.status) && !!workerMlId && !!employerMlId;
  const hasRated =
    workspace && workerMlId && employerMlId
      ? ratingStorage.hasWorkerRatedEmployer(workerMlId, workspace.jobId, employerMlId)
      : false;

  return {
    workspace,
    employmentRecord,
    completedFeedback,
    ratingOpen,
    setRatingOpen,
    notice,
    setNotice,
    handleRatingSubmitted,
    goCareerHome,
    openEmploymentDetail,
    workerMlId,
    employerMlId,
    canRate,
    hasRated,
  };
}
