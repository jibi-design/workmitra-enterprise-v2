/** Intent families for upfront guest auth warnings. */

import type { IntentAction } from "./intentPacket";

export function isEmployerCreateIntent(action: IntentAction): boolean {
  return (
    action === "create_draft" ||
    action === "create_shift" ||
    action === "create_career" ||
    action === "create_planner"
  );
}

export function isEmployeeApplyIntent(action: IntentAction): boolean {
  return action === "apply_shift" || action === "apply_career" || action === "apply_planner";
}

export function isPublishPhase(payload?: Record<string, unknown>): boolean {
  return payload?.phase === "publish";
}
