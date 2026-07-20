// App name: Job Mitra
// File name: EmployerRatingHintCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\home\components\EmployerRatingHintCard.tsx

import { countTotalPendingRatings } from "../../helpers/ratingNudgeHelpers";
import {
  CARD_ICON_CONTAINER,
  CARD_SUB,
  CARD_TITLE,
  HOME_COLORS,
} from "../helpers/employerHomeConstants";

export function RatingHintCard() {
  const pendingTotal = countTotalPendingRatings();
  if (pendingTotal === 0) return null;

  return (
    <section className="wm-er-card" style={{ borderLeft: `4px solid ${HOME_COLORS.rating}` }}>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            ...CARD_ICON_CONTAINER,
            background: HOME_COLORS.ratingBg,
            color: HOME_COLORS.rating,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Rate
        </div>
        <div>
          <div style={CARD_TITLE}>
            {pendingTotal} worker{pendingTotal !== 1 ? "s" : ""} awaiting your rating
          </div>
          <div style={{ ...CARD_SUB, lineHeight: 1.5 }}>
            Companies that rate workers get priority access to top-rated talent.
          </div>
        </div>
      </div>
    </section>
  );
}
