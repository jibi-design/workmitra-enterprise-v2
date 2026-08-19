/** Job Mitra | dailyOs.insights.helpers.ts | Profile strength + match band */

import type { DailyOsMatchInsight } from "./dailyOs.types";

export function computeMatchInsight(
  strengthPercent: number,
  matchScores: readonly number[],
): DailyOsMatchInsight {
  const strength = Math.max(0, Math.min(100, Math.round(strengthPercent)));
  const matchPercent =
    matchScores.length === 0
      ? 0
      : Math.round(matchScores.reduce((sum, n) => sum + n, 0) / matchScores.length);

  if (matchPercent >= 70) {
    return { strengthPercent: strength, matchPercent, band: "high", bandLabel: "High demand match" };
  }
  if (matchPercent >= 40) {
    return { strengthPercent: strength, matchPercent, band: "active", bandLabel: "Active matches" };
  }
  if (strength >= 60) {
    return { strengthPercent: strength, matchPercent, band: "building", bandLabel: "Profile building" };
  }
  return { strengthPercent: strength, matchPercent, band: "early", bandLabel: "Early profile" };
}

export function gaugeArcPath(percent: number, radius = 36, cx = 44, cy = 44): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const start = Math.PI;
  const sweep = Math.PI * (clamped / 100);
  const end = start + sweep;
  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);
  const large = sweep > Math.PI ? 1 : 0;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}
