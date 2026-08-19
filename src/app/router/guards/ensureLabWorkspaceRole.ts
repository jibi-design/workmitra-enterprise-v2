/**
 * Lab / AUTH-off deep-link helper.
 *
 * Product rule: Employee vs Employer must be chosen on Landing (role pick).
 * Never auto-assume a workspace role.
 *
 * When a guarded route is opened with no tab role, send the user to Landing
 * (pending route stashed) instead of showing the dead "Choose a workspace"
 * interstitial screen.
 */

import { ROUTE_PATHS } from "../routePaths";

/** Landing role-pick path — canonical Employee / Employer selection. */
export const LAB_WORKSPACE_PICK_PATH = ROUTE_PATHS.landing;
