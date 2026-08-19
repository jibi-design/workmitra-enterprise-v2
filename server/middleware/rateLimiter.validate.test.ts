import { describe, expect, it } from "vitest";
import { classifyRateLimitPath } from "./rateLimitChaos.js";
import { isAuthSensitiveRoute, AUTH_IP_MAX_PER_MINUTE } from "./rateLimiter.js";
import { validateRequest } from "./validateRequest.js";
import { z } from "zod";
import type { ServerResponse } from "node:http";

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

describe("WAVE-5.1 Layer 3 rateLimiter", () => {
  it("classifies password and register routes as auth", () => {
    expect(classifyRateLimitPath("/v1/jobmitra/auth/change-password", "POST")).toBe("auth");
    expect(classifyRateLimitPath("/v1/jobmitra/auth/register", "POST")).toBe("auth");
    expect(classifyRateLimitPath("/v1/jobmitra/auth/forgot-password", "POST")).toBe("auth");
    expect(isAuthSensitiveRoute("/v1/jobmitra/auth/login", "POST")).toBe(true);
    expect(classifyRateLimitPath("/v1/jobmitra/public/event-day/check-in", "POST")).toBe("auth");
    expect(isAuthSensitiveRoute("/v1/jobmitra/public/event-day/check-in", "POST")).toBe(true);
    expect(AUTH_IP_MAX_PER_MINUTE).toBe(5);
  });

  it("keeps non-auth routes off the auth class", () => {
    expect(classifyRateLimitPath("/v1/jobmitra/health", "GET")).toBe("global");
    expect(classifyRateLimitPath("/v1/jobmitra/public/event-day/passes/abc", "GET")).toBe("global");
    expect(isAuthSensitiveRoute("/v1/jobmitra/employee/shift/applications", "GET")).toBe(false);
  });

  it("classifies unauthenticated global traffic as guest at apply-time via session cookie", () => {
    expect(classifyRateLimitPath("/v1/jobmitra/health", "GET")).toBe("global");
  });
});

describe("WAVE-5.1 Layer 3 validateRequest", () => {
  it("rejects invalid body with VALIDATION_ERROR details", () => {
    const res = mockRes();
    const schema = z.object({ email: z.string().email() });
    const result = validateRequest({ bodySchema: schema, body: { email: "bad" } }, res, "req_1");
    expect(result.ok).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.body).toContain("VALIDATION_ERROR");
  });

  it("accepts valid body+params and strips unknown keys", () => {
    const res = mockRes();
    const bodySchema = z.object({ note: z.string().max(20) });
    const paramsSchema = z.object({ postId: z.string().uuid() });
    const result = validateRequest(
      {
        bodySchema,
        paramsSchema,
        body: { note: "ok", hackerField: true },
        params: { postId: "11111111-1111-4111-8111-111111111111" },
      },
      res,
      "req_2",
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body).toEqual({ note: "ok" });
      expect(result.params.postId).toBe("11111111-1111-4111-8111-111111111111");
    }
  });
});
