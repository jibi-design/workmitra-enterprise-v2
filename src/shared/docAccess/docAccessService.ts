/**
 * Doc Access client gate — P1 STEP 2.
 * When AUTH_BACKEND_ENABLED, authorize each documentId against server ACL
 * before local reveal. Never sends document bytes to the server.
 */

import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { apiService } from "../services/apiService";
import { docAccessSessionStorage, type DocAccessSession } from "./docAccessSessionStorage";

const DOC_ACCESS_AUTHORIZE = "/v1/jobmitra/employer/doc-access/documents/access";

type ApiEnvelope<T> = { data: T; requestId?: string };

export type DocAccessAuthorizeResult = {
  allowed: boolean;
  documentId: string;
  workerMlId: string;
  employerScopeId: string;
  bytes: null;
};

function encodeSessionToken(session: DocAccessSession): string {
  const json = JSON.stringify({
    id: session.id,
    employerId: session.employerId,
    employerScopeId: session.employerScopeId,
    employerName: session.employerName,
    workerMlId: session.workerMlId,
    domain: session.domain,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt,
    revoked: session.revoked,
    challengeHash: session.challengeHash,
    sig: session.sig,
    ...(session.authUserId ? { authUserId: session.authUserId } : {}),
  });

  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export const docAccessService = {
  /**
   * Authorize access to a document under the active HMAC session.
   * AUTH off: local session bind only (demo/E2E).
   * AUTH on: server ACL required; fails closed on network/ACL error.
   */
  async authorizeDocumentAccess(params: {
    documentId: string;
    workerMlId: string;
    folderId?: string;
    employerScopeId?: string;
  }): Promise<boolean> {
    const documentId = params.documentId.trim();
    const workerMlId = params.workerMlId.trim();
    if (!documentId || !workerMlId) return false;

    const session = docAccessSessionStorage.getActiveSession();
    if (!session || session.workerMlId !== workerMlId) return false;

    if (!AUTH_BACKEND_ENABLED) return true;

    try {
      const res = await apiService.post<ApiEnvelope<DocAccessAuthorizeResult>>(
        DOC_ACCESS_AUTHORIZE,
        {
          documentId,
          workerMlId,
          ...(params.folderId ? { folderId: params.folderId } : {}),
          ...(params.employerScopeId || session.employerScopeId
            ? { employerScopeId: params.employerScopeId || session.employerScopeId }
            : {}),
        },
        {
          "X-Doc-Access-Session": encodeSessionToken(session),
        },
      );
      return res?.data?.allowed === true && res.data.documentId === documentId;
    } catch {
      return false;
    }
  },

  /**
   * Filter documents to those the server ACL allows (AUTH on).
   * AUTH off: returns input unchanged when local session is active.
   */
  async filterAuthorizedDocuments<T extends { id: string; folderId?: string }>(
    workerMlId: string,
    documents: T[],
    employerScopeId?: string,
  ): Promise<T[]> {
    if (!AUTH_BACKEND_ENABLED) return documents;

    const allowed: T[] = [];
    for (const doc of documents) {
      const ok = await this.authorizeDocumentAccess({
        documentId: doc.id,
        workerMlId,
        folderId: doc.folderId,
        employerScopeId,
      });
      if (ok) allowed.push(doc);
    }
    return allowed;
  },
};
