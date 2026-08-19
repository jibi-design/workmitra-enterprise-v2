import { describe, expect, it } from "vitest";
import { enforceGuestWriteIsolation } from "./guestWriteIsolation.js";
import type { IncomingMessage, ServerResponse } from "node:http";

function mockReq(cookie?: string): IncomingMessage {
  return { headers: { cookie: cookie ?? "" } } as IncomingMessage;
}

function mockRes(): ServerResponse & { statusCode: number; body: string } {
  const state = { statusCode: 200, body: "" };
  const res = {
    get statusCode() {
      return state.statusCode;
    },
    set statusCode(v: number) {
      state.statusCode = v;
    },
    setHeader() {
      return res;
    },
    end(chunk?: string) {
      state.body = typeof chunk === "string" ? chunk : "";
    },
    get body() {
      return state.body;
    },
  };
  return res as unknown as ServerResponse & { statusCode: number; body: string };
}

describe("guest write isolation", () => {
  it("allows GET without a session", () => {
    const res = mockRes();
    expect(enforceGuestWriteIsolation(mockReq(), res, "/v1/jobmitra/health", "GET")).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  it("blocks guest POST to shift apply", () => {
    const res = mockRes();
    expect(
      enforceGuestWriteIsolation(
        mockReq(),
        res,
        "/v1/jobmitra/employee/shift/posts/1/apply",
        "POST",
      ),
    ).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.body).toContain("GUEST_WRITE_FORBIDDEN");
  });

  it("allows login without a session", () => {
    const res = mockRes();
    expect(enforceGuestWriteIsolation(mockReq(), res, "/v1/jobmitra/auth/login", "POST")).toBe(
      true,
    );
  });

  it("blocks guest PUT without a session", () => {
    const res = mockRes();
    expect(
      enforceGuestWriteIsolation(mockReq(), res, "/v1/jobmitra/employer/shift/posts/1", "PUT"),
    ).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.body).toContain("GUEST_WRITE_FORBIDDEN");
  });

  it("allows mutating calls with a session cookie", () => {
    const res = mockRes();
    expect(
      enforceGuestWriteIsolation(
        mockReq("wm_session=abcdefghij"),
        res,
        "/v1/jobmitra/employee/shift/posts/1/apply",
        "POST",
      ),
    ).toBe(true);
  });
});
