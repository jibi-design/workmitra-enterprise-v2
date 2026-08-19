import { describe, expect, it } from "vitest";
import { reportWeightForReason } from "./moderation.weight.js";
import { createContentReportBodySchema } from "../../validation/schemas/moderation.schemas.js";

describe("moderation.weight", () => {
  it("raises weight for money and harassment reports", () => {
    expect(reportWeightForReason("fake_pay")).toBe(1);
    expect(reportWeightForReason("asks_money")).toBe(1.5);
    expect(reportWeightForReason("harassment")).toBe(1.5);
  });
});

describe("createContentReportBodySchema", () => {
  it("strips unknown keys and sanitizes notes", () => {
    const parsed = createContentReportBodySchema.parse({
      reasonCode: "duplicate_spam",
      note: "  copy  ",
      extra: "nope",
    });
    expect(parsed.reasonCode).toBe("duplicate_spam");
    expect(parsed.note).toBe("copy");
    expect("extra" in parsed).toBe(false);
  });
});
