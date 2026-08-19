import { describe, expect, it } from "vitest";
import { guestMaySendHttpWrite, isMutatingHttpMethod } from "./guestWritePolicy";

describe("guest write policy", () => {
  it("allows GET for guests", () => {
    expect(
      guestMaySendHttpWrite({
        method: "GET",
        url: "/v1/jobmitra/employee/shift/posts",
        isAuthenticated: false,
      }),
    ).toBe(true);
  });

  it("blocks guest POST to shift apply", () => {
    expect(
      guestMaySendHttpWrite({
        method: "POST",
        url: "/v1/jobmitra/employee/shift/posts/abc/apply",
        isAuthenticated: false,
      }),
    ).toBe(false);
  });

  it("allows guest login POST", () => {
    expect(
      guestMaySendHttpWrite({
        method: "POST",
        url: "https://api.example/v1/jobmitra/auth/login",
        isAuthenticated: false,
      }),
    ).toBe(true);
  });

  it("allows authenticated mutating calls", () => {
    expect(
      guestMaySendHttpWrite({
        method: "DELETE",
        url: "/v1/jobmitra/employer/shift/posts/1",
        isAuthenticated: true,
      }),
    ).toBe(true);
  });

  it("blocks guest Supabase REST writes", () => {
    expect(
      guestMaySendHttpWrite({
        method: "POST",
        url: "https://xyz.supabase.co/rest/v1/posts",
        isAuthenticated: false,
      }),
    ).toBe(false);
  });

  it("detects mutating verbs", () => {
    expect(isMutatingHttpMethod("post")).toBe(true);
    expect(isMutatingHttpMethod("GET")).toBe(false);
  });
});
