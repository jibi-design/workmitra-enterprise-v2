/** Overlay live counts onto guidance sub-cards. Idle copy stays when counts are 0. */

import { LANE_PREVIEW_CARDS, type LanePreviewCardCopy } from "./employerDashboard.lanePreview";
import type { EmployerOsDomain } from "./employerDashboard.osTypes";

export type LanePreviewLiveInput = {
  readonly shiftUpcoming: number;
  readonly shiftRoster: number;
  readonly shiftGateReady: number;
  readonly careerApplicants: number;
  readonly careerTopMatch: number | null;
  readonly careerInterviews: number;
  readonly plannerWeeks: number;
  readonly plannerGaps: number;
  readonly plannerWorkerDays: number;
};

export const EMPTY_LANE_PREVIEW_LIVE: LanePreviewLiveInput = {
  shiftUpcoming: 0,
  shiftRoster: 0,
  shiftGateReady: 0,
  careerApplicants: 0,
  careerTopMatch: null,
  careerInterviews: 0,
  plannerWeeks: 0,
  plannerGaps: 0,
  plannerWorkerDays: 0,
};

function liveOrIdle(count: number, live: string, idle: string): string {
  return count > 0 ? `Preview: ${live}` : idle;
}

function withPreview(card: LanePreviewCardCopy | undefined, preview: string): LanePreviewCardCopy {
  if (!card) {
    return { title: "", blurb: "", preview, testId: "employer-preview-fallback" };
  }
  return { ...card, preview };
}

export function overlayLanePreviewCards(
  domain: EmployerOsDomain,
  live: LanePreviewLiveInput,
): readonly LanePreviewCardCopy[] {
  const base = LANE_PREVIEW_CARDS[domain];
  if (domain === "shift") {
    return [
      withPreview(
        base[0],
        liveOrIdle(live.shiftUpcoming, `${live.shiftUpcoming} upcoming`, base[0]?.preview ?? ""),
      ),
      withPreview(
        base[1],
        liveOrIdle(live.shiftRoster, `${live.shiftRoster} workers`, base[1]?.preview ?? ""),
      ),
      withPreview(
        base[2],
        liveOrIdle(
          live.shiftGateReady,
          `${live.shiftGateReady} gate-ready`,
          base[2]?.preview ?? "",
        ),
      ),
    ];
  }
  if (domain === "career") {
    const match = live.careerTopMatch != null && live.careerTopMatch > 0 ? live.careerTopMatch : 0;
    return [
      withPreview(
        base[0],
        liveOrIdle(
          live.careerApplicants,
          `${live.careerApplicants} applicants`,
          base[0]?.preview ?? "",
        ),
      ),
      withPreview(base[1], liveOrIdle(match, `${match}% Match`, base[1]?.preview ?? "")),
      withPreview(
        base[2],
        liveOrIdle(
          live.careerInterviews,
          `${live.careerInterviews} interview slots`,
          base[2]?.preview ?? "",
        ),
      ),
    ];
  }
  return [
    withPreview(
      base[0],
      liveOrIdle(live.plannerWeeks, `${live.plannerWeeks} active weeks`, base[0]?.preview ?? ""),
    ),
    withPreview(
      base[1],
      liveOrIdle(live.plannerGaps, `${live.plannerGaps} unfilled`, base[1]?.preview ?? ""),
    ),
    withPreview(
      base[2],
      liveOrIdle(
        live.plannerWorkerDays,
        `${live.plannerWorkerDays} worker-days`,
        base[2]?.preview ?? "",
      ),
    ),
  ];
}
