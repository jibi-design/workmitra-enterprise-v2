/** Job Mitra | employerDashboard.lanePreview.live.test.ts */

import { describe, expect, it } from "vitest";
import { LANE_PREVIEW_CARDS } from "./employerDashboard.lanePreview";
import {
  EMPTY_LANE_PREVIEW_LIVE,
  overlayLanePreviewCards,
} from "./employerDashboard.lanePreview.live";

describe("overlayLanePreviewCards", () => {
  it("keeps idle Preview copy when the API has zero records", () => {
    const shift = overlayLanePreviewCards("shift", EMPTY_LANE_PREVIEW_LIVE);
    expect(shift[0]?.preview).toBe(LANE_PREVIEW_CARDS.shift[0]?.preview);
    expect(shift[1]?.preview).toBe(LANE_PREVIEW_CARDS.shift[1]?.preview);
  });

  it("writes live counts into Preview badges without create verbs", () => {
    const career = overlayLanePreviewCards("career", {
      ...EMPTY_LANE_PREVIEW_LIVE,
      careerApplicants: 41,
      careerTopMatch: 95,
      careerInterviews: 8,
    });
    const blob = JSON.stringify(career);
    expect(career[0]?.preview).toBe("Preview: 41 applicants");
    expect(career[1]?.preview).toBe("Preview: 95% Match");
    expect(career[2]?.preview).toBe("Preview: 8 interview slots");
    expect(blob.includes("Post")).toBe(false);
    expect(blob.includes("Create")).toBe(false);
  });
});
