/** Job Mitra | PulseSectionResolver.tsx | Destination click confirm (not viewport) */

import { useCallback, useMemo, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { PULSE_REGISTRY, type NotificationId, type PulseSectionId } from "./pulseRegistry";
import { usePulseStore } from "./pulseStore";
import { doesPathMatchPulseTarget } from "./usePulseResolver";

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

export function PulseSectionResolver({
  notificationId,
  sectionId,
  postId,
  appId,
  children,
  className,
  style,
}: PulseSectionResolverProps) {
  const location = useLocation();
  const isPulseActive = usePulseStore((state) => state.isPulseActive(notificationId));
  const resolvePulseTrailByTarget = usePulseStore((state) => state.resolvePulseTrailByTarget);
  const pulseConfig = PULSE_REGISTRY[notificationId];

  const resolvedSectionId = useMemo(() => {
    if (!pulseConfig || pulseConfig.resolutionType !== "INTERACTION") return sectionId;
    return sectionId ?? pulseConfig.targetSectionId;
  }, [pulseConfig, sectionId]);

  const confirmDestination = useCallback((): void => {
    if (!pulseConfig || pulseConfig.resolutionType !== "INTERACTION") return;
    if (isPulseActive !== true) return;
    if (resolvedSectionId !== pulseConfig.targetSectionId) return;
    if (!doesPathMatchPulseTarget(location.pathname, pulseConfig.targetPath)) return;

    resolvePulseTrailByTarget({
      eventId: notificationId,
      postId,
      appId,
      sectionId: pulseConfig.targetSectionId,
    });
  }, [
    appId,
    isPulseActive,
    location.pathname,
    notificationId,
    postId,
    pulseConfig,
    resolvePulseTrailByTarget,
    resolvedSectionId,
  ]);

  return (
    <div
      className={className}
      style={style}
      data-pulse-section-id={resolvedSectionId}
      data-pulse-notification-id={notificationId}
      data-pulse-post-id={postId}
      data-pulse-app-id={appId}
      onClickCapture={confirmDestination}
    >
      {children}
    </div>
  );
}
