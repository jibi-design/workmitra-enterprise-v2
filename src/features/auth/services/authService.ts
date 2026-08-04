/** Job Mitra | authService.ts | src/features/auth/services/authService.ts */

import { AUTH_API_PREFIX } from "../../../shared/config/authConfig";
import {
  apiService,
  ensureCsrfReady,
  setStoredCsrfToken,
} from "../../../shared/services/apiService";
import type { UserProfile, UserRole } from "../../../shared/store/authStore";

interface ApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

interface LoginBody {
  email: string;
  password: string;
}

export type RegisterBody = {
  fullName: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
};

export type ForgotPasswordResult = {
  ok: true;
  message: string;
  debugResetToken?: string;
};

export const authService = {
  async login(body: LoginBody): Promise<UserProfile> {
    // Login is CSRF-exempt server-side; still warm token for post-login mutations.
    await ensureCsrfReady();
    const res = await apiService.post<ApiEnvelope<{ user: UserProfile; csrfToken?: string }>>(
      `${AUTH_API_PREFIX}/login`,
      body,
    );
    if (typeof res.data.csrfToken === "string" && res.data.csrfToken.trim()) {
      setStoredCsrfToken(res.data.csrfToken.trim());
    }
    return res.data.user;
  },

  async register(body: RegisterBody): Promise<UserProfile> {
    await ensureCsrfReady();
    const res = await apiService.post<ApiEnvelope<{ user: UserProfile; csrfToken?: string }>>(
      `${AUTH_API_PREFIX}/register`,
      body,
    );
    if (typeof res.data.csrfToken === "string" && res.data.csrfToken.trim()) {
      setStoredCsrfToken(res.data.csrfToken.trim());
    }
    return res.data.user;
  },

  async requestPasswordReset(email: string): Promise<ForgotPasswordResult> {
    await ensureCsrfReady();
    const res = await apiService.post<ApiEnvelope<ForgotPasswordResult>>(
      `${AUTH_API_PREFIX}/forgot-password`,
      { email },
    );
    return res.data;
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await ensureCsrfReady();
    await apiService.post<ApiEnvelope<{ ok: boolean }>>(`${AUTH_API_PREFIX}/reset-password`, {
      token,
      password,
    });
  },

  async logout(): Promise<void> {
    try {
      await apiService.post<ApiEnvelope<{ ok: boolean }>>(`${AUTH_API_PREFIX}/logout`, {});
    } finally {
      setStoredCsrfToken(null);
    }
  },

  async fetchMe(): Promise<UserProfile | null> {
    try {
      const res = await apiService.get<ApiEnvelope<{ user: UserProfile }>>(`${AUTH_API_PREFIX}/me`);
      return res.data.user;
    } catch {
      return null;
    }
  },

  async switchContext(input: {
    mode: Exclude<UserRole, "admin">;
    orgId?: string | null;
  }): Promise<UserProfile> {
    const res = await apiService.post<ApiEnvelope<{ user: UserProfile }>>(
      `${AUTH_API_PREFIX}/switch-context`,
      { mode: input.mode, orgId: input.orgId ?? null },
    );
    return res.data.user;
  },
};
