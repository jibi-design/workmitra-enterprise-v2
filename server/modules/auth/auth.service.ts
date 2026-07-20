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
    return memoryAuthService.login(email, password);
  },

  async getUserById(userId: string): Promise<AuthUser | null> {
    if (isDbAuthEnabled()) return dbAuthService.getUserById(userId);
    return memoryAuthService.getUserById(userId);
  },

  isRole(value: unknown): value is UserRole {
    return value === "employee" || value === "employer" || value === "admin";
  },
};
