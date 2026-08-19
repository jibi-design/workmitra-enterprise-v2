import { beforeEach, describe, expect, it, vi } from "vitest";
import { isSoSiteUuid } from "./membershipBridge.service";

const persistSiteId = vi.fn();

vi.mock("../lib/supabaseClient", () => ({
  isShiftOpsSupabaseConfigured: vi.fn(() => false),
  getShiftOpsSupabase: () => {
    throw new Error("supabase should not be used in local ensure tests");
  },
}));

vi.mock("./authBridge.service", () => ({
  ensureShiftOpsAuthSession: vi.fn(async () => undefined),
}));

describe("ensureShiftOpsSiteForPost local path", () => {
  beforeEach(() => {
    persistSiteId.mockReset();
  });

  it("reuses an existing site UUID and persists it", async () => {
    const { ensureShiftOpsSiteForPost } = await import("./ensureSiteForShiftPost.service");
    const existing = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    const result = await ensureShiftOpsSiteForPost({
      postId: "shift_local_1",
      displayName: "Acme · Host · 2026-08-21",
      existingSiteId: existing,
      persistSiteId,
    });
    expect(result).toEqual({ ok: true, siteId: existing, source: "existing" });
    expect(persistSiteId).toHaveBeenCalledWith(existing);
  });

  it("mints one UUID when the post has no site", async () => {
    const { ensureShiftOpsSiteForPost } = await import("./ensureSiteForShiftPost.service");
    const result = await ensureShiftOpsSiteForPost({
      postId: "shift_local_2",
      displayName: "Acme · Host · 2026-08-21",
      persistSiteId,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source).toBe("local");
    expect(isSoSiteUuid(result.siteId)).toBe(true);
    expect(persistSiteId).toHaveBeenCalledWith(result.siteId);
  });

  it("mints a local UUID in DEV when the auth bridge is down", async () => {
    const supabase = await import("../lib/supabaseClient");
    vi.mocked(supabase.isShiftOpsSupabaseConfigured).mockReturnValue(true);
    const auth = await import("./authBridge.service");
    vi.mocked(auth.ensureShiftOpsAuthSession).mockRejectedValue(
      new Error("BRIDGE_NOT_CONFIGURED"),
    );

    const { ensureShiftOpsSiteForPost } = await import("./ensureSiteForShiftPost.service");
    const result = await ensureShiftOpsSiteForPost({
      postId: "shift_local_3",
      displayName: "Acme · Host · 2026-08-21",
      persistSiteId,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source).toBe("local");
    expect(isSoSiteUuid(result.siteId)).toBe(true);
    expect(persistSiteId).toHaveBeenCalledWith(result.siteId);

    vi.mocked(supabase.isShiftOpsSupabaseConfigured).mockReturnValue(false);
  });
});
