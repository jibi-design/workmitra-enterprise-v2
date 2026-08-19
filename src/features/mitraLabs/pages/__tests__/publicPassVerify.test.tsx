/** Public pass verify UI — app-less scan + gate PIN check-in. */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PublicPassVerifyCard } from "../../components/PublicPassVerifyCard";

const activePass = {
  passId: "pass_1",
  passToken: "tok_valid",
  issuerId: "er_1",
  guestName: "Alex Guest",
  venue: { name: "Main Hall" },
  purpose: "event" as const,
  validFrom: new Date(Date.now() - 60_000).toISOString(),
  validUntil: new Date(Date.now() + 60_000).toISOString(),
  status: "active" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("PublicPassVerifyCard", () => {
  it("shows VALID PASS headline and check-in CTA", () => {
    const html = renderToStaticMarkup(
      <PublicPassVerifyCard badge="VALID" pass={activePass} onOpenCheckIn={() => undefined} />,
    );

    expect(html).toContain("VALID PASS");
    expect(html).toContain("Mark Entry / Check-In");
    expect(html).toContain("Alex Guest");
    expect(html).toContain("App-less scan");
    expect(html).toMatch(/Valid from/);
    expect(html).toMatch(/\d{1,2} \w{3} \d{4}/);
  });

  it("shows INVALID headline without check-in CTA", () => {
    const html = renderToStaticMarkup(
      <PublicPassVerifyCard badge="INVALID" onOpenCheckIn={() => undefined} />,
    );

    expect(html).toContain("INVALID");
    expect(html).not.toContain("Mark Entry / Check-In");
  });

  it("shows outside window copy for expired passes", () => {
    const expiredPass = {
      ...activePass,
      validFrom: new Date(Date.now() - 3600_000).toISOString(),
      validUntil: new Date(Date.now() - 60_000).toISOString(),
    };
    const html = renderToStaticMarkup(
      <PublicPassVerifyCard badge="EXPIRED" pass={expiredPass} onOpenCheckIn={() => undefined} />,
    );

    expect(html).toContain("Outside Event Shift Timing");
    expect(html).toContain("wm-mlBadge--fail");
  });
});
