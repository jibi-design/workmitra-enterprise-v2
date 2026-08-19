import { describe, expect, it } from "vitest";
import { sanitizeUserText, stripHtmlAndScripts } from "./sanitizeUserText";

describe("sanitizeUserText", () => {
  it("removes script blocks and tags", () => {
    const out = stripHtmlAndScripts("<script>alert(1)</script><b>Hello</b>");
    expect(out).toBe("Hello");
  });

  it("strips javascript URIs and event handlers", () => {
    const out = stripHtmlAndScripts('<a href="javascript:alert(1)" onclick="steal()">x</a>');
    expect(out.toLowerCase()).not.toContain("javascript");
    expect(out.toLowerCase()).not.toContain("onclick");
  });

  it("caps length", () => {
    expect(sanitizeUserText("a".repeat(50), 8)).toHaveLength(8);
  });
});
