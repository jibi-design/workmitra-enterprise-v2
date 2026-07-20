/** Job Mitra | usePulseResolver.ts | src/features/pulse/usePulseResolver.ts */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { PULSE_REGISTRY, type NotificationId, type PulseTargetPath } from "./pulseRegistry";
import { usePulseStore } from "./pulseStore";

/**
 * Normalize route paths before matching.
 *
 * This keeps matching stable for:
 * - trailing slashes
 * - query strings
 * - hash fragments
 */
export const normalizePulsePathSegments = (path: string): readonly string[] => {
  const pathWithoutQueryOrHash = path.split(/[?#]/u)[0] ?? "/";

  return pathWithoutQueryOrHash
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

export type PulseRouteParams = Readonly<Record<string, string>>;

/**
 * Extract route params from a current pathname using a route pattern.
 *
 * Example:
 * currentPathname:
 * /employer/career/post/post-1/candidate/app-1
 *
 * targetPath:
 * /employer/career/post/:postId/candidate/:appId
 *
 * result:
 * { postId: "post-1", appId: "app-1" }
 */
export const getPulseRouteParams = (
  currentPathname: string,
  targetPath: PulseTargetPath,
): PulseRouteParams | null => {
  const currentSegments = normalizePulsePathSegments(currentPathname);
  const targetSegments = normalizePulsePathSegments(targetPath);

  if (currentSegments.length !== targetSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let index = 0; index < targetSegments.length; index += 1) {
    const targetSegment = targetSegments[index];
    const currentSegment = currentSegments[index];

    if (!targetSegment || !currentSegment) {
      return null;
    }

    if (targetSegment.startsWith(":")) {
      const paramName = targetSegment.slice(1);

      if (paramName.length === 0) {
        return null;
      }

      params[paramName] = currentSegment;
      continue;
    }

    if (targetSegment !== currentSegment) {
      return null;
    }
  }

  return params;
};

/**
 * Matches current route pathname against a registry target path.
 *
 * Supports route params such as:
 * - /employer/shift/post/:postId
 * - /employee/career/workspace/:workspaceId
 */
export const doesPathMatchPulseTarget = (
  currentPathname: string,
  targetPath: PulseTargetPath,
): boolean => {
  return getPulseRouteParams(currentPathname, targetPath) !== null;
};

/**
 * Legacy route resolver hook.
 * -----------------------------------------------------------------------------
 * This is still supported, but the preferred enterprise path is:
 * - PulseTrailProvider for ROUTE events
 * - PulseSectionResolver for INTERACTION events
 */
export function usePulseResolver(notificationId: NotificationId): void {
  const location = useLocation();

  const isActive = usePulseStore((state) => {
    return state.isPulseActive(notificationId);
  });

  const resolvePulse = usePulseStore((state) => {
    return state.resolvePulse;
  });

  useEffect(() => {
    if (isActive !== true) {
      return;
    }

    const pulseConfig = PULSE_REGISTRY[notificationId];

    if (!pulseConfig) {
      if (import.meta.env.DEV) {
        console.warn(
          `[Pulse System]: Missing registry config for notificationId "${String(notificationId)}".`,
        );
      }

      return;
    }

    if (pulseConfig.resolutionType !== "ROUTE") {
      return;
    }

    const isTargetRoute = doesPathMatchPulseTarget(location.pathname, pulseConfig.targetPath);

    if (!isTargetRoute) {
      return;
    }

    resolvePulse(notificationId);

    if (import.meta.env.DEV) {
      console.info(
        `[Pulse System]: ${notificationId} resolved on target route ${pulseConfig.targetPath}.`,
      );
    }
  }, [isActive, location.pathname, notificationId, resolvePulse]);
}
