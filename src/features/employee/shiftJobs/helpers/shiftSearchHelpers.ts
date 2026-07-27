// App name: Job Mitra
// File name: shiftSearchHelpers.ts — facade

export type { PlanGroup } from "./shiftSearchHelpers.grouping";

export {
  trackShiftView,
  getRecentlyViewedIds,
  getFavoriteShiftIds,
  isFavoriteShift,
  toggleFavoriteShift,
} from "./shiftSearchHelpers.favorites";

export {
  getAppliedCategories,
  hasAnyApplications,
  getActiveApplicationPostIds,
  isInActiveApplicationFlow,
  isQuickApplyEnabled,
  isProfileComplete,
  quickApply,
  isAlreadyApplied,
} from "./shiftSearchHelpers.applications";

export { groupPostsByPlan, multiApplyGroup } from "./shiftSearchHelpers.grouping";

export { loadEmployerShiftWorkspaceFromServer } from "./shiftSearchHelpers.server";
