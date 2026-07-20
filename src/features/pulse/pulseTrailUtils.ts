/** Job Mitra | pulseTrailUtils.ts | src/features/pulse/pulseTrailUtils.ts */

import type { NotificationId } from "./pulseRegistry";
import type {
  ActivePulseTrails,
  PulseNodeId,
  PulseTrail,
  PulseTrailTargetParams,
  ResolvePulseTrailTargetInput,
  StartPulseTrailInput,
} from "./pulseTypes";

export function getNow(): number {
  return Date.now();
}

export function createTrailId(input: StartPulseTrailInput): string {
  const postId = input.targetParams?.postId ?? "none";
  const appId = input.targetParams?.appId ?? "none";
  const sectionId = input.targetParams?.sectionId ?? "none";

  return `${input.eventId}:${postId}:${appId}:${sectionId}`;
}

export function createNodeIdFromTrailLike(input: {
  readonly eventId: NotificationId;
  readonly targetParams?: PulseTrailTargetParams;
}): PulseNodeId {
  if (input.targetParams?.sectionId) return input.targetParams.sectionId;
  if (input.targetParams?.postId) return `${input.eventId}:${input.targetParams.postId}`;
  if (input.targetParams?.appId) return `${input.eventId}:${input.targetParams.appId}`;

  return input.eventId;
}

function optionalTargetMatches(expected: string | undefined, actual: string | undefined): boolean {
  if (expected === undefined) return true;

  return expected === actual;
}

export function doesTrailMatchTarget(
  trail: PulseTrail,
  input: ResolvePulseTrailTargetInput,
): boolean {
  if (trail.eventId !== input.eventId) return false;

  return (
    optionalTargetMatches(input.postId, trail.targetParams?.postId) &&
    optionalTargetMatches(input.appId, trail.targetParams?.appId) &&
    optionalTargetMatches(input.sectionId, trail.targetParams?.sectionId)
  );
}

export function hasStartedTrailForEvent(activeTrails: ActivePulseTrails, eventId: string): boolean {
  return Object.values(activeTrails).some((trail) => {
    return trail.eventId === eventId && trail.status === "TRAIL_STARTED";
  });
}
