/** Three matched guidance cards under the active Work-this-lane pipeline. */

import { EmployerLanePreviewCard } from "./EmployerLanePreviewCard";
import {
  LANE_PREVIEW_CARDS,
  type LanePreviewCardCopy,
} from "../../helpers/employerDashboard.lanePreview";
import type { EmployerOsDomain } from "../../helpers/employerDashboard.osTypes";

type Props = {
  readonly domain: EmployerOsDomain;
  readonly cards?: readonly LanePreviewCardCopy[];
};

export function EmployerLaneSubSections({ domain, cards }: Props) {
  const list = cards ?? LANE_PREVIEW_CARDS[domain];
  return (
    <div
      className="wm-erDashBento wm-erDashBento--triple"
      data-testid={`employer-${domain}-lane-bento`}
    >
      {list.map((card) => (
        <EmployerLanePreviewCard
          key={card.testId}
          title={card.title}
          blurb={card.blurb}
          preview={card.preview}
          testId={card.testId}
        />
      ))}
    </div>
  );
}
