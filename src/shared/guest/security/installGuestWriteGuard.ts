/** Intercept fetch so guests cannot POST/PUT/PATCH/DELETE into live DB. */

import { useAuthStore } from "../../store/authStore";
import { guestMaySendHttpWrite, isMutatingHttpMethod } from "./guestWritePolicy";
import {
  ensureGuestDeviceHash,
  isGuestDeviceThrottled,
  recordGuestIntegrityStrike,
} from "./guestDeviceIntegrity";

function hasSessionCookie(): boolean {
  try {
    return /(?:^|;\s*)wm_session=/.test(document.cookie);
  } catch {
    return false;
  }
}

function isAuthenticatedNow(): boolean {
  return useAuthStore.getState().isAuthenticated || hasSessionCookie();
}

export function installGuestWriteGuard(): void {
  const w = window as Window & { __wmGuestWriteGuard?: boolean };
  if (typeof window === "undefined" || w.__wmGuestWriteGuard) return;
  w.__wmGuestWriteGuard = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = (
      init?.method ?? (input instanceof Request ? input.method : "GET")
    ).toUpperCase();
    const authed = isAuthenticatedNow();

    if (!authed && isGuestDeviceThrottled() && isMutatingHttpMethod(method)) {
      return Promise.resolve(
        new Response(JSON.stringify({ error: { code: "GUEST_DEVICE_THROTTLED" } }), {
          status: 429,
        }),
      );
    }

    if (!guestMaySendHttpWrite({ method, url, isAuthenticated: authed })) {
      recordGuestIntegrityStrike();
      return Promise.resolve(
        new Response(
          JSON.stringify({
            error: {
              code: "GUEST_WRITE_FORBIDDEN",
              message: "Sign in required to save to the live database.",
            },
          }),
          { status: 401 },
        ),
      );
    }

    const headers = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    if (!headers.has("X-Wm-Guest-Device")) {
      headers.set("X-Wm-Guest-Device", ensureGuestDeviceHash());
    }

    if (input instanceof Request) {
      return nativeFetch(new Request(input, { ...init, headers }));
    }
    return nativeFetch(input, { ...init, headers });
  };
}
