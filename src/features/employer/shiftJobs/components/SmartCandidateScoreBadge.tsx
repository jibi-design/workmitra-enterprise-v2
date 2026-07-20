// App name: Job Mitra
// File name: SmartCandidateScoreBadge.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\SmartCandidateScoreBadge.tsx

import { LEVEL_COLOR, LEVEL_LABEL } from "../helpers/smartSelectionHelpers";
import type { ScoredApplication } from "../helpers/smartSelectionHelpers";

export function SmartCandidateScoreBadge({ scored }: { scored: ScoredApplication }) {
  const { avgStars, ratingCount, level, mustHavePct } = scored;
  const levelColor = LEVEL_COLOR[level];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 4,
        paddingLeft: 2,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: 999,
          color: levelColor,
          background: `${levelColor}12`,
          border: `1px solid ${levelColor}30`,
        }}
      >
        {LEVEL_LABEL[level]}
      </span>

      {ratingCount > 0 && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 999,
            color: "#b45309",
            background: "rgba(180,83,9,0.08)",
          }}
        >
          Rating: {avgStars.toFixed(1)} ({ratingCount})
        </span>
      )}

      {Object.keys(scored.app.mustHaveAnswers).length > 0 && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 999,
            color: mustHavePct === 1 ? "#15803d" : mustHavePct >= 0.5 ? "#d97706" : "#dc2626",
            background:
              mustHavePct === 1
                ? "rgba(22,163,74,0.08)"
                : mustHavePct >= 0.5
                  ? "rgba(217,119,6,0.08)"
                  : "rgba(220,38,38,0.08)",
          }}
        >
          Must-have: {Math.round(mustHavePct * 100)}%
        </span>
      )}

      {ratingCount === 0 && (
        <span style={{ fontSize: 10, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
          No ratings yet
        </span>
      )}
    </div>
  );
}
