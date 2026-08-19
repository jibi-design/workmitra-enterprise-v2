import { describe, expect, it } from "vitest";
import {
  buildHomeTickerFingerprint,
  clearHomeTickerAllClearDismiss,
  dismissHomeTicker,
  dismissHomeTickerAllClear,
  isHomeTickerAllClearDismissed,
  isHomeTickerHidden,
  isHomeTickerPendingAcked,
} from "./homeTickerAllClearSession";

describe("homeTickerAllClearSession", () => {
  it("hides All Clear only for the dismissed fingerprint", () => {
    clearHomeTickerAllClearDismiss();
    const fp = buildHomeTickerFingerprint(["a", "b"], 0, "employer");
    dismissHomeTickerAllClear(fp);
    expect(isHomeTickerAllClearDismissed(fp)).toBe(true);
    expect(isHomeTickerAllClearDismissed(buildHomeTickerFingerprint(["a", "c"], 0, "employer"))).toBe(
      false,
    );
    expect(isHomeTickerAllClearDismissed(buildHomeTickerFingerprint(["a", "b"], 0, "employee"))).toBe(
      false,
    );
  });

  it("reappears after pending reset", () => {
    const fp = buildHomeTickerFingerprint(["n1"], 0, "employee");
    dismissHomeTickerAllClear(fp);
    clearHomeTickerAllClearDismiss();
    expect(isHomeTickerAllClearDismissed(fp)).toBe(false);
  });

  it("acks pending then hides on the second dismiss", () => {
    clearHomeTickerAllClearDismiss();
    const pendingFp = buildHomeTickerFingerprint(["n1"], 1, "employer");
    dismissHomeTicker(pendingFp, false);
    expect(isHomeTickerPendingAcked(pendingFp)).toBe(true);
    expect(isHomeTickerHidden(pendingFp)).toBe(false);
    dismissHomeTicker(pendingFp, true);
    expect(isHomeTickerHidden(pendingFp)).toBe(true);
    expect(
      isHomeTickerAllClearDismissed(buildHomeTickerFingerprint(["n1", "n2"], 1, "employer")),
    ).toBe(false);
  });

  it("writes a wm_ticker_dismiss role-scoped session key", () => {
    clearHomeTickerAllClearDismiss();
    dismissHomeTickerAllClear("probe-key");
    const stored = Object.keys(sessionStorage).find((item) => item.startsWith("wm_ticker_dismiss_"));
    expect(stored).toMatch(/^wm_ticker_dismiss_(employee|employer|admin|guest)_/);
  });
});
