// src/features/employee/workVault/components/WorkerLevelCard.tsx
//
// Worker Trust Level card for Work Vault Profile tab.
// Shows: Level badge, Points, Progress to next level, History snippet.

import { useMemo } from "react";
import { workerPointsStorage } from "../../../../shared/rating/workerPointsStorage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import {
  LEVEL_THRESHOLDS,
  LEVEL_COLORS,
  LEVEL_BG,
  pointsToNextLevel,
} from "../../../../shared/rating/ratingLevels";
import type { RatingLevel } from "../../../../shared/rating/ratingTypes";

/* ------------------------------------------------ */
/* Level Icon                                       */
/* ------------------------------------------------ */
const LEVEL_ICON: Record<RatingLevel, string> = {
  bronze:   "🥉",
  silver:   "🥈",
  gold:     "🥇",
  platinum: "💎",
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function WorkerLevelCard() {
  const wmId = useMemo(() => employeeProfileStorage.get().uniqueId ?? "", []);
  const points = useMemo(
    () => workerPointsStorage.getByWmId(wmId),
    [wmId],
  );

  const level = points.level;
  const threshold = LEVEL_THRESHOLDS[level];
  const color = LEVEL_COLORS[level];
  const bg = LEVEL_BG[level];
  const { next, needed } = pointsToNextLevel(points.total);
  const nextThreshold = next ? LEVEL_THRESHOLDS[next] : null;

  /* Progress bar width */
  const progressPct = useMemo(() => {
    if (!next || !nextThreshold) return 100;
    const range = nextThreshold.min - threshold.min;
    const earned = points.total - threshold.min;
    return Math.min(100, Math.max(0, Math.round((earned / range) * 100)));
  }, [points.total, next, nextThreshold, threshold.min]);

  /* Recent history — last 3 */
  const recentHistory = useMemo(() => points.history.slice(0, 3), [points.history]);

  if (!wmId) return null;

  return (
    <div style={{
      borderRadius: 12, padding: "14px 16px",
      background: bg, border: `1px solid ${color}22`,
      marginBottom: 12,
    }}>
      {/* Row 1: Level + Points */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: bg, border: `1.5px solid ${color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>
            {LEVEL_ICON[level]}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color }}>
              {threshold.label}
            </div>
            <div style={{ fontSize: 11, color, opacity: 0.8, marginTop: 1 }}>
              {threshold.badge}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>
            {points.total}
          </div>
          <div style={{ fontSize: 11, color, opacity: 0.7, marginTop: 1 }}>
            points
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {next && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color, opacity: 0.8 }}>
              Progress to {LEVEL_THRESHOLDS[next].label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color }}>
              {needed} pts needed
            </span>
          </div>
          <div style={{
            height: 6, borderRadius: 999,
            background: `${color}20`,
          }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: color,
              width: `${progressPct}%`,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      )}

      {/* Platinum — max level */}
      {!next && (
        <div style={{
          marginTop: 10, fontSize: 12, fontWeight: 600,
          color, textAlign: "center",
        }}>
          &#10003; Maximum level reached &mdash; Top Pick always
        </div>
      )}

      {/* Recent points history */}
      {recentHistory.length > 0 && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${color}18`, paddingTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 6, opacity: 0.8 }}>
            Recent Activity
          </div>
          {recentHistory.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 11, color: "var(--wm-er-text, #1e293b)" }}>
                {entry.note}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: entry.delta > 0 ? "#16a34a" : "#ef4444",
              }}>
                {entry.delta > 0 ? "+" : ""}{entry.delta}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No points yet */}
      {points.total === 0 && recentHistory.length === 0 && (
        <div style={{
          marginTop: 10, fontSize: 12, color, opacity: 0.7,
          lineHeight: 1.5,
        }}>
          Complete shifts and get rated to earn points and level up.
        </div>
      )}
    </div>
  );
}