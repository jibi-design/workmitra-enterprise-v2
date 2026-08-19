import { describe, expect, it } from "vitest";
import {
  getPulseDomainIndexStats,
  resolvePulseDomain,
  resolvePulseVisualDomain,
  toVisualDomain,
} from "../pulseDomainResolve";
import { getEdgeTone, getGuideToneForDomain, GREEN_EDGE_TONE, URGENT_EDGE_TONE, WARNING_EDGE_TONE } from "../pulseEdgeTones";
import { PULSE_EVENT_ROUTES, PULSE_REGISTRY, isInformationOnlyEventType, isPulseEnabledEventType } from "../pulseRegistry";
import { PulseEvent } from "../pulseEvents";
import { normalizeSeverityFromRegistry } from "../pulseFlowBuilders";

describe("pulseDomainResolve (Phase 2)", () => {
  it("indexes routes and registry domains", () => {
    const stats = getPulseDomainIndexStats();
    expect(stats.events).toBeGreaterThan(5);
    expect(stats.nodes).toBeGreaterThan(5);
  });

  it("resolves domain from PulseConfig / event id — not substrings", () => {
    expect(resolvePulseDomain({ eventId: PulseEvent.SHIFT_SHORTLISTED })).toBe("shift");
    expect(resolvePulseDomain({ eventId: PulseEvent.SHORTLISTED })).toBe("career");
    expect(resolvePulseDomain({ eventId: PulseEvent.EMPLOYMENT_JOINED })).toBe("employment");
  });

  it("resolves domain from chain node ids via route index", () => {
    expect(resolvePulseDomain({ nodeId: "home-shift-card" })).toBe("shift");
    expect(resolvePulseDomain({ nodeId: "employee-shift-confirmation-card" })).toBe("shift");
  });

  it("maps workforce→planner and admin→vault visual lanes", () => {
    expect(toVisualDomain("workforce")).toBe("planner");
    expect(toVisualDomain("admin")).toBe("vault");
    expect(resolvePulseVisualDomain({ domain: "system" })).toBe("system");
  });
});

describe("getEdgeTone domain matrix (Phase 2)", () => {
  it("severity beats domain hue", () => {
    expect(getEdgeTone({ domain: "shift", severity: "urgent" })).toBe(URGENT_EDGE_TONE);
    expect(getEdgeTone({ domain: "career", severity: "warning" })).toBe(WARNING_EDGE_TONE);
  });

  it("info/guide uses traffic-light green, not domain hue", () => {
    const shiftGuide = getEdgeTone({ domain: "shift", severity: "info" });
    expect(shiftGuide.solid).toBe(GREEN_EDGE_TONE.solid);
    const careerGuide = getEdgeTone({
      eventId: PulseEvent.APPLICATION_RECEIVED,
      severity: "info",
    });
    expect(careerGuide.solid).toBe(GREEN_EDGE_TONE.solid);
    expect(getGuideToneForDomain("planner").solid).toBe(GREEN_EDGE_TONE.solid);
  });

  it("registry entries carry domain + Phase-2 durations", () => {
    const shift = PULSE_REGISTRY[PulseEvent.SHIFT_CONFIRMATION];
    expect(shift?.domain).toBe("shift");
    expect(shift?.duration).toBe("1s");
    const info = PULSE_REGISTRY[PulseEvent.SHIFT_APPLICATION_RECEIVED];
    expect(info?.duration).toBe("4s");
  });
});

describe("info-only = bell plane (no pulse)", () => {
  it("information-only types are not pulse-enabled", () => {
    expect(isInformationOnlyEventType("PROFILE_VIEW")).toBe(true);
    expect(isPulseEnabledEventType("PROFILE_VIEW")).toBe(false);
    expect(isPulseEnabledEventType("SHIFT_APPLICATION_SUBMITTED")).toBe(true);
  });
});

describe("priority color policy (Pillar 1)", () => {
  it("new application is guide, not red", () => {
    expect(PULSE_EVENT_ROUTES.SHIFT_APPLICATION_SUBMITTED?.severity).toBe("info");
    expect(PULSE_EVENT_ROUTES.CAREER_APPLICATION_SUBMITTED?.severity).toBe("info");
    expect(PULSE_REGISTRY[PulseEvent.SHIFT_APPLICATION_RECEIVED]?.severity).toBe("INFO");
  });

  it("WARNING stays amber; CRITICAL stays red", () => {
    expect(normalizeSeverityFromRegistry(PulseEvent.SHIFT_APPLICATION_RECEIVED)).toBe("info");
    expect(normalizeSeverityFromRegistry(PulseEvent.SHIFT_SHORTLISTED)).toBe("warning");
    expect(normalizeSeverityFromRegistry(PulseEvent.SHIFT_CONFIRMATION_REQUIRED)).toBe("urgent");
    expect(normalizeSeverityFromRegistry(PulseEvent.SHIFT_WORKER_CANCELLED)).toBe("urgent");
  });
});
