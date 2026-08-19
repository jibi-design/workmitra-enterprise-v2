import { describe, expect, it } from "vitest";
import { parseWorkersRadarCount } from "./workersRadarApi.service";

describe("parseWorkersRadarCount", () => {
  it("reads a blind integer count from the envelope", () => {
    expect(parseWorkersRadarCount({ data: { count: 3 }, meta: { requestId: "x" } })).toBe(3);
  });

  it("fail-closes on missing, negative, or non-numeric payloads", () => {
    expect(parseWorkersRadarCount(null)).toBe(0);
    expect(parseWorkersRadarCount({})).toBe(0);
    expect(parseWorkersRadarCount({ data: { count: -2 } })).toBe(0);
    expect(parseWorkersRadarCount({ data: { count: "2" } })).toBe(0);
    expect(parseWorkersRadarCount({ data: { workers: [{ name: "A" }] } })).toBe(0);
  });
});
