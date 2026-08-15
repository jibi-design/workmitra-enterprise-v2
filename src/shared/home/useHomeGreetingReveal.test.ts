import { describe, expect, it } from "vitest";
import { getTimeOfDayGreeting } from "./useHomeGreetingReveal";

describe("getTimeOfDayGreeting", () => {
  it("maps morning afternoon evening from local hour", () => {
    expect(getTimeOfDayGreeting(new Date("2026-08-15T11:59:00"))).toBe("Good Morning");
    expect(getTimeOfDayGreeting(new Date("2026-08-15T12:00:00"))).toBe("Good Afternoon");
    expect(getTimeOfDayGreeting(new Date("2026-08-15T16:59:00"))).toBe("Good Afternoon");
    expect(getTimeOfDayGreeting(new Date("2026-08-15T17:00:00"))).toBe("Good Evening");
    expect(getTimeOfDayGreeting(new Date("2026-08-15T00:00:00"))).toBe("Good Morning");
  });
});
