/** Document Access OTP — Shift + Career; never persist plaintext codes.
 * B-P0-2: verify() binds workerMlId (+ employerScopeId) before issuing a signed session grant.
 * B-P1-5: AUTH on → server Argon2 vault OTP generate/verify (same path as HR Work Vault).
 */

import { DOC_ACCESS_OTP_CODE_LENGTH, DOC_ACCESS_OTP_VALIDITY_MS } from "./docAccessConstants";
import { hashOtpCode, otpCodesMatch } from "../security/otpCodeHash";
import { DOC_ACCESS_SESSION_DURATION_MS } from "./docAccessConstants";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import {
  generateOtp as generateVaultOtp,
  verifyOtpViaApi,
} from "../../features/employee/workVault/services/vaultOtpService";

const DOC_OTP_KEY = "wm_doc_access_otp_v1";
const DOC_OTP_PENDING_REQUEST_KEY = "wm_doc_access_otp_pending_request_v1";
const EMP_NOTES_KEY = "wm_employee_notifications_v1";
const CHANGED_EVENT = "wm:doc-access-otp-changed";
const PENDING_REQUEST_TTL_MS = 30 * 60 * 1000;
const VAULT_CHALLENGE_PREFIX = "vault:";

export type DocAccessOtp = {
  /** Same-tab only when freshly generated; empty after reload. */
  code: string;
  generatedAt: number;
  expiresAt: number;
  used: boolean;
  employerName: string;
  employerId: string;
  domain: "shift" | "career";
  /** Canonical worker bind (preferred). */
  workerMlId: string;
  /** @deprecated Alias of workerMlId for legacy callers. */
  workerWmId: string;
  /** Present when OTP was minted via server Argon2 vault path (AUTH on). */
  serverOtpId?: string;
};

type StoredOtpChallenge = {
  codeHash: string;
  generatedAt: number;
  expiresAt: number;
  used: boolean;
  employerName: string;
  employerId: string;
  domain: "shift" | "career";
  workerMlId: string;
  /** Server vault OTP id when AUTH path was used. */
  serverOtpId?: string;
};

export type DocAccessSessionGrant = {
  grantId: string;
  employerScopeId: string;
  workerMlId: string;
  domain: "shift" | "career";
  challengeHash: string;
  expiresAt: number;
};

let memoryPlain: { code: string; expiresAt: number } | null = null;
let pendingSessionGrant: DocAccessSessionGrant | null = null;

