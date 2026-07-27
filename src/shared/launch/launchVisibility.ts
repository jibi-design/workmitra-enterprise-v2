// App name: Job Mitra
// File name: launchVisibility.ts

import { showPhase2Features, showShiftOpsFeatures } from "../config/featureFlags";

export { showPhase2Features, showShiftOpsFeatures };

/** Launch visibility guard — Phase 2 modules hidden in production builds. */
export const LAUNCH_VISIBILITY = {
  workforceOps: showPhase2Features,
  employerHrManagement: showPhase2Features,
  employerManagerConsole: showPhase2Features,
  shiftOps: showShiftOpsFeatures,
} as const;
