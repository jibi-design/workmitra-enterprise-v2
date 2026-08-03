/**
 * Append-only employer selection audit trail.
 * Key: wm_employer_{scopeId}_selection_audit_v1
 */

import {
  getShiftEmployerScopeId,
  resolveShiftEmployerScopedKey,
  shiftEmployerScopedKey,
} from "./shiftEmployerScope";
import { assertCanAccessShiftEmployerScope } from "./shiftTenantAuthGuard";

export type SelectionAuditAction = "shortlist" | "reject" | "direct_invite" | "confirm";

export type SelectionAuditEvent = {
  id: string;
  at: number;
  employerScopeId: string;
  candidateId: string;
  action: SelectionAuditAction;
  postId: string;
  /** Optional application / invite correlation id */
  appId?: string;
  inviteId?: string;
};

const CHANGED = "wm:employer-selection-audit-changed";
const MAX_EVENTS = 500;

function genId(): string {
  return `sel_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function readRaw(key: string): SelectionAuditEvent[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAuditEvent);
  } catch {
    return [];
  }
}

function isAuditEvent(value: unknown): value is SelectionAuditEvent {
  if (typeof value !== "object" || value === null) return false;
  const rec = value as Record<string, unknown>;
  return (
    typeof rec.id === "string" &&
    typeof rec.at === "number" &&
    typeof rec.employerScopeId === "string" &&
    typeof rec.candidateId === "string" &&
    typeof rec.postId === "string" &&
    (rec.action === "shortlist" ||
      rec.action === "reject" ||
      rec.action === "direct_invite" ||
      rec.action === "confirm")
  );
}

function auditKey(scopeId?: string): string {
  if (scopeId) {
    assertCanAccessShiftEmployerScope(scopeId);
    return shiftEmployerScopedKey("selection_audit_v1", scopeId);
  }
  return resolveShiftEmployerScopedKey("selection_audit_v1");
}

/**
 * Append one selection decision. Never mutates prior events (append-only).
 */
export function appendSelectionAuditEvent(input: {
  action: SelectionAuditAction;
  postId: string;
  candidateId: string;
  appId?: string;
  inviteId?: string;
  employerScopeId?: string;
}): SelectionAuditEvent | null {
  const candidateId = input.candidateId.trim();
  const postId = input.postId.trim();
  if (!candidateId || !postId) return null;

  try {
    const employerScopeId = input.employerScopeId
      ? input.employerScopeId
      : getShiftEmployerScopeId();
    assertCanAccessShiftEmployerScope(employerScopeId);

    const key = auditKey(employerScopeId);
    const prior = readRaw(key);
    const event: SelectionAuditEvent = {
      id: genId(),
      at: Date.now(),
      employerScopeId,
      candidateId,
      action: input.action,
      postId,
      appId: input.appId?.trim() || undefined,
      inviteId: input.inviteId?.trim() || undefined,
    };

    // Newest first; never rewrite older rows in place.
    const next = [event, ...prior].slice(0, MAX_EVENTS);
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGED));
    return event;
  } catch {
    return null;
  }
}

export function listSelectionAuditEvents(limit = 100): SelectionAuditEvent[] {
  try {
    const key = auditKey();
    return readRaw(key).slice(0, Math.max(1, limit));
  } catch {
    return [];
  }
}

export function subscribeSelectionAudit(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(CHANGED, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGED, handler);
    window.removeEventListener("storage", handler);
  };
}

export const SELECTION_AUDIT_CHANGED_EVENT = CHANGED;
