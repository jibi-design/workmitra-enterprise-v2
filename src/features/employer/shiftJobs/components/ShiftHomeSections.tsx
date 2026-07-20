// App name: Job Mitra
// File name: ShiftHomeSections.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftHomeSections.tsx

export { ShiftHomeActionRow } from "./ShiftHomeActionRow";
export { ShiftHomeAnalyzedSection } from "./ShiftHomeAnalyzedSection";
export { ShiftHomeKpiTiles } from "./ShiftHomeKpiTiles";
export { ShiftHomeRecentPosts } from "./ShiftHomeRecentPosts";

import { HOW_IT_WORKS } from "../helpers/shiftHomeHelpers";

export function ShiftRatingNudge({ pendingCount }: { pendingCount: number }) {
  if (pendingCount === 0) return null;

  return (
    <div className="wm-shiftHomeRatingNudge">
      <div>
        <div className="wm-shiftHomeRatingTitle">
          {pendingCount} worker{pendingCount !== 1 ? "s" : ""} pending rating
        </div>

        <div className="wm-shiftHomeRatingText">
          Rate completed shifts to help workers get better opportunities.
        </div>
      </div>

      <div className="wm-shiftHomeRatingBadge">Rate</div>
    </div>
  );
}

export function ShiftHomeTemplatesHint({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null;

  return (
    <button type="button" onClick={onClick} className="wm-shiftHomeTemplateHint">
      <span className="wm-shiftHomeTemplateCount">
        {count} saved template{count !== 1 ? "s" : ""}
      </span>

      <span className="wm-shiftHomeTemplateAction">Use a template</span>
    </button>
  );
}

export function ShiftHomeHowItWorks() {
  return (
    <div className="wm-er-card wm-shiftHomeHowCard">
      <div className="wm-shiftHomeSectionTitle">How it works</div>

      <div className="wm-shiftHomeHowGrid">
        {HOW_IT_WORKS.map((step) => (
          <div key={step.n} className="wm-shiftHomeHowStep">
            <div className="wm-shiftHomeHowNumber">{step.n}</div>

            <div className="wm-shiftHomeHowText">{step.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
