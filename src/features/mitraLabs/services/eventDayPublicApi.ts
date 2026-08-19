/** Public Event Day gate client — no Shift/Career imports. No CSRF. */

import { ApiRequestError } from "../../../shared/services/apiService";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
export const PUBLIC_EVENT_DAY_API = "/v1/jobmitra/public/event-day";

export type PublicEventDayBadge = "VALID" | "INVALID" | "REVOKED" | "EXPIRED" | "USED";

export type PublicEventDayPassDto = {
  readonly badge: PublicEventDayBadge;
  readonly guestName: string | null;
  readonly eventName: string | null;
  readonly venueName: string | null;
  readonly purpose: string | null;
  readonly validFrom: string | null;
  readonly validUntil: string | null;
  readonly status: string | null;
};

type Envelope<T> = { data: T; meta?: { requestId?: string } };
type ErrorBody = { error?: { code?: string; message?: string } };

async function publicRequest<T>(path: string, init: RequestInit): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  const response = await fetch(url.toString(), {
    ...init,
    headers,
    credentials: "omit",
  });
  const json = (await response.json().catch(() => ({}))) as Envelope<T> & ErrorBody;
  if (!response.ok) {
    throw new ApiRequestError(
      json.error?.message ?? `API Error: ${response.status}`,
      response.status,
      json.error?.code,
    );
  }
  return json.data;
}

export const eventDayPublicApi = {
  async getPassByToken(token: string): Promise<PublicEventDayPassDto> {
    const encoded = encodeURIComponent(token);
    const data = await publicRequest<{ pass: PublicEventDayPassDto }>(
      `${PUBLIC_EVENT_DAY_API}/passes/${encoded}`,
      { method: "GET" },
    );
    return data.pass;
  },

  async checkIn(
    token: string,
    pin: string,
  ): Promise<{ entered: true; verifiedAt: string; guestName: string; venueName: string }> {
    return publicRequest(`${PUBLIC_EVENT_DAY_API}/check-in`, {
      method: "POST",
      body: JSON.stringify({ token, pin }),
    });
  },
};

export function publicCheckInErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.code === "ALREADY_CHECKED_IN") return "This pass already has a PIN entry.";
    if (error.code === "PASS_NOT_VALID") return "This pass cannot enter now.";
    if (error.code === "EVENT_DAY_STORE_NOT_READY") {
      return "Event Day cloud store is not ready.";
    }
    if (error.code === "CHECK_IN_DENIED") return "Pass or gate PIN was not accepted.";
    return error.message;
  }
  return error instanceof Error ? error.message : "Could not complete check-in.";
}
