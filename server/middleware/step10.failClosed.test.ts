/** STEP 10 — HIGH-01 / HIGH-02: CSRF + rate-limit fail-closed on store errors. */
import { beforeEach, describe, expect, it } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  __setRateLimitStoreForTests,
  type RateLimitBucketStore,
  type BucketConsumeResult,
} from "../adapters/rateLimitStore.js";
import {
  clearCsrfToken,
  issueCsrfToken,
  validateCsrfToken,
} from "../modules/auth/csrf.store.js";
import { applyApiRateLimit, __resetRateLimitBucketsForTests } from "./rateLimitChaos.js";

function mockRes(): ServerResponse & {
  statusCode: number;
  headers: Record<string, string>;
} {
  const headers: Record<string, string> = {};
  const state = { statusCode: 200 };
  const res = {
    get statusCode() {
      return state.statusCode;
    },
    set statusCode(v: number) {
      state.statusCode = v;
    },
    setHeader(name: string, value: string | number) {
      headers[String(name).toLowerCase()] = String(value);
      return res;
    },
    getHeader() {
      return undefined;
    },
    end() {
      return res;
    },
    headers,
  };
  return res as unknown as ServerResponse & {
    statusCode: number;
    headers: Record<string, string>;
  };
}

function mockReq(path: string, method = "POST"): IncomingMessage {
  return {
    url: path,
    method,
    headers: { "x-forwarded-for": "203.0.113.50" },
    socket: { remoteAddress: "203.0.113.50" },
  } as unknown as IncomingMessage;
}

function throwingStore(): RateLimitBucketStore {
  return {
    name: "throwing",
    async consume(): Promise<BucketConsumeResult> {
      throw new Error("redis_down");
    },
    async setKv(): Promise<void> {
      throw new Error("redis_down");
    },
    async getKv(): Promise<string | null> {
      throw new Error("redis_down");
    },
    async delKv(): Promise<void> {
      throw new Error("redis_down");
    },
  };
}

describe("STEP 10 CSRF store fail-closed (HIGH-01)", () => {
  beforeEach(() => {
    __setRateLimitStoreForTests(null);
  });

  it("round-trips session-bound tokens via shared store", async () => {
    const token = await issueCsrfToken("session_abc");
    expect(token.length).toBeGreaterThan(20);
    expect(await validateCsrfToken("session_abc", token)).toBe(true);
    expect(await validateCsrfToken("session_abc", "wrong")).toBe(false);
    await clearCsrfToken("session_abc");
    expect(await validateCsrfToken("session_abc", token)).toBe(false);
  });

  it("validate returns false when store throws (fail-closed)", async () => {
    __setRateLimitStoreForTests(throwingStore());
    expect(await validateCsrfToken("session_abc", "any-token-value-here")).toBe(false);
  });

  it("issue throws when store throws (fail-closed)", async () => {
    __setRateLimitStoreForTests(throwingStore());
    await expect(issueCsrfToken("session_abc")).rejects.toThrow("CSRF_STORE_UNAVAILABLE");
  });
});

describe("STEP 10 rate-limit fail-closed (HIGH-02)", () => {
  beforeEach(async () => {
    __setRateLimitStoreForTests(null);
    await __resetRateLimitBucketsForTests();
  });

  it("blocks ALL classes when IP store throws — not only auth", async () => {
    __setRateLimitStoreForTests(throwingStore());
    const res = mockRes();
    const result = await applyApiRateLimit(
      mockReq("/v1/jobmitra/employee/shift/posts/x/apply", "POST"),
      res,
      "/v1/jobmitra/employee/shift/posts/x/apply",
      "POST",
    );
    expect(result.blocked).toBe(true);
    expect(result.dimension).toBe("store_error");
    expect(result.rateClass).toBe("shift_apply");
    expect(res.headers["x-ratelimit-dimension"]).toBe("store_error");
  });

  it("blocks global class on store outage (no fail-open)", async () => {
    __setRateLimitStoreForTests(throwingStore());
    const res = mockRes();
    const result = await applyApiRateLimit(
      mockReq("/v1/jobmitra/health", "GET"),
      res,
      "/v1/jobmitra/health",
      "GET",
    );
    expect(result.blocked).toBe(true);
    expect(result.dimension).toBe("store_error");
    expect(result.retryAfterSec).toBe(30);
  });
});
