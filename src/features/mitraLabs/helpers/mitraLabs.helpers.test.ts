import { describe, expect, it } from "vitest";
import type { PassValidityFields } from "./mitraLabs.helpers";
import {
  buildVerificationUrl,
  generateOpaquePassToken,
  isPassValid,
  MITRA_LABS_VERIFY_PATH,
  resolvePassVerifyBadge,
} from "./mitraLabs.helpers";
import {
  CreatePassSchema,
  PassStyleConfigSchema,
} from "../validation/mitraLabs.schemas";

function pass(
  partial: Partial<PassValidityFields> &
    Pick<PassValidityFields, "status"> & { passToken: string },
): PassValidityFields & { passToken: string } {
  const from = new Date(Date.now() - 60_000).toISOString();
  const until = new Date(Date.now() + 60 * 60_000).toISOString();
  return {
    validFrom: from,
    validUntil: until,
    ...partial,
  };
}

describe("mitraLabs.helpers", () => {
  it("generates opaque tokens of sufficient length", () => {
    const t = generateOpaquePassToken();
    expect(t.length).toBeGreaterThanOrEqual(16);
    expect(t).not.toMatch(/\s/);
  });

  it("builds verify URL with opaque path only", () => {
    const url = buildVerificationUrl("abc_token");
    expect(url).toContain(`${MITRA_LABS_VERIFY_PATH}/`);
    expect(url).toContain("abc_token");
    expect(url).not.toContain("#");
    expect(url.toLowerCase()).not.toContain("guest");
  });

  it("validates active window", () => {
    expect(isPassValid(pass({ passToken: "t1", status: "active" }))).toBe(true);
    expect(isPassValid(pass({ passToken: "t2", status: "revoked" }))).toBe(false);
  });

  it("resolves verify badges", () => {
    expect(resolvePassVerifyBadge(undefined)).toBe("INVALID");
    expect(resolvePassVerifyBadge(pass({ passToken: "t", status: "revoked" }))).toBe("REVOKED");
    expect(
      resolvePassVerifyBadge(
        pass({
          passToken: "t",
          status: "active",
          validUntil: new Date(Date.now() - 1000).toISOString(),
        }),
      ),
    ).toBe("EXPIRED");
    expect(resolvePassVerifyBadge(pass({ passToken: "t", status: "active" }))).toBe("VALID");
    expect(resolvePassVerifyBadge(pass({ passToken: "t", status: "active" }), true)).toBe("USED");
  });
});

describe("mitraLabs.schemas", () => {
  it("rejects logo cover above 20%", () => {
    const r = PassStyleConfigSchema.safeParse({
      eccLevel: "H",
      logoMaxCoverPct: 25,
      paletteId: "teal_ink",
    });
    expect(r.success).toBe(false);
  });

  it("rejects validUntil in the past", () => {
    const r = CreatePassSchema.safeParse({
      passId: "p1",
      issuerId: "er",
      guestName: "A",
      venue: { name: "Hall" },
      purpose: "interview",
      validFrom: new Date(Date.now() - 10_000).toISOString(),
      validUntil: new Date(Date.now() - 1000).toISOString(),
      passToken: "tokentokentoken12",
      status: "active",
    });
    expect(r.success).toBe(false);
  });
});
