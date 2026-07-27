/** Job Mitra | pulseEventBridge.utils.ts | src/features/pulse/pulseEventBridge.utils.ts */

import {
  PULSE_BACKEND_EVENT_TYPES,
  type PulseAffectedUserRole,
  type PulseBackendEventType,
  type PulseEventDomain,
  type PulseEventSeverity,
} from "./pulseRegistry";
import type { GlobalPulseEventPayload, GlobalPulseEventType } from "./pulseEventBridge.types";
import type { PulseChainSeverity, PulseDomain, PulseNodeId } from "./pulseStore";

export function cleanId(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

export function createBatchKey(payload: GlobalPulseEventPayload): string {
  const target =
    cleanId(payload.targetId) ?? cleanId(payload.postId) ?? cleanId(payload.appId) ?? "";

  return target.length > 0
    ? `${payload.affectedUserRole}:${payload.domain}:${payload.type}:${target}`
    : `${payload.affectedUserRole}:${payload.domain}:${payload.type}`;
}

export function createQueueId(payload: GlobalPulseEventPayload): string {
  return `${createBatchKey(payload)}:${Date.now()}`;
}

export function compactChain(nodes: readonly (PulseNodeId | undefined)[]): PulseNodeId[] {
  const output: PulseNodeId[] = [];

  for (const node of nodes) {
    if (!node) continue;

    const normalizedNode = node.trim();

    if (!normalizedNode) continue;
    if (output.includes(normalizedNode)) continue;

    output.push(normalizedNode);
  }

  return output;
}

export function toPulseSeverity(value: PulseEventSeverity): PulseChainSeverity {
  if (value === "success") return "success";
  if (value === "warning") return "warning";
  if (value === "urgent") return "urgent";

  return "info";
}

export function isPulseDomain(value: PulseEventDomain): value is PulseDomain {
  return (
    value === "shift" ||
    value === "career" ||
    value === "workforce" ||
    value === "employment" ||
    value === "admin" ||
    value === "system"
  );
}

export function replaceRouteToken(
  token: string,
  payload: GlobalPulseEventPayload,
): string | undefined {
  const targetId = cleanId(payload.targetId);
  const postId = cleanId(payload.postId ?? payload.targetId);
  const appId = cleanId(payload.appId);

  return token
    .replaceAll("{targetId}", targetId ?? "")
    .replaceAll("{postId}", postId ?? "")
    .replaceAll("{appId}", appId ?? "");
}

export function isSameChainOrContinuation(
  currentChain: readonly PulseNodeId[],
  nextChain: readonly PulseNodeId[],
): boolean {
  if (currentChain.length === 0) return false;
  if (nextChain.length === 0) return false;

  const offset = nextChain.length - currentChain.length;

  if (offset < 0) return false;

  return currentChain.every((nodeId, index) => {
    return nodeId === nextChain[offset + index];
  });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function readSeverity(value: unknown): PulseChainSeverity | undefined {
  if (value === "info" || value === "success" || value === "warning" || value === "urgent") {
    return value;
  }

  return undefined;
}

export function readRole(value: unknown): PulseAffectedUserRole | undefined {
  if (value === "employee" || value === "employer" || value === "admin") {
    return value;
  }

  return undefined;
}

export function readDomain(value: unknown): PulseDomain | undefined {
  if (
    value === "shift" ||
    value === "career" ||
    value === "workforce" ||
    value === "employment" ||
    value === "admin" ||
    value === "system"
  ) {
    return value;
  }

  return undefined;
}

export function readEventType(value: unknown): GlobalPulseEventType | undefined {
  if (typeof value !== "string") return undefined;

  return PULSE_BACKEND_EVENT_TYPES.includes(value as PulseBackendEventType)
    ? (value as PulseBackendEventType)
    : undefined;
}