function scrubLegacyPlaintext(): void {
  try {
    const raw = localStorage.getItem(DOC_OTP_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { code?: string; codeHash?: string };
    if (typeof parsed?.code === "string" || typeof parsed?.codeHash !== "string") {
      localStorage.removeItem(DOC_OTP_KEY);
    }
  } catch {
    try {
      localStorage.removeItem(DOC_OTP_KEY);
    } catch {
      /* ignore */
    }
  }
}

scrubLegacyPlaintext();

function generateCode(): string {
  const array = new Uint8Array(DOC_ACCESS_OTP_CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => (byte % 10).toString()).join("");
}

function pickWorkerId(rec: Partial<StoredOtpChallenge> & { workerWmId?: string }): string {
  if (typeof rec.workerMlId === "string" && rec.workerMlId.trim()) return rec.workerMlId.trim();
  if (typeof rec.workerWmId === "string" && rec.workerWmId.trim()) return rec.workerWmId.trim();
  return "";
}

function safeRead(): StoredOtpChallenge | null {
  try {
    const raw = localStorage.getItem(DOC_OTP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredOtpChallenge> & { workerWmId?: string };
    const workerMlId = pickWorkerId(parsed);
    if (
      typeof parsed.codeHash !== "string" ||
      typeof parsed.generatedAt !== "number" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.employerName !== "string" ||
      typeof parsed.employerId !== "string" ||
      (parsed.domain !== "shift" && parsed.domain !== "career") ||
      !workerMlId
    ) {
      return null;
    }
    return {
      codeHash: parsed.codeHash,
      generatedAt: parsed.generatedAt,
      expiresAt: parsed.expiresAt,
      used: Boolean(parsed.used),
      employerName: parsed.employerName,
      employerId: parsed.employerId,
      domain: parsed.domain,
      workerMlId,
      ...(typeof parsed.serverOtpId === "string" && parsed.serverOtpId.trim()
        ? { serverOtpId: parsed.serverOtpId.trim() }
        : {}),
    };
  } catch {
    return null;
  }
}

function safeWrite(challenge: StoredOtpChallenge | null): void {
  try {
    if (challenge === null) {
      localStorage.removeItem(DOC_OTP_KEY);
    } else {
      localStorage.setItem(DOC_OTP_KEY, JSON.stringify(challenge));
    }
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    /* Phase-0 storage guard */
  }
}

function toPublic(challenge: StoredOtpChallenge): DocAccessOtp {
  const code = memoryPlain && memoryPlain.expiresAt === challenge.expiresAt ? memoryPlain.code : "";
  return {
    code,
    generatedAt: challenge.generatedAt,
    expiresAt: challenge.expiresAt,
    used: challenge.used,
    employerName: challenge.employerName,
    employerId: challenge.employerId,
    domain: challenge.domain,
    workerMlId: challenge.workerMlId,
    workerWmId: challenge.workerMlId,
    ...(challenge.serverOtpId ? { serverOtpId: challenge.serverOtpId } : {}),
  };
}

function isVaultBackedChallenge(challenge: StoredOtpChallenge): boolean {
  return Boolean(challenge.serverOtpId) || challenge.codeHash.startsWith(VAULT_CHALLENGE_PREFIX);
}

function pushEmployeeNotification(
  employerName: string,
  domain: "shift" | "career",
  kind: "request" | "code_ready" = "request",
): void {
  try {
    const existing = JSON.parse(localStorage.getItem(EMP_NOTES_KEY) ?? "[]") as object[];
    const note =
      kind === "code_ready"
        ? {
            id: `n_dotp_${Date.now().toString(16)}`,
            domain,
            title: "Document access code ready",
            body: `Your one-time code for ${employerName} is ready on Share Access. It is valid for 5 minutes and is not stored in plain text after you leave this screen.`,
            createdAt: Date.now(),
            isRead: false,
            route: "/employee/vault/otp",
          }
        : {
            id: `n_dotp_${Date.now().toString(16)}`,
            domain,
            title: "Document access requested",
            body: `${employerName} wants to view your documents. Open Work Vault → Share Access and tap Generate Access Code. Valid request window: 30 minutes.`,
            createdAt: Date.now(),
            isRead: false,
            route: "/employee/vault/otp",
          };
    localStorage.setItem(EMP_NOTES_KEY, JSON.stringify([note, ...existing].slice(0, 100)));
    window.dispatchEvent(new Event("wm:employee-notifications-changed"));
  } catch {
    /* Phase-0 storage guard */
  }
}

function normalizeWorkerId(raw: string): string {
  return raw.trim();
}

export type DocAccessPendingRequest = {
  employerName: string;
  employerId: string;
  domain: "shift" | "career";
  workerMlId: string;
  requestedAt: number;
  expiresAt: number;
};

function readPendingRequest(): DocAccessPendingRequest | null {
  try {
    const raw = localStorage.getItem(DOC_OTP_PENDING_REQUEST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DocAccessPendingRequest>;
    if (
      typeof parsed.employerName !== "string" ||
      typeof parsed.employerId !== "string" ||
      (parsed.domain !== "shift" && parsed.domain !== "career") ||
      typeof parsed.workerMlId !== "string" ||
      typeof parsed.requestedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(DOC_OTP_PENDING_REQUEST_KEY);
      return null;
    }
    return {
      employerName: parsed.employerName,
      employerId: parsed.employerId,
      domain: parsed.domain,
      workerMlId: parsed.workerMlId,
      requestedAt: parsed.requestedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

function writePendingRequest(request: DocAccessPendingRequest | null): void {
  try {
    if (!request) {
      localStorage.removeItem(DOC_OTP_PENDING_REQUEST_KEY);
    } else {
      localStorage.setItem(DOC_OTP_PENDING_REQUEST_KEY, JSON.stringify(request));
    }
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    /* Phase-0 storage guard */
  }
}

export type DocAccessVerifyOptions = {
  workerMlId: string;
  employerScopeId: string;
};

export const docAccessOtpService = {
  /**
   * B-P0-4: Employer Career/Shift review registers a pending access request.
   * Does not create an OTP code — employee must Generate Access Code on Share Access.
   */
  requestAccess(params: {
    employerName: string;
    employerId: string;
    domain: "shift" | "career";
    workerMlId: string;
  }): DocAccessPendingRequest {
    const workerMlId = normalizeWorkerId(params.workerMlId);
    const employerId = normalizeWorkerId(params.employerId);
    if (!workerMlId || !employerId) {
      throw new Error("[WorkMitra] Doc Access request requires employerId and workerMlId.");
    }

    const now = Date.now();
    const request: DocAccessPendingRequest = {
      employerName: params.employerName.trim() || "Employer",
      employerId,
      domain: params.domain,
      workerMlId,
      requestedAt: now,
      expiresAt: now + PENDING_REQUEST_TTL_MS,
    };
    writePendingRequest(request);
    pushEmployeeNotification(request.employerName, request.domain, "request");
    return request;
  },

  getPendingRequest(): DocAccessPendingRequest | null {
    return readPendingRequest();
  },

  getPendingRequestForWorker(workerMlId: string): DocAccessPendingRequest | null {
    const pending = readPendingRequest();
    if (!pending) return null;
    if (pending.workerMlId !== normalizeWorkerId(workerMlId)) return null;
    return pending;
  },

  clearPendingRequest(): void {
    writePendingRequest(null);
  },

  async generate(params: {
    employerName: string;
    employerId: string;
    domain: "shift" | "career";
    workerMlId?: string;
    /** @deprecated Prefer workerMlId */
    workerWmId?: string;
  }): Promise<DocAccessOtp> {
    const workerMlId = normalizeWorkerId(params.workerMlId || params.workerWmId || "");
    if (!workerMlId) {
      throw new Error("[WorkMitra] Doc Access OTP requires workerMlId.");
    }

    const employerName = params.employerName.trim() || "Employer";
    const employerId = normalizeWorkerId(params.employerId);

    // B-P1-5: AUTH on — mint via server Argon2 vault OTP (no client-only hash SoT).
    if (AUTH_BACKEND_ENABLED) {
      const vaultResult = await generateVaultOtp();
      if (!vaultResult.ok) {
        const detail =
          vaultResult.reason === "no_visible_folders"
            ? "Make at least one folder visible before generating an access code."
            : (vaultResult.message ?? "Could not generate a server access code.");
        throw new Error(`[WorkMitra] ${detail}`);
      }

      const otp = vaultResult.otp;
      const serverOtpId = otp.otpId?.trim() || `vault_${otp.expiresAt}`;
      const challenge: StoredOtpChallenge = {
        codeHash: `${VAULT_CHALLENGE_PREFIX}${serverOtpId}`,
        generatedAt: otp.generatedAt,
        expiresAt: otp.expiresAt,
        used: false,
        employerName,
        employerId,
        domain: params.domain,
        workerMlId,
        serverOtpId,
      };

      memoryPlain = { code: otp.code, expiresAt: otp.expiresAt };
      pendingSessionGrant = null;
      safeWrite(challenge);
      writePendingRequest(null);
      pushEmployeeNotification(employerName, params.domain, "code_ready");
      return toPublic(challenge);
    }

    const now = Date.now();
    const code = generateCode();
    const expiresAt = now + DOC_ACCESS_OTP_VALIDITY_MS;
    const challenge: StoredOtpChallenge = {
      codeHash: await hashOtpCode(code),
      generatedAt: now,
      expiresAt,
      used: false,
      employerName,
      employerId,
      domain: params.domain,
      workerMlId,
    };

    memoryPlain = { code, expiresAt };
    pendingSessionGrant = null;
    safeWrite(challenge);
    writePendingRequest(null);
    pushEmployeeNotification(employerName, params.domain, "code_ready");

    return toPublic(challenge);
  },

  /**
   * B-P0-4: Employee Share Access — generate OTP for the pending employer request.
   */
  async generateForPendingWorker(workerMlId: string): Promise<DocAccessOtp> {
    const pending = this.getPendingRequestForWorker(workerMlId);
    if (!pending) {
      throw new Error(
        "[WorkMitra] No pending document access request. Ask the employer to open document review first.",
      );
    }
    return this.generate({
      employerName: pending.employerName,
      employerId: pending.employerId,
      domain: pending.domain,
      workerMlId: pending.workerMlId,
    });
  },

  getCurrent(): DocAccessOtp | null {
    const challenge = safeRead();
    if (!challenge) {
      memoryPlain = null;
      return null;
    }
    if (Date.now() > challenge.expiresAt) {
      memoryPlain = null;
      safeWrite(null);
      return null;
    }
    if (challenge.used) return null;
    return toPublic(challenge);
  },

  /**
   * Verify OTP and issue a one-shot session grant bound to (employerScopeId, workerMlId).
   * AUTH on: server Argon2 vault verify, then mint HMAC grant from vault session id.
   * Grant must be consumed by docAccessSessionStorage.createSession.
   */
  async verify(submittedCode: string, options?: DocAccessVerifyOptions): Promise<boolean> {
    const challenge = safeRead();
    if (!challenge || challenge.used) return false;
    if (Date.now() > challenge.expiresAt) {
      memoryPlain = null;
      pendingSessionGrant = null;
      safeWrite(null);
      return false;
    }

    const expectedWorker = normalizeWorkerId(options?.workerMlId ?? "");
    if (!expectedWorker || expectedWorker !== challenge.workerMlId) {
      return false;
    }

    const employerScopeId = normalizeWorkerId(options?.employerScopeId ?? "");
    if (!employerScopeId) return false;

    const challengeEmployer = normalizeWorkerId(challenge.employerId);
    if (
      challengeEmployer &&
      challengeEmployer !== employerScopeId &&
      challengeEmployer.replace(/[^a-zA-Z0-9_-]/g, "_") !==
        employerScopeId.replace(/[^a-zA-Z0-9_-]/g, "_")
    ) {
      return false;
    }

    if (AUTH_BACKEND_ENABLED || isVaultBackedChallenge(challenge)) {
      const api = await verifyOtpViaApi({
        code: submittedCode.trim(),
        employeeRouteId: challenge.workerMlId,
        employerName: challenge.employerName,
        employerMlId: employerScopeId,
      });
      if (!api.ok) return false;

      memoryPlain = null;
      safeWrite({ ...challenge, used: true });

      const challengeHash = await hashOtpCode(
        `vault_session:${api.sessionId}|${challenge.workerMlId}|${employerScopeId}|${challenge.domain}`,
      );

      pendingSessionGrant = {
        grantId: `dag_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
        employerScopeId,
        workerMlId: challenge.workerMlId,
        domain: challenge.domain,
        challengeHash,
        expiresAt: Math.min(api.expiresAt, Date.now() + DOC_ACCESS_SESSION_DURATION_MS),
      };

      return true;
    }

    if (!(await otpCodesMatch(submittedCode, challenge.codeHash))) return false;

    memoryPlain = null;
    safeWrite({ ...challenge, used: true });

    pendingSessionGrant = {
      grantId: `dag_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
      employerScopeId,
      workerMlId: challenge.workerMlId,
      domain: challenge.domain,
      challengeHash: challenge.codeHash,
      expiresAt: Date.now() + DOC_ACCESS_SESSION_DURATION_MS,
    };

    return true;
  },

  /** Consume one-shot grant after successful verify (or null if missing/expired/mismatched). */
  consumeSessionGrant(expected: {
    employerScopeId: string;
    workerMlId: string;
    domain: "shift" | "career";
  }): DocAccessSessionGrant | null {
    const grant = pendingSessionGrant;
    pendingSessionGrant = null;
    if (!grant) return null;
    if (Date.now() > grant.expiresAt) return null;
    if (grant.employerScopeId !== expected.employerScopeId.trim()) return null;
    if (grant.workerMlId !== expected.workerMlId.trim()) return null;
    if (grant.domain !== expected.domain) return null;
    return grant;
  },

  peekSessionGrant(): DocAccessSessionGrant | null {
    if (!pendingSessionGrant) return null;
    if (Date.now() > pendingSessionGrant.expiresAt) {
      pendingSessionGrant = null;
      return null;
    }
    return pendingSessionGrant;
  },

  isActive(): boolean {
    const challenge = safeRead();
    if (!challenge || challenge.used) return false;
    return Date.now() <= challenge.expiresAt;
  },

  getRemainingMs(): number {
    const challenge = safeRead();
    if (!challenge || challenge.used) return 0;
    const remainingMs = challenge.expiresAt - Date.now();
    return remainingMs > 0 ? remainingMs : 0;
  },

  clear(): void {
    memoryPlain = null;
    pendingSessionGrant = null;
    safeWrite(null);
    writePendingRequest(null);
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(CHANGED_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGED_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },

  CHANGED_EVENT,
} as const;
