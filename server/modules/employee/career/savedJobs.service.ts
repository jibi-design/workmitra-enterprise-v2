import type { AuthUser } from "../../auth/types.js";
import { isCareerUuid } from "./career.repository.js";
import { careerSavedJobsRepository, type CareerSavedJobRow } from "./savedJobs.repository.js";

export type SavedJobsListResult =
  | { ok: true; items: CareerSavedJobRow[] }
  | { ok: false; code: string; message: string; httpStatus: number };

export type SavedJobMutationResult =
  | { ok: true; item: CareerSavedJobRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export type SavedJobDeleteResult =
  { ok: true; deleted: boolean } | { ok: false; code: string; message: string; httpStatus: number };

export const careerSavedJobsService = {
  async listMine(employee: AuthUser): Promise<SavedJobsListResult> {
    try {
      const items = await careerSavedJobsRepository.listByEmployee(employee.id);
      return { ok: true, items };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to list saved career jobs",
        httpStatus: 500,
      };
    }
  },

  async save(employee: AuthUser, postIdRaw: string): Promise<SavedJobMutationResult> {
    const postId = postIdRaw.trim();
    if (!isCareerUuid(postId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "postId must be a valid UUID",
        httpStatus: 400,
      };
    }

    try {
      const exists = await careerSavedJobsRepository.postExists(postId);
      if (!exists) {
        return { ok: false, code: "NOT_FOUND", message: "Career post not found", httpStatus: 404 };
      }
      const item = await careerSavedJobsRepository.insert(employee.id, postId);
      return { ok: true, item };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to save career job",
        httpStatus: 500,
      };
    }
  },

  async unsave(employee: AuthUser, postIdRaw: string): Promise<SavedJobDeleteResult> {
    const postId = postIdRaw.trim();
    if (!isCareerUuid(postId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "postId must be a valid UUID",
        httpStatus: 400,
      };
    }

    try {
      const deleted = await careerSavedJobsRepository.delete(employee.id, postId);
      return { ok: true, deleted };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to remove saved career job",
        httpStatus: 500,
      };
    }
  },
};
