// App: Job Mitra / WorkMitra_Enterprise_v2
// File: useEmployeeCareerWorkspacesPage.ts

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { careerEmploymentFeedbackStorage } from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import {
  getCareerWorkspacesSnapshot,
  parseFeedbackTasks,
  subscribeCareerWorkspaces,
} from "../helpers/employeeCareerWorkspaces.helpers";

function getFeedbackSnapshot(): string {
  return JSON.stringify(careerEmploymentFeedbackStorage.getAll());
}

export function useEmployeeCareerWorkspacesPage() {
  const nav = useNavigate();
  const workspaces = useSyncExternalStore(
    subscribeCareerWorkspaces,
    getCareerWorkspacesSnapshot,
    getCareerWorkspacesSnapshot,
  );
  const feedbackRaw = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    getFeedbackSnapshot,
    getFeedbackSnapshot,
  );

  const feedbackTasks = useMemo(() => parseFeedbackTasks(feedbackRaw), [feedbackRaw]);

  function openWorkspace(workspaceId: string) {
    nav(ROUTE_PATHS.employeeCareerWorkspace.replace(":workspaceId", workspaceId));
  }

  return { workspaces, feedbackTasks, openWorkspace };
}
