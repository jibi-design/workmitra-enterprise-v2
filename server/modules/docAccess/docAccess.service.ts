/**
 * Doc Access service — authorize document access under HMAC session ACL.
 */

import { enforceDocAccessAcl, type DocAccessAclRequest } from "./docAccess.acl.js";

export type AuthorizeDocAccessParams = {
  authenticatedEmployerId: string;
  authenticatedEmployerWmId?: string;
  sessionToken: string | null | undefined;
  body: DocAccessAclRequest;
};

export function authorizeDocAccess(params: AuthorizeDocAccessParams) {
  return enforceDocAccessAcl(params);
}
