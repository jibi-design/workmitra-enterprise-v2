/** Persist server workspace messages into the active role's workspace store. */

import { useAuthStore } from "../../../shared/store/authStore";
import { readEmployeeApplications } from "../../shared/shift/shiftEmployerPublic";
import {
  readShiftWorkspaces,
  writeShiftWorkspaces,
} from "../../employee/shiftJobs/storage/shiftWorkspace.persistence";
import {
  getWorkspacesSnapshot,
  saveWorkspaces,
} from "../../employer/shiftJobs/storage/shiftWorkspaceStorage";
import {
  mergeAllWorkspaceMessages,
  type WorkspaceMessageDto,
} from "./workspaceMessageMerge.helpers";

export function persistWorkspaceMessages(messages: readonly WorkspaceMessageDto[]): void {
  if (messages.length === 0) return;
  const apps = readEmployeeApplications().map((app) => ({ id: app.id, postId: app.postId }));
  const user = useAuthStore.getState().user;
  const asEmployer = user?.activeMode === "employer" || user?.role === "employer";

  if (asEmployer) {
    saveWorkspaces(mergeAllWorkspaceMessages(getWorkspacesSnapshot(), messages, apps));
    return;
  }

  writeShiftWorkspaces(mergeAllWorkspaceMessages(readShiftWorkspaces(), messages, apps));
}
