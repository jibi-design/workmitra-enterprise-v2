/** Guest local-first: mutating HTTP is blocked until a real session exists. */

const AUTH_WRITE_ALLOW = [
  "/v1/jobmitra/auth/login",
  "/v1/jobmitra/auth/register",
  "/v1/jobmitra/auth/forgot-password",
  "/v1/jobmitra/auth/reset-password",
  "/v1/jobmitra/auth/change-password",
  "/v1/jobmitra/auth/logout",
  "/v1/jobmitra/auth/supabase-bridge",
] as const;

export function isMutatingHttpMethod(method: string): boolean {
  const m = method.toUpperCase();
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
}

export function pathnameFromRequestUrl(raw: string): string {
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return new URL(raw).pathname;
    }
    return new URL(raw, "http://local.invalid").pathname;
  } catch {
    return "/";
  }
}

function isAllowedUnauthedWrite(pathname: string): boolean {
  if (AUTH_WRITE_ALLOW.includes(pathname as (typeof AUTH_WRITE_ALLOW)[number])) return true;
  if (pathname.startsWith("/v1/jobmitra/public/event-day/")) return true;
  if (pathname.startsWith("/auth/v1/")) return true;
  return false;
}

function isSupabaseDataWrite(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes("/rest/v1/") || lower.includes("/storage/v1/");
}

export function guestMaySendHttpWrite(input: {
  readonly method: string;
  readonly url: string;
  readonly isAuthenticated: boolean;
}): boolean {
  if (!isMutatingHttpMethod(input.method)) return true;
  if (input.isAuthenticated) return true;
  const path = pathnameFromRequestUrl(input.url);
  if (isAllowedUnauthedWrite(path)) return true;
  if (isSupabaseDataWrite(input.url)) return false;
  return false;
}
