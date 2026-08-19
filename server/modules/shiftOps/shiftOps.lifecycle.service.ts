import type { AuthUser } from "../auth/types.js";
import { employerShiftRepository } from "../employer/shift/shift.repository.js";
import { shiftOpsRepository } from "./shiftOps.repository.js";

type ShiftOpsResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; httpStatus: number };

function asUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

export const shiftOpsLifecycleService = {
  async completeWorkspace(
    workspaceId: string,
    employer: AuthUser,
  ): Promise<ShiftOpsResult<{ workspace: Record<string, unknown> }>> {
    if (!asUuid(workspaceId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid workspace", httpStatus: 400 };
    }
    const workspace = await employerShiftRepository.completeWorkspaceForEmployer(
      workspaceId,
      employer.id,
    );
    if (!workspace) {
      return { ok: false, code: "NOT_FOUND", message: "Workspace not found", httpStatus: 404 };
    }
    return { ok: true, data: { workspace: { ...workspace } } };
  },

  async listReviews(
    user: AuthUser,
  ): Promise<ShiftOpsResult<{ reviews: Record<string, unknown>[] }>> {
    const rows = await shiftOpsRepository.listReviewsForUser(user.id);
    return {
      ok: true,
      data: {
        reviews: rows.map((row) => ({
          ...row,
          created_at:
            row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        })),
      },
    };
  },

  async archiveSite(
    siteId: string,
    employer: AuthUser,
    extraPostKeys: string[] = [],
  ): Promise<ShiftOpsResult<{ archived: boolean; siteId: string }>> {
    if (!asUuid(siteId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid site", httpStatus: 400 };
    }
    const rpc = await shiftOpsRepository.tryArchiveSiteRpc(siteId);
    if (rpc?.id) {
      return { ok: true, data: { archived: true, siteId: rpc.id } };
    }
    const posts = await employerShiftRepository.listPostsByEmployer(employer.id);
    const keys = [
      ...posts.flatMap((post) => [post.id, post.id.toLowerCase()]),
      ...extraPostKeys.map((key) => key.trim()).filter(Boolean),
    ];
    const row = await shiftOpsRepository.archiveSiteForEmployer(siteId, employer.id, keys);
    if (row) {
      return { ok: true, data: { archived: true, siteId: row.id } };
    }
    const direct = await shiftOpsRepository.archiveSiteById(siteId);
    if (direct) {
      return { ok: true, data: { archived: true, siteId: direct.id } };
    }
    const created = await shiftOpsRepository.archiveOrCreateSite(siteId, keys);
    if (!created) {
      return { ok: false, code: "NOT_FOUND", message: "Site not found", httpStatus: 404 };
    }
    return { ok: true, data: { archived: true, siteId: created.id } };
  },
};
