/** Job Mitra | PulseSectionResolver.tsx | src/features/pulse/PulseSectionResolver.tsx */

import { useCallback, useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { PULSE_REGISTRY, type NotificationId, type PulseSectionId } from "./pulseRegistry";
import { usePulseStore } from "./pulseStore";
import { doesPathMatchPulseTarget } from "./usePulseResolver";

/**
 * PulseSectionResolver
 * -----------------------------------------------------------------------------
 * Common INTERACTION-based resolver for the Pulse Light System.
 *
 * Use this when a pulse should resolve only after a specific section/card becomes
 * visible to the user.
 */

interface PulseSectionResolverProps {
  readonly notificationId: NotificationId;
  readonly sectionId?: PulseSectionId;
  readonly postId?: string;
  readonly appId?: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly threshold?: number;
  readonly rootMargin?: string;
}

const DEFAULT_VISIBILITY_THRESHOLD = 0.5;

export function PulseSectionResolver({
  notificationId,
  sectionId,
  postId,
  appId,
  children,
  className,
  style,
  threshold = DEFAULT_VISIBILITY_THRESHOLD,
  rootMargin = "0px",
}: PulseSectionResolverProps) {
  const location = useLocation();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const hasResolvedRef = useRef<boolean>(false);

  const isPulseActive = usePulseStore((state) => {
    return state.isPulseActive(notificationId);
  });

  const resolvePulseTrailByTarget = usePulseStore((state) => {
    return state.resolvePulseTrailByTarget;
  });

  const pulseConfig = PULSE_REGISTRY[notificationId];

  const resolvedSectionId = useMemo(() => {
    if (!pulseConfig || pulseConfig.resolutionType !== "INTERACTION") {
      return sectionId;
    }

    return sectionId ?? pulseConfig.targetSectionId;
  }, [pulseConfig, sectionId]);

  const canResolvePulse = useCallback((): boolean => {
    if (!pulseConfig) {
      if (import.meta.env.DEV) {
        console.warn(
          `[Pulse System]: Missing registry config for notificationId "${String(notificationId)}".`,
        );
      }

      return false;
    }

    if (pulseConfig.resolutionType !== "INTERACTION") {
      if (import.meta.env.DEV) {
        console.warn(
          `[Pulse System]: PulseSectionResolver received non-INTERACTION pulse "${notificationId}".`,
        );
      }

      return false;
    }

    if (isPulseActive !== true) {
      return false;
    }

    if (hasResolvedRef.current === true) {
      return false;
    }

    if (resolvedSectionId !== pulseConfig.targetSectionId) {
      if (import.meta.env.DEV) {
        console.warn(
          `[Pulse System]: Section mismatch for "${notificationId}". Expected "${pulseConfig.targetSectionId}", received "${String(resolvedSectionId)}".`,
        );
      }

      return false;
    }

    return doesPathMatchPulseTarget(location.pathname, pulseConfig.targetPath);
  }, [isPulseActive, location.pathname, notificationId, pulseConfig, resolvedSectionId]);

  const resolveIfAllowed = useCallback((): void => {
    if (!canResolvePulse()) {
      return;
    }

    if (!pulseConfig || pulseConfig.resolutionType !== "INTERACTION") {
      return;
    }

    resolvePulseTrailByTarget({
      eventId: notificationId,
      postId,
      appId,
      sectionId: pulseConfig.targetSectionId,
    });

    hasResolvedRef.current = true;

    if (import.meta.env.DEV) {
      console.info(
        `[Pulse System]: ${notificationId} resolved by visible section "${pulseConfig.targetSectionId}".`,
      );
    }
  }, [appId, canResolvePulse, notificationId, postId, pulseConfig, resolvePulseTrailByTarget]);

  useEffect(() => {
    const sectionElement = sectionRef.current;

    if (!sectionElement) {
      return;
    }

    if (!pulseConfig || pulseConfig.resolutionType !== "INTERACTION") {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      resolveIfAllowed();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => {
          return entry.isIntersecting && entry.intersectionRatio >= threshold;
        });

        if (isVisible) {
          resolveIfAllowed();
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    );

    observer.observe(sectionElement);

    return () => {
      observer.disconnect();
    };
  }, [pulseConfig, resolveIfAllowed, rootMargin, threshold]);

  return (
    <div
      ref={sectionRef}
      className={className}
      style={style}
      data-pulse-section-id={resolvedSectionId}
      data-pulse-notification-id={notificationId}
      data-pulse-post-id={postId}
      data-pulse-app-id={appId}
    >
      {children}
    </div>
  );
}
