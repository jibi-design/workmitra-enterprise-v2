import { describe, expect, it, vi, afterEach } from "vitest";
import type { ServerResponse } from "node:http";
import { AppHttpError, handleRequestError } from "./errorHandler.js";
import { writeAuditLog } from "../observability/auditLogger.js";

function mockRes(): ServerResponse & { statusCode: number; body: string } {
  const state = { statusCode: 200, body: "" };
  const res = {
    headersSent: false,
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

describe("WAVE-5.1 Layer 4 errorHandler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns AppHttpError message without stack", () => {
    const res = mockRes();
    handleRequestError(res, new AppHttpError(403, "FORBIDDEN", "No access"), {
      requestId: "req_a",
    });
    expect(res.statusCode).toBe(403);
    expect(res.body).toContain("FORBIDDEN");
    expect(res.body).not.toContain("stack");
  });

  it("sanitizes unknown errors as INTERNAL_SERVER_ERROR", () => {
    const res = mockRes();
    handleRequestError(res, new Error("secret token=abc123 boom"), {
      requestId: "req_b",
      path: "/v1/jobmitra/test",
      method: "POST",
    });
    expect(res.statusCode).toBe(500);
    expect(res.body).toContain("INTERNAL_SERVER_ERROR");
    expect(res.body).toContain("An unexpected error occurred");
    expect(res.body).not.toContain("token=abc123");
  });
});

describe("WAVE-5.1 Layer 4 auditLogger", () => {
  it("emits structured JSON without raw secrets", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    writeAuditLog({
      action: "password_changed",
      requestId: "req_c",
      userId: "usr_1",
      metadata: { password: "should-redact", note: "ok" },
    });
    expect(spy).toHaveBeenCalled();
    const line = String(spy.mock.calls[0]?.[0] ?? "");
    expect(line).toContain("[wm-audit]");
    expect(line).toContain("password_changed");
    expect(line).not.toContain("should-redact");
  });
});
