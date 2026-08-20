/** Job Mitra | employerDashboard.lanePreview.test.ts */

import { describe, expect, it } from "vitest";
import { LANE_PREVIEW_CARDS } from "./employerDashboard.lanePreview";

describe("LANE_PREVIEW_CARDS", () => {
  it("gives each domain three guidance cards with Preview badges and no create verbs", () => {
    const blob = JSON.stringify(LANE_PREVIEW_CARDS);
    expect(LANE_PREVIEW_CARDS.shift).toHaveLength(3);
    expect(LANE_PREVIEW_CARDS.career).toHaveLength(3);
    expect(LANE_PREVIEW_CARDS.planner).toHaveLength(3);
    expect(blob.includes("Post Job")).toBe(false);
    expect(blob.includes("Quick post")).toBe(false);
    expect(blob.includes("Create")).toBe(false);
    expect(LANE_PREVIEW_CARDS.career[1]?.preview).toBe("Preview: 95% Match");
    expect(LANE_PREVIEW_CARDS.planner[1]?.preview).toBe("Preview: Slot status");
  });
});
