/** Job Mitra | StatusBadge tone mapping — Ultra-Enterprise U1 */

import { describe, expect, it } from "vitest";
import { careerPostStatusToBadge, shiftPriorityToBadge } from "../statusBadge.mappers";

describe("careerPostStatusToBadge", () => {
  it("maps active/filled to active tone", () => {
    expect(careerPostStatusToBadge("active")).toEqual({ label: "Active", tone: "active" });
    expect(careerPostStatusToBadge("filled")).toEqual({ label: "Filled", tone: "active" });
  });

  it("maps paused to warning and closed to critical", () => {
    expect(careerPostStatusToBadge("paused")).toEqual({ label: "Paused", tone: "warning" });
    expect(careerPostStatusToBadge("closed")).toEqual({ label: "Closed", tone: "critical" });
  });

  it("maps draft/unknown to neutral", () => {
    expect(careerPostStatusToBadge("draft")).toEqual({ label: "Draft", tone: "neutral" });
    expect(careerPostStatusToBadge("weird")).toEqual({ label: "Draft", tone: "neutral" });
  });
});

describe("shiftPriorityToBadge", () => {
  it("maps priority tags to tones", () => {
    expect(shiftPriorityToBadge("priority")).toEqual({ label: "Best Match", tone: "active" });
    expect(shiftPriorityToBadge("good")).toEqual({ label: "Good Fit", tone: "active" });
    expect(shiftPriorityToBadge("review")).toEqual({ label: "Review Needed", tone: "warning" });
  });
});
