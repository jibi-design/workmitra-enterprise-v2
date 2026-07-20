/** Job Mitra | PulseTrailProvider.tsx | src/features/pulse/PulseTrailProvider.tsx */

import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import {
  PULSE_REGISTRY,
  type NotificationId,
  type PulseConfig,
  type PulseTargetPath,
} from "./pulseRegistry";
import {
  usePulseStore,
  type ActivePulseTrails,
  type ActivePulses,
  type PulseTrailTargetParams,
} from "./pulseStore";
import { getPulseRouteParams, type PulseRouteParams } from "./usePulseResolver";

/**
 * PulseTrailProvider
 * -----------------------------------------------------------------------------
 * Common ROUTE-based resolver for the Pulse Trail system.
 *
 * Mount this once inside the router tree.
 *
 * It watches route changes and resolves ROUTE-based pulses only when:
 * - the event is active
 * - the current route matches the configured target route
 * - postId/appId params match the active trail memory, when provided
 *
 * This avoids adding route resolver logic inside individual pages.
 */

interface PulseTrailProviderProps {
  readonly children: ReactNode;
}

const getRegistryEntries = (): readonly [NotificationId, PulseConfig][] => {
  return Object.entries(PULSE_REGISTRY) as readonly [NotificationId, PulseConfig][];
};

const hasActiveTrailForEvent = (
  activeTrails: ActivePulseTrails,
  eventId: NotificationId,
): boolean => {
  return Object.values(activeTrails).some((trail) => {
    return trail.eventId === eventId && trail.status === "TRAIL_STARTED";
  });
};

const doesRouteParamValueMatch = (
  routeParams: PulseRouteParams,
  paramName: string,
  expectedValue: string | undefined,
): boolean => {
  if (expectedValue === undefined) {
    return true;
  }

  return routeParams[paramName] === expectedValue;
};

const doRouteParamsMatchTrailTarget = (
  routeParams: PulseRouteParams,
  targetParams: PulseTrailTargetParams | undefined,
): boolean => {
  if (!targetParams) {
    return true;
  }

  return (
    doesRouteParamValueMatch(routeParams, "postId", targetParams.postId) &&
    doesRouteParamValueMatch(routeParams, "appId", targetParams.appId)
  );
};

const resolveRouteBasedTrailInstances = ({
  pathname,
  activeTrails,
  resolvePulseTrail,
}: {
  readonly pathname: string;
  readonly activeTrails: ActivePulseTrails;
  readonly resolvePulseTrail: (trailId: string) => void;
}): void => {
  Object.values(activeTrails).forEach((trail) => {
    if (trail.status !== "TRAIL_STARTED") {
      return;
    }

    const pulseConfig = PULSE_REGISTRY[trail.eventId];

    if (!pulseConfig || pulseConfig.resolutionType !== "ROUTE") {
      return;
    }

    const targetPath: PulseTargetPath = trail.targetPath ?? pulseConfig.targetPath;
    const routeParams = getPulseRouteParams(pathname, targetPath);

    if (!routeParams) {
      return;
    }

    if (!doRouteParamsMatchTrailTarget(routeParams, trail.targetParams)) {
      return;
    }

    resolvePulseTrail(trail.trailId);
  });
};

const resolveLegacyRouteBasedPulses = ({
  pathname,
  activePulses,
  activeTrails,
  resolvePulse,
}: {
  readonly pathname: string;
  readonly activePulses: ActivePulses;
  readonly activeTrails: ActivePulseTrails;
  readonly resolvePulse: (eventId: NotificationId) => void;
}): void => {
  getRegistryEntries().forEach(([eventId, pulseConfig]) => {
    if (pulseConfig.resolutionType !== "ROUTE") {
      return;
    }

    if (activePulses[eventId] !== true) {
      return;
    }

    if (hasActiveTrailForEvent(activeTrails, eventId)) {
      return;
    }

    const routeParams = getPulseRouteParams(pathname, pulseConfig.targetPath);

    if (!routeParams) {
      return;
    }

    resolvePulse(eventId);
  });
};

export function PulseTrailProvider({ children }: PulseTrailProviderProps) {
  const location = useLocation();

  const activePulses = usePulseStore((state) => {
    return state.activePulses;
  });

  const activeTrails = usePulseStore((state) => {
    return state.activeTrails;
  });

  const resolvePulse = usePulseStore((state) => {
    return state.resolvePulse;
  });

  const resolvePulseTrail = usePulseStore((state) => {
    return state.resolvePulseTrail;
  });

  useEffect(() => {
    resolveRouteBasedTrailInstances({
      pathname: location.pathname,
      activeTrails,
      resolvePulseTrail,
    });

    resolveLegacyRouteBasedPulses({
      pathname: location.pathname,
      activePulses,
      activeTrails,
      resolvePulse,
    });
  }, [activePulses, activeTrails, location.pathname, resolvePulse, resolvePulseTrail]);

  return <>{children}</>;
}
