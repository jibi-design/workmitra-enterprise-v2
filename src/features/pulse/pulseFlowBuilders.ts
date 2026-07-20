/** Job Mitra | pulseFlowBuilders.ts | src/features/pulse/pulseFlowBuilders.ts */

import { PULSE_REGISTRY, type NotificationId } from "./pulseRegistry";
import type {
  KnownPulseFlowNotificationType,
  PulseChainSeverity,
  PulseFlowBuildResult,
  PulseFlowBuilder,
  PulseFlowNotificationType,
  PulseNodeId,
} from "./pulseTypes";

export function normalizeSeverityFromRegistry(id: NotificationId): PulseChainSeverity {
  const registrySeverity = PULSE_REGISTRY[id]?.severity;

  if (registrySeverity === "WARNING" || registrySeverity === "CRITICAL") {
    return "urgent";
  }

  return "info";
}

function normalizeTargetId(targetId: string | undefined): string | null {
  if (typeof targetId !== "string") return null;

  const trimmed = targetId.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function buildNodeId(prefix: string, targetId: string | null): PulseNodeId | null {
  if (!targetId) return null;

  return `${prefix}${targetId}`;
}

function compactChain(nodes: readonly (PulseNodeId | null | undefined)[]): PulseNodeId[] {
  const output: PulseNodeId[] = [];

  for (const node of nodes) {
    if (typeof node !== "string") continue;

    const trimmed = node.trim();

    if (trimmed.length === 0) continue;
    if (output.includes(trimmed)) continue;

    output.push(trimmed);
  }

  return output;
}

const PULSE_FLOW_BUILDERS: Readonly<Record<KnownPulseFlowNotificationType, PulseFlowBuilder>> = {
  new_shift_application: ({ targetId }) => {
    const normalizedTargetId = normalizeTargetId(targetId);

    return {
      chain: compactChain([
        "home-shift-card",
        "shift-dashboard-applications",
        buildNodeId("applicant-", normalizedTargetId),
      ]),
      defaultSeverity: "urgent",
    };
  },

  new_chat_message: ({ targetId }) => {
    const normalizedTargetId = normalizeTargetId(targetId);

    return {
      chain: compactChain([
        "topbar-chat-icon",
        "chat-list",
        buildNodeId("chat-user-", normalizedTargetId),
      ]),
      defaultSeverity: "info",
    };
  },

  career_interview_scheduled: ({ targetId }) => {
    const normalizedTargetId = normalizeTargetId(targetId);

    return {
      chain: compactChain([
        "home-career-card",
        "career-funnel-interviews",
        buildNodeId("candidate-", normalizedTargetId),
      ]),
      defaultSeverity: "urgent",
    };
  },

  new_career_application: ({ targetId }) => {
    const normalizedTargetId = normalizeTargetId(targetId);

    return {
      chain: compactChain([
        "home-career-card",
        "career-dashboard-applications",
        buildNodeId("candidate-", normalizedTargetId),
      ]),
      defaultSeverity: "urgent",
    };
  },

  admin_alert: ({ targetId }) => {
    const normalizedTargetId = normalizeTargetId(targetId);

    return {
      chain: compactChain([
        "topbar-admin-alert-icon",
        "admin-alerts-list",
        buildNodeId("admin-alert-", normalizedTargetId),
      ]),
      defaultSeverity: "urgent",
    };
  },

  system_alert: ({ targetId }) => {
    const normalizedTargetId = normalizeTargetId(targetId);

    return {
      chain: compactChain([
        "topbar-notification-icon",
        "system-alerts-list",
        buildNodeId("system-alert-", normalizedTargetId),
      ]),
      defaultSeverity: "info",
    };
  },
};

function isKnownPulseFlowNotificationType(
  notificationType: PulseFlowNotificationType,
): notificationType is KnownPulseFlowNotificationType {
  return Object.prototype.hasOwnProperty.call(PULSE_FLOW_BUILDERS, notificationType);
}

export function buildDynamicPulseFlow(
  notificationType: PulseFlowNotificationType,
  targetId?: string,
): PulseFlowBuildResult {
  if (isKnownPulseFlowNotificationType(notificationType)) {
    return PULSE_FLOW_BUILDERS[notificationType]({
      notificationType,
      targetId,
    });
  }

  const normalizedTargetId = normalizeTargetId(targetId);

  return {
    chain: compactChain([normalizedTargetId]),
    defaultSeverity: "info",
  };
}
