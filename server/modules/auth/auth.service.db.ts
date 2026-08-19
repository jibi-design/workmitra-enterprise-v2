import {
  ACCOUNT_LOCK_DURATION_SEC,
  ACCOUNT_LOCK_THRESHOLD,
  ACCOUNT_LOCK_WINDOW_SEC,
  LOGIN_RATE_LIMIT_MAX,
  LOGIN_RATE_LIMIT_WINDOW_SEC,
  PRODUCT_SCOPE_JOBMITRA,
} from "./constants.js";
import { verifyPassword, hashPassword } from "./password.js";
import { authRepository } from "./auth.repository.js";
import { auditService } from "./audit.service.js";
import { hashIp } from "./crypto.js";
import type { LoginResult } from "./auth.service.memory.js";
import type { AuthUser, UserRole } from "./types.js";
import type { RequestMeta } from "./request-meta.js";

export const dbAuthService = {
  async login(email: string, password: string, meta: RequestMeta): Promise<LoginResult> {
    const normalized = email.trim().toLowerCase();
    const ipHash = meta.ip ? hashIp(meta.ip) : "unknown";

    await authRepository.unlockExpiredAccounts();

    const rateCount = await authRepository.countFailedAttemptsInWindow(
      normalized,
      ipHash,
      LOGIN_RATE_LIMIT_WINDOW_SEC,
    );
    if (rateCount >= LOGIN_RATE_LIMIT_MAX) {
      await auditService.log("login_rate_limited", meta, { metadata: { email: normalized } });
      return {
        ok: false,
        code: "RATE_LIMITED",
        message: "Too many login attempts. Please try again later.",
        httpStatus: 429,
      };
    }

    const row = await authRepository.findUserByEmail(normalized);
    if (!row) {
      await authRepository.recordLoginAttempt(normalized, ipHash, false);
      await auditService.log("login_failed", meta, { metadata: { reason: "unknown_user" } });
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        httpStatus: 401,
      };
    }

    if (row.status === "locked") {
      if (row.locked_until && row.locked_until > new Date()) {
        await auditService.log("login_failed", meta, {
          userId: row.id,
          metadata: { reason: "account_locked" },
        });
        return {
          ok: false,
          code: "ACCOUNT_LOCKED",
          message: "Account is temporarily locked. Please try again later.",
          httpStatus: 403,
        };
      }
      await authRepository.resetUserFailedLogins(row.id);
    }

    if (row.status === "suspended" || row.status === "deleted") {
      await auditService.log("login_failed", meta, {
        userId: row.id,
        metadata: { reason: row.status },
      });
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        httpStatus: 401,
      };
    }

    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) {
      await authRepository.recordLoginAttempt(normalized, ipHash, false);
      await authRepository.incrementUserFailedLogins(
        row.id,
        ACCOUNT_LOCK_WINDOW_SEC,
        ACCOUNT_LOCK_THRESHOLD,
        ACCOUNT_LOCK_DURATION_SEC,
      );
      await auditService.log("login_failed", meta, {
        userId: row.id,
        metadata: { reason: "bad_password" },
      });
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        httpStatus: 401,
      };
    }

    await authRepository.recordLoginAttempt(normalized, ipHash, true);
    await authRepository.resetUserFailedLogins(row.id);

    const user = await authRepository.toAuthUser(row, PRODUCT_SCOPE_JOBMITRA);
    if (!user) {
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        httpStatus: 401,
      };
    }

    await auditService.log("login_success", meta, { userId: user.id });
    return { ok: true, user };
  },

  async getUserById(userId: string): Promise<AuthUser | null> {
    const row = await authRepository.findUserById(userId);
    if (!row) return null;
    return authRepository.toAuthUser(row, PRODUCT_SCOPE_JOBMITRA);
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    meta: RequestMeta,
  ): Promise<LoginResult> {
    const row = await authRepository.findUserById(userId);
    if (!row) {
      return {
        ok: false,
        code: "UNAUTHENTICATED",
        message: "Not authenticated",
        httpStatus: 401,
      };
    }
    const valid = await verifyPassword(currentPassword, row.password_hash);
    if (!valid) {
      await auditService.log("password_change_failed", meta, {
        userId,
        metadata: { reason: "bad_current_password" },
      });
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Current password is incorrect",
        httpStatus: 401,
      };
    }
    if (currentPassword === newPassword) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "New password must be different from the current password",
        httpStatus: 400,
      };
    }
    const nextHash = await hashPassword(newPassword);
    await authRepository.updatePasswordHash(userId, nextHash);
    const user = await authRepository.toAuthUser(row, PRODUCT_SCOPE_JOBMITRA);
    if (!user) {
      return {
        ok: false,
        code: "UNAUTHENTICATED",
        message: "Not authenticated",
        httpStatus: 401,
      };
    }
    await auditService.log("password_changed", meta, { userId });
    return { ok: true, user };
  },

  async deleteAccount(
    userId: string,
    password: string,
    meta: RequestMeta,
  ): Promise<{ ok: true } | { ok: false; code: string; message: string; httpStatus?: number }> {
    const row = await authRepository.findUserById(userId);
    if (!row) {
      return {
        ok: false,
        code: "UNAUTHENTICATED",
        message: "Not authenticated",
        httpStatus: 401,
      };
    }
    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) {
      await auditService.log("account_deletion_failed", meta, {
        userId,
        metadata: { reason: "bad_password" },
      });
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Password is incorrect",
        httpStatus: 401,
      };
    }
    const scrubbedHash = await hashPassword(`deleted:${userId}:${Date.now()}`);
    const marked = await authRepository.markUserDeleted(userId, scrubbedHash);
    if (!marked) {
      return {
        ok: false,
        code: "ALREADY_DELETED",
        message: "Account is already deleted",
        httpStatus: 409,
      };
    }
    await authRepository.revokeAllSessionsForUser(userId);
    await auditService.log("account_deleted", meta, { userId });
    return { ok: true };
  },

  isRole(value: unknown): value is UserRole {
    return value === "employee" || value === "employer" || value === "admin";
  },
};
