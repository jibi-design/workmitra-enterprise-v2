/**
 * Auth service dispatcher — routes to DB (Phase 2) or memory (Phase 1 dev demo).
 * auth.routes.ts imports only from here.
 */
import { isDbAuthEnabled } from "./env.js";
import { memoryAuthService } from "./auth.service.memory.js";
import { dbAuthService } from "./auth.service.db.js";
import type { LoginResult } from "./auth.service.memory.js";
import type { AuthUser, UserRole } from "./types.js";
import type { RequestMeta } from "./request-meta.js";

export type { LoginResult };

export const authService = {
  async login(email: string, password: string, meta: RequestMeta): Promise<LoginResult> {
    if (isDbAuthEnabled()) return dbAuthService.login(email, password, meta);
    // Sprint 1: memory path only when demo lab explicitly enabled
    return memoryAuthService.login(email, password);
  },

  async register(input: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<LoginResult> {
    if (isDbAuthEnabled()) {
      return {
        ok: false,
        code: "NOT_IMPLEMENTED",
        message: "Self-serve registration is not enabled for production DB auth yet",
        httpStatus: 501,
      };
    }
    return memoryAuthService.register(input);
  },

  async requestPasswordReset(email: string): Promise<{ ok: true; debugToken?: string }> {
    if (isDbAuthEnabled()) {
      // Anti-enumeration: acknowledge without revealing account existence.
      return { ok: true };
    }
    return memoryAuthService.requestPasswordReset(email);
  },

  async resetPassword(token: string, password: string): Promise<LoginResult> {
    if (isDbAuthEnabled()) {
      return {
        ok: false,
        code: "NOT_IMPLEMENTED",
        message: "Password reset is not enabled for production DB auth yet",
        httpStatus: 501,
      };
    }
    return memoryAuthService.resetPassword(token, password);
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    meta: RequestMeta,
  ): Promise<LoginResult> {
    if (isDbAuthEnabled()) {
      return dbAuthService.changePassword(userId, currentPassword, newPassword, meta);
    }
    return memoryAuthService.changePassword(userId, currentPassword, newPassword);
  },

  async deleteAccount(
    userId: string,
    password: string,
    meta: RequestMeta,
  ): Promise<{ ok: true } | { ok: false; code: string; message: string; httpStatus?: number }> {
    if (isDbAuthEnabled()) {
      return dbAuthService.deleteAccount(userId, password, meta);
    }
    return memoryAuthService.deleteAccount(userId, password);
  },

  async getUserById(userId: string): Promise<AuthUser | null> {
    if (isDbAuthEnabled()) return dbAuthService.getUserById(userId);
    return memoryAuthService.getUserById(userId);
  },

  isRole(value: unknown): value is UserRole {
    return value === "employee" || value === "employer" || value === "admin";
  },

  /** True when this process is bound to Postgres auth (not memory demo). */
  isDbBound(): boolean {
    return isDbAuthEnabled();
  },
};
