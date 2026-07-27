/** Job Mitra | groupJoinDeepLink.ts | install → profile → pending group join (GJ-2) */

import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { EMPLOYEE_ONBOARDING_KEY } from "../../../shared/components/onboardingConstants";
import { getProfileCompletion } from "../../employee/profile/services/profileCompletionService";
import {
  peekPendingGroupJoin,
  peekPendingGroupJoinPath,
  type PendingGroupJoin,
} from "../storage/pendingGroupJoin.storage";

function isEmployeeOnboardingComplete(): boolean {
  try {
    return (
      localStorage.getItem(EMPLOYEE_ONBOARDING_KEY) === "1" ||
      localStorage.getItem("wm_onboarding_complete_v1") === "1"
    );
  } catch {
    /* TIER: ADVISORY */ console.warn("[GroupJoinDeepLink] localStorage unavailable");
    return false;
  }
}

/**
 * Where a worker with a pending group join should go next.
 * Order: onboarding slides → profile setup → invite (pending group join).
 * Returns null when no pending join intent.
 */
export function resolvePendingGroupJoinOrchestration(): string | null {
  const pending = peekPendingGroupJoin();
  if (!pending) return null;

  if (!isEmployeeOnboardingComplete()) {
    return ROUTE_PATHS.employeeHome;
  }

  if (!getProfileCompletion().isComplete) {
    return ROUTE_PATHS.employeeProfile;
  }

  return peekPendingGroupJoinPath();
}

export function hasPendingGroupJoin(): boolean {
  return peekPendingGroupJoin() != null;
}

export function describePendingGroupJoin(): PendingGroupJoin | null {
  return peekPendingGroupJoin();
}
