/** Job Mitra | apiService.ts | src/shared/services/apiService.ts */

import { AUTH_BACKEND_ENABLED } from "../config/authConfig";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
  message?: string;
}

export const apiService = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...rest } = options;

    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
    if (params) {
      Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    }

    const configHeaders = new Headers(headers);
    if (!configHeaders.has("Content-Type") && rest.body) {
      configHeaders.set("Content-Type", "application/json");
    }

    const legacyToken = localStorage.getItem("wm_auth_token");
    if (legacyToken && !AUTH_BACKEND_ENABLED) {
      configHeaders.set("Authorization", `Bearer ${legacyToken}`);
    }

    const response = await fetch(url.toString(), {
      ...rest,
      headers: configHeaders,
      credentials: AUTH_BACKEND_ENABLED ? "include" : "same-origin",
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiErrorBody;
      const message =
        errorData.error?.message ?? errorData.message ?? `API Error: ${response.status}`;
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  },

  get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", params });
  },

  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
  },

  put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) });
  },

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  },
};
