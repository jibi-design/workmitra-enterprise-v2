/**
 * Doc Access ACL — server-side enforcement (P1 STEP 2).
 * Session trust comes only from verified HMAC payload + authenticated employer.
 * Document byte payloads are never accepted or returned on these routes.
 */

import {
  verifyDocAccessSessionSignature,
  type DocAccessSessionSignPayload,
} from "./docAccess.crypto.js";

export type DocAccessVerifiedSession = DocAccessSessionSignPayload & {
  employerId: string;
  employerName: string;
  authUserId: string;
  sig: string;
  revoked: boolean;
};

export type DocAccessAclRequest = {
  documentId: string;
  workerMlId: string;
  folderId?: string;
  employerScopeId?: string;
  /** Forbidden — any presence rejects the request. */
  base64Data?: unknown;
  thumbnailBase64?: unknown;
  payload?: unknown;
  bytes?: unknown;
  dataUrl?: unknown;
};

export type DocAccessAclDenyReason =
  | "missing_session"
  | "invalid_session"
  | "expired"
  | "revoked"
  | "employer_mismatch"
  | "worker_mismatch"
  | "missing_document_id"
  | "byte_payload_forbidden";

export type DocAccessAclResult =
  | { ok: true; session: DocAccessVerifiedSession; documentId: string }
  | { ok: false; reason: DocAccessAclDenyReason };

function sanitizeId(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function normalizeScope(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
}

function hasForbiddenByteFields(body: DocAccessAclRequest): boolean {
  return (
    body.base64Data != null ||
    body.thumbnailBase64 != null ||
    body.payload != null ||
    body.bytes != null ||
    body.dataUrl != null
  );
}

export function parseDocAccessSessionToken(raw: string): DocAccessVerifiedSession | null {
  try {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    let json: string;
    try {
      json = Buffer.from(trimmed, "base64url").toString("utf8");
    } catch {
      json = trimmed;
    }

    const parsed = JSON.parse(json) as Record<string, unknown>;
    const id = sanitizeId(parsed.id);
    const employerScopeId = sanitizeId(parsed.employerScopeId) || sanitizeId(parsed.employerId);
    const workerMlId = sanitizeId(parsed.workerMlId);
    const domain = parsed.domain === "shift" || parsed.domain === "career" ? parsed.domain : null;
    const startedAt = typeof parsed.startedAt === "number" ? parsed.startedAt : NaN;
    const expiresAt = typeof parsed.expiresAt === "number" ? parsed.expiresAt : NaN;
    const challengeHash = sanitizeId(parsed.challengeHash);
    const sig = sanitizeId(parsed.sig);
    const employerName = sanitizeId(parsed.employerName);
    const employerId = sanitizeId(parsed.employerId) || employerScopeId;
    const authUserId = sanitizeId(parsed.authUserId);
    const revoked = parsed.revoked === true;

    if (
      !id ||
      !employerScopeId ||
      !workerMlId ||
      !domain ||
      !challengeHash ||
      !sig ||
      !Number.isFinite(startedAt) ||
      !Number.isFinite(expiresAt)
    ) {
      return null;
    }

    const payload: DocAccessSessionSignPayload = {
      id,
      employerScopeId,
      workerMlId,
      domain,
      startedAt,
      expiresAt,
      challengeHash,
      ...(authUserId ? { authUserId } : {}),
    };

    if (!verifyDocAccessSessionSignature(payload, sig)) return null;

    return {
      ...payload,
      employerId,
      employerName,
      authUserId,
      sig,
      revoked,
    };
  } catch {
    return null;
  }
}

/**
 * Enforce ACL: authenticated employer + HMAC session + worker/document bind.
 * Never authorizes when client smuggles document byte fields.
 */
export function enforceDocAccessAcl(params: {
  authenticatedEmployerId: string;
  authenticatedEmployerWmId?: string;
  sessionToken: string | null | undefined;
  body: DocAccessAclRequest;
}): DocAccessAclResult {
  if (hasForbiddenByteFields(params.body)) {
    return { ok: false, reason: "byte_payload_forbidden" };
  }

  const documentId = sanitizeId(params.body.documentId);
  if (!documentId) return { ok: false, reason: "missing_document_id" };

  const requestedWorker = sanitizeId(params.body.workerMlId);
  if (!requestedWorker) return { ok: false, reason: "worker_mismatch" };

  if (!params.sessionToken || !String(params.sessionToken).trim()) {
    return { ok: false, reason: "missing_session" };
  }

  const session = parseDocAccessSessionToken(String(params.sessionToken));
  if (!session) return { ok: false, reason: "invalid_session" };
  if (session.revoked) return { ok: false, reason: "revoked" };
  if (Date.now() > session.expiresAt) return { ok: false, reason: "expired" };

  if (session.workerMlId !== requestedWorker) {
    return { ok: false, reason: "worker_mismatch" };
  }

  const authEmployer = sanitizeId(params.authenticatedEmployerId);
  const authWm = sanitizeId(params.authenticatedEmployerWmId);
  const sessionScope = normalizeScope(session.employerScopeId);
  const sessionEmployer = normalizeScope(session.employerId);
  const sessionAuth = normalizeScope(session.authUserId);
  const authNorm = normalizeScope(authEmployer);
  const authWmNorm = normalizeScope(authWm);

  // Prefer HMAC-bound authUserId (AUTH-on sessions). Fallback: scope/id equality.
  const employerOk =
    (sessionAuth && authNorm && sessionAuth === authNorm) ||
    (authNorm && (authNorm === sessionScope || authNorm === sessionEmployer)) ||
    (authWmNorm && (authWmNorm === sessionScope || authWmNorm === sessionEmployer));

  if (!employerOk) {
    return { ok: false, reason: "employer_mismatch" };
  }

  const requestedScope = sanitizeId(params.body.employerScopeId);
  if (requestedScope && normalizeScope(requestedScope) !== sessionScope) {
    return { ok: false, reason: "employer_mismatch" };
  }

  return { ok: true, session, documentId };
}
