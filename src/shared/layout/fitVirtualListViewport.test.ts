import { describe, expect, it } from "vitest";
import {
  VIRTUAL_LIST_MAX_HEIGHT_PX,
  fitVirtualListViewportPx,
  virtualListNeedsInnerScroll,
} from "./fitVirtualListViewport";

describe("fitVirtualListViewportPx", () => {
  it("returns 0 when the list is empty", () => {
    expect(fitVirtualListViewportPx(400, 0, { rowEstimatePx: 176 })).toBe(0);
  });

  it("shrinks to one card of content under the cap", () => {
    expect(fitVirtualListViewportPx(220, 1, { rowEstimatePx: 176 })).toBe(220);
  });

  it("uses the row estimate until content is measured", () => {
    expect(fitVirtualListViewportPx(0, 1, { rowEstimatePx: 176 })).toBe(176);
  });

  it("caps long feeds and flags inner scroll", () => {
    expect(fitVirtualListViewportPx(2400, 12, { rowEstimatePx: 176 })).toBe(
      VIRTUAL_LIST_MAX_HEIGHT_PX,
    );
    expect(virtualListNeedsInnerScroll(2400)).toBe(true);
    expect(virtualListNeedsInnerScroll(400)).toBe(false);
  });
});
