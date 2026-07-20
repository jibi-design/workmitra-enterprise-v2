/** Job Mitra | authService.ts | src/features/auth/services/authService.ts */

import { AUTH_API_PREFIX } from "../../../shared/config/authConfig";
import { apiService } from "../../../shared/services/apiService";
import type { UserProfile } from "../../../shared/store/authStore";

interface ApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

interface LoginBody {
  email: string;
  password: string;
}

export const authService = {
  async login(body: LoginBody): Promise<UserProfile> {
    const res = await apiService.post<ApiEnvelope<{ user: UserProfile }>>(
      `${AUTH_API_PREFIX}/login`,
      body,
    );
    return res.data.user;
  },

  async logout(): Promise<void> {
    await apiService.post<ApiEnvelope<{ ok: boolean }>>(`${AUTH_API_PREFIX}/logout`, {});
  },

  async fetchMe(): Promise<UserProfile | null> {
    try {
      const res = await apiService.get<ApiEnvelope<{ user: UserProfile }>>(`${AUTH_API_PREFIX}/me`);
      return res.data.user;
    } catch {
      return null;
    }
  },
};
