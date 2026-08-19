/** CRIT-01 — bridge public DTO must never carry Supabase refresh_token */

import { describe, expect, it } from "vitest";
import { toPublicBridgeSession } from "../../../server/modules/auth/supabaseBridge.service";

describe("toPublicBridgeSession (CRIT-01)", () => {
  it("strips refresh_token from the browser-facing payload", () => {
    const goTrueLike = {
      access_token: "access_abc",
      refresh_token: "refresh_MUST_NOT_LEAK",
      expires_in: 3600,
      expires_at: 1_700_000_000,
      user: { id: "sb-user-1" },
    };
    const publicSession = toPublicBridgeSession(goTrueLike);

    expect(publicSession).toEqual({
      access_token: "access_abc",
      expires_in: 3600,
      expires_at: 1_700_000_000,
      supabase_user_id: "sb-user-1",
    });
    expect(publicSession).not.toHaveProperty("refresh_token");
    expect(JSON.stringify(publicSession)).not.toContain("refresh");
  });
});
