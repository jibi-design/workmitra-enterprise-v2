import type { CSSProperties } from "react";

export type AnalyticsMetricTone = "neutral" | "career" | "shift" | "success";

export type AnalyticsSparklineStyle = CSSProperties &
  Partial<{
    "--wm-analytics-tone": string;
  }>;

export function getToneColor(tone: Exclude<AnalyticsMetricTone, "neutral">): string {
  if (tone === "success") return "var(--wm-success)";
  if (tone === "shift") return "var(--wm-shift-accent)";
  return "var(--wm-career-accent)";
}
