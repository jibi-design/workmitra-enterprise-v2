import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DigitalInviteIssuedCard } from "../../components/DigitalInviteIssuedCard";
import {
  buildEventPassShareText,
  buildWhatsAppShareHref,
  formatGatePortalDateTime,
} from "../../helpers/digitalInviteShare.helpers";
import type { DigitalPassRecord } from "../../storage/mitraLabs.storage";

const record: DigitalPassRecord = {
  passId: "pass_1",
  passToken: "tok_share_verify_01",
  issuerId: "er_1",
  guestName: "Alex Guest",
  eventName: "Open Day",
  venue: { name: "Main Hall" },
  purpose: "event",
  validFrom: "2026-08-17T10:00:00.000Z",
  validUntil: "2026-08-18T18:00:00.000Z",
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("issued pass share helpers", () => {
  it("builds a WhatsApp payload with company, guest, event, venue, and verify URL", () => {
    const text = buildEventPassShareText({
      companyName: "Audit Hall Co",
      guestName: record.guestName,
      eventName: "Open Day",
      venueName: "Main Hall",
      validFrom: record.validFrom,
      validUntil: record.validUntil,
      verifyUrl: "https://example.test/#/labs/pass/verify/tok",
    });
    expect(text).toContain("🎟️ *Audit Hall Co - Event Entry Pass*");
    expect(text).toContain("👤 *Name:* Alex Guest");
    expect(text).toContain("🎪 *Event:* Open Day");
    expect(text).toContain("📍 *Venue:* Main Hall");
    expect(text).toContain("📅 *Valid:");
    expect(text).toContain("Show this verification link at the security gate");
    expect(text).toContain("https://example.test/#/labs/pass/verify/tok");
    const href = buildWhatsAppShareHref(text);
    expect(href.startsWith("https://wa.me/?text=")).toBe(true);
    expect(href).toContain(encodeURIComponent("Audit Hall Co"));
  });

  it("formats gate portal timestamps as readable day and 12-hour time", () => {
    const formatted = formatGatePortalDateTime("2026-08-17T19:51:00.000Z");
    expect(formatted).toMatch(/17 Aug 2026/);
    expect(formatted).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
  });
});

describe("DigitalInviteIssuedCard", () => {
  it("shows company name and Powered by Job Mitra on the badge", () => {
    const html = renderToStaticMarkup(
      <DigitalInviteIssuedCard
        record={record}
        companyName="Audit Hall Co"
        verifyUrl="https://example.test/#/labs/pass/verify/tok"
        palette={{ accent: "#0f766e", bg: "#ffffff", fg: "#0f172a" }}
        onRevoke={() => undefined}
        onClose={() => undefined}
      />,
    );
    expect(html).toContain("Audit Hall Co");
    expect(html).toContain("Alex Guest");
    expect(html).toContain("Open Day");
    expect(html).toContain("Main Hall");
    expect(html).toContain("Powered by");
    expect(html).toContain("Last issued pass");
    expect(html).toContain("mitra-pass-card-close");
    expect(html).toContain("Share via WhatsApp");
    expect(html).toContain("Export PDF");
    expect(html).toContain("Copy Link");
    expect(html).toContain("Revoke Pass");
    expect(html).toContain("https://wa.me/?text=");
  });
});
