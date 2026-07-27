// src/features/employer/shiftJobs/helpers/dashboardHelpers.ts — facade

export type { Tab, AnswerState, WorkspaceStatus, WorkspaceLite } from "./dashboardHelpers.types";

export {
  isRec,
  str,
  num,
  readAnswerMap,
  readNotesMap,
  safeParseArray,
} from "./dashboardHelpers.parsing";

export {
  normalizeWorkspacesLite,
  findWorkspaceIdForPost,
  workspaceNeedsAttention,
} from "./dashboardHelpers.workspace";

export { normalizeActivity } from "./dashboardHelpers.activity";

export { safeParseEmployeeApps } from "./dashboardHelpers.apps";

export {
  getPostsSnapshot,
  getAppsSnapshot,
  getActivitySnapshot,
  getWorkspacesSnapshot,
  subscribeDashboard,
  nextStepText,
  fmtTime,
} from "./dashboardHelpers.snapshots";
