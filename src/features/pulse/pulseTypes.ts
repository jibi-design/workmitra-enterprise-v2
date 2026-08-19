/** Job Mitra | pulseTypes.ts | src/features/pulse/pulseTypes.ts */

import type { NotificationId, PulseSectionId, PulseTargetPath } from "./pulseRegistry";

export type PulseNodeId = string;

export type PulseChainSeverity = "info" | "success" | "warning" | "urgent";

export type PulseDomain = "shift" | "career" | "workforce" | "employment" | "admin" | "system";

export type PulseTrailStatus = "TRAIL_STARTED" | "RESOLVING";

export type ActivePulses = Record<string, boolean>;

export type PulseTrailTargetParams = {
  readonly postId?: string;
  readonly appId?: string;
  readonly sectionId?: PulseSectionId;
};

export type PulseTrail = {
  readonly trailId: string;
  readonly id: string;
  readonly eventId: NotificationId;
  readonly domain: PulseDomain;
  readonly severity: PulseChainSeverity;
  readonly targetPath: PulseTargetPath;
  readonly targetParams?: PulseTrailTargetParams;
  readonly status: PulseTrailStatus;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly resolvingStartedAt?: number;
};

export type ActivePulseTrails = Record<string, PulseTrail>;

export type SetPulseChainOptions = {
  readonly severity?: PulseChainSeverity;
  readonly severityByNodeId?: Readonly<Record<PulseNodeId, PulseChainSeverity>>;
  readonly sourceEventId?: NotificationId;
};

export type KnownPulseFlowNotificationType =
  | "new_shift_application"
  | "new_chat_message"
  | "career_interview_scheduled"
  | "new_career_application"
  | "admin_alert"
  | "system_alert";

export type PulseFlowNotificationType = KnownPulseFlowNotificationType | (string & {});

export type TriggerPulseFlowOptions = {
  readonly severity?: PulseChainSeverity;
  readonly severityByNodeId?: Readonly<Record<PulseNodeId, PulseChainSeverity>>;
  readonly sourceEventId?: NotificationId;
  readonly fallbackNodeId?: PulseNodeId;
};

export type PulseFlowBuildResult = {
  readonly chain: PulseNodeId[];
  readonly defaultSeverity: PulseChainSeverity;
};

export type PulseFlowBuilderInput = {
  readonly notificationType: PulseFlowNotificationType;
  readonly targetId?: string;
};

export type PulseFlowBuilder = (input: PulseFlowBuilderInput) => PulseFlowBuildResult;

export type StartPulseTrailInput = {
  readonly eventId: NotificationId;
  readonly domain: PulseDomain;
  readonly targetPath: PulseTargetPath;
  readonly targetParams?: PulseTrailTargetParams;
  readonly severity?: PulseChainSeverity;
};

export type ResolvePulseTrailTargetInput = {
  readonly eventId: NotificationId;
  readonly postId?: string;
  readonly appId?: string;
  readonly sectionId?: PulseSectionId;
};

export type PulseTargetLookupInput = ResolvePulseTrailTargetInput & {
  readonly includeResolving?: boolean;
};

export interface PulseState {
  readonly chain: PulseNodeId[];
  /**
   * Home/root cards that stay lit until destination confirm — survives hop advances.
   */
  readonly pendingGuidanceRoots: PulseNodeId[];
  readonly resolvingNodeId: PulseNodeId | null;
  readonly severityByNodeId: Record<PulseNodeId, PulseChainSeverity>;

  readonly activePulses: ActivePulses;
  readonly activeTrails: ActivePulseTrails;

  readonly setChain: (pathArray: readonly PulseNodeId[], options?: SetPulseChainOptions) => void;
  readonly advanceChain: (options?: { readonly skipArrival?: boolean }) => void;
  readonly confirmPulseDestination: (nodeId: PulseNodeId) => void;
  readonly clearAll: () => void;
  readonly clearAllPulses: () => void;

  readonly triggerPulseFlow: (
    notificationType: PulseFlowNotificationType,
    targetId?: string,
    options?: TriggerPulseFlowOptions,
  ) => PulseNodeId[];

  readonly buildPulseFlow: (
    notificationType: PulseFlowNotificationType,
    targetId?: string,
  ) => PulseNodeId[];

  readonly getCurrentNodeId: () => PulseNodeId | null;
  readonly isNodeActive: (id: PulseNodeId) => boolean;
  readonly isNodeResolving: (id: PulseNodeId) => boolean;
  readonly shouldDimNode: (id: PulseNodeId) => boolean;
  readonly hasActiveChain: () => boolean;
  readonly hasAnyActivePulse: () => boolean;
  readonly getNodeSeverity: (id: PulseNodeId) => PulseChainSeverity;

  readonly activatePulse: (id: NotificationId, severity?: PulseChainSeverity) => void;
  readonly resolvePulse: (id: NotificationId) => void;
  readonly isPulseActive: (id: NotificationId) => boolean;
  readonly getPulseSeverity: (id: NotificationId) => PulseChainSeverity;

  readonly startPulseTrail: (input: StartPulseTrailInput) => void;
  readonly resolvePulseTrail: (trailId: string) => void;
  readonly resolvePulseTrailByTarget: (input: ResolvePulseTrailTargetInput) => void;
  readonly isPulseTargetActive: (input: PulseTargetLookupInput) => boolean;
}

export type HydratedPulseState = Pick<
  PulseState,
  | "chain"
  | "pendingGuidanceRoots"
  | "resolvingNodeId"
  | "severityByNodeId"
  | "activePulses"
  | "activeTrails"
>;
