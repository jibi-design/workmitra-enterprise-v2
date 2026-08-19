import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EventDayWorkflowCards } from "../../components/EventDayWorkflowCards";
import { extractPassTokenFromScan } from "../../helpers/mitraLabsScan.helpers";

describe("EventDayWorkflowCards", () => {
  it("renders four workflow cards", () => {
    const html = renderToStaticMarkup(
      <EventDayWorkflowCards
        active="qr"
        onPasses={() => undefined}
        onQr={() => undefined}
        onPin={() => undefined}
        onScanner={() => undefined}
      />,
    );
    expect(html).toContain("event-day-card-passes");
    expect(html).toContain("event-day-card-qr");
    expect(html).toContain("event-day-card-pin");
    expect(html).toContain("event-day-card-scanner");
  });
});

describe("mitraLabsScan.helpers", () => {
  it("extracts token from hash verify URL", () => {
    const token = extractPassTokenFromScan(
      "http://localhost:5173/#/labs/pass/verify/opaque_token_abc",
    );
    expect(token).toBe("opaque_token_abc");
  });

  it("extracts token from path verify URL used by phone cameras", () => {
    const token = extractPassTokenFromScan(
      "http://192.168.1.20:5173/labs/pass/verify/opaque_token_abc",
    );
    expect(token).toBe("opaque_token_abc");
  });
});
