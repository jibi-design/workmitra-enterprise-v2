/** Job Mitra | apiService.ts | src/shared/services/apiService.ts */

import { AUTH_BACKEND_ENABLED } from "../config/authConfig";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
const CSRF_STORAGE_KEY = "wm_csrf_token";

/** One-time scrub of legacy plaintext bearer tokens. */
try {
  localStorage.removeItem("wm_auth_token");
} catch {
  /* ignore */
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
  message?: string;
}

/** HTTP-aware API failure — preserves status/code for CONFLICT (409) UX. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

function isConflictStatus(status: number, code?: string): boolean {
  return status === 409 || String(code ?? "").toUpperCase() === "CONFLICT";
}

export function isApiConflictError(error: unknown): boolean {
  if (error instanceof ApiRequestError) {
    return isConflictStatus(error.status, error.code);
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("already applied") || msg.includes("conflict") || msg.includes("409");
  }
  return false;
}

function readCsrfCookie(): string | null {
  try {
    const match = document.cookie.match(/(?:^|;\s*)wm_csrf=([^;]*)/);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function setStoredCsrfToken(token: string | null): void {
  try {
    if (!token) {
      sessionStorage.removeItem(CSRF_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  } catch {
    // demo-safe
  }
}

export function getStoredCsrfToken(): string | null {
  // Double-submit SoT is the readable wm_csrf cookie. Prefer it over sessionStorage
  // so Soft Auth / register never send a stale X-CSRF-Token after bootstrap refresh.
  const fromCookie = readCsrfCookie();
  if (fromCookie) {
    try {
      sessionStorage.setItem(CSRF_STORAGE_KEY, fromCookie);
    } catch {
      /* ignore */
    }
    return fromCookie;
  }
  try {
    const fromStorage = sessionStorage.getItem(CSRF_STORAGE_KEY)?.trim();
    if (fromStorage) return fromStorage;
  } catch {
    // ignore
  }
  return null;
}

function captureCsrfFromResponse(response: Response): void {
  const headerToken = response.headers.get("X-CSRF-Token")?.trim();
  if (headerToken) {
    setStoredCsrfToken(headerToken);
  }
}

let csrfEnsureInFlight: Promise<string | null> | null = null;

/**
 * Ensure a CSRF token is available for mutating requests (register, etc.).
 * Prefers existing wm_csrf cookie; otherwise GET /auth/csrf.
 * Pass `{ force: true }` from Soft Auth to refresh double-submit before register.
 */
export async function ensureCsrfReady(options?: {
  readonly force?: boolean;
}): Promise<string | null> {
  if (!AUTH_BACKEND_ENABLED) return null;

  if (!options?.force) {
    const existing = getStoredCsrfToken();
    if (existing) return existing;
  }

  if (!csrfEnsureInFlight) {
    csrfEnsureInFlight = (async () => {
      try {
        // Drop stale session cache before bootstrap so header matches Set-Cookie.
        setStoredCsrfToken(null);
        const url = new URL(`${API_BASE_URL}/v1/jobmitra/auth/csrf`, window.location.origin);
        const response = await fetch(url.toString(), {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        captureCsrfFromResponse(response);
        if (response.ok) {
          const body = (await response.json().catch(() => null)) as {
            data?: { csrfToken?: string };
          } | null;
          const fromBody = body?.data?.csrfToken?.trim();
          if (fromBody) setStoredCsrfToken(fromBody);
        }
        return getStoredCsrfToken();
      } catch {
        return getStoredCsrfToken();
      } finally {
        csrfEnsureInFlight = null;
      }
    })();
  }

  return csrfEnsureInFlight;
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

    const method = (rest.method ?? "GET").toUpperCase();
    const mutating =
      method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE";
    if (AUTH_BACKEND_ENABLED && mutating && !configHeaders.has("X-CSRF-Token")) {
      let csrf = getStoredCsrfToken();
      if (!csrf) {
        csrf = await ensureCsrfReady();
      }
      if (csrf) {
        configHeaders.set("X-CSRF-Token", csrf);
      }
    }

    const response = await fetch(url.toString(), {
      ...rest,
      headers: configHeaders,
      credentials: AUTH_BACKEND_ENABLED ? "include" : "same-origin",
    });

    if (AUTH_BACKEND_ENABLED) {
      captureCsrfFromResponse(response);
    }

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiErrorBody;
      const message =
        errorData.error?.message ?? errorData.message ?? `API Error: ${response.status}`;
      throw new ApiRequestError(message, response.status, errorData.error?.code);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  },

  get<T>(endpoint: string, params?: Record<string, string>, headers?: HeadersInit) {
    return this.request<T>(endpoint, { method: "GET", params, headers });
  },

  post<T>(endpoint: string, body: unknown, headers?: HeadersInit) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });
  },

  put<T>(endpoint: string, body: unknown, headers?: HeadersInit) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers,
    });
  },

  patch<T>(endpoint: string, body: unknown, headers?: HeadersInit) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers,
    });
  },

  delete<T>(endpoint: string, headers?: HeadersInit) {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  },
};
