import { describe, expect, it } from "vitest";
import { formatHomeStripRowLine, overlayTickerDetailBodies } from "./homeStripRowCopy";
import type { InboxTickerItem } from "./latestUnreadInboxPreview";

function row(partial: Partial<InboxTickerItem> & Pick<InboxTickerItem, "id" | "title">): InboxTickerItem {
  return {
    domain: "shift",
    createdAt: 1,
    ...partial,
  };
}

describe("formatHomeStripRowLine", () => {
  it("shows the post name instead of repeating the title", () => {
    expect(
      formatHomeStripRowLine(
        "New shift application received",
        "A worker applied to Harbour Gate Marshall.",
      ),
    ).toBe("Harbour Gate Marshall");
  });

  it("uses fallback when the body is generic", () => {
    expect(
      formatHomeStripRowLine(
        "New shift application received",
        "A worker has applied to your shift post.",
        "Clinic Front Desk",
      ),
    ).toBe("Clinic Front Desk");
  });
});

describe("overlayTickerDetailBodies", () => {
  it("fills generic application rows from apply details", () => {
    const items = overlayTickerDetailBodies(
      [row({ id: "n1", title: "Application submitted" })],
      [row({ id: "a1", title: "Application submitted", body: "Applied · Dawn Dock · Lab Demo Corp" })],
    );
    expect(items[0]?.body).toBe("Applied · Dawn Dock · Lab Demo Corp");
  });
});
