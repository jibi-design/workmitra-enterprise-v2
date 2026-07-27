import { useId } from "react";
import {
  getToneColor,
  type AnalyticsMetricTone,
  type AnalyticsSparklineStyle,
} from "./EmployerAnalyticsPage.helpers";

export type { AnalyticsMetricTone, AnalyticsSparklineStyle } from "./EmployerAnalyticsPage.helpers";

export function MetricBlock({
  label,
  value,
  tone,
  hero = false,
}: {
  label: string;
  value: number;
  tone: AnalyticsMetricTone;
  hero?: boolean;
}) {
  const stateClassName = value > 0 ? "isPositive" : "isZero";
  const toneClassName = `is${tone[0].toUpperCase()}${tone.slice(1)}`;

  return (
    <div
      className={["wm-analyticsMetricBlock", stateClassName, toneClassName, hero ? "isHero" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="wm-analyticsMetricLabel">{label}</div>
      <div className="wm-analyticsMetricValue">{value}</div>
    </div>
  );
}

export function FunnelRow({
  label,
  value,
  total,
  tone,
  onOpen,
}: {
  label: string;
  value: number;
  total: number;
  tone: Exclude<AnalyticsMetricTone, "neutral">;
  onOpen: () => void;
}) {
  const percentage = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const stateClassName = value > 0 ? "isPositive" : "isZero";
  const toneClassName = `is${tone[0].toUpperCase()}${tone.slice(1)}`;

  return (
    <button
      type="button"
      className={["wm-analyticsFunnelRowButton", stateClassName, toneClassName].join(" ")}
      onClick={onOpen}
    >
      <div className="wm-analyticsFunnelHead">
        <span>{label}</span>
        <span className="wm-analyticsFunnelMeta">
          <span className="wm-analyticsFunnelValue">{value}</span>
          <span className="wm-analyticsChevron">›</span>
        </span>
      </div>
      <ContinuousAreaSparkline tone={tone} isActive={percentage > 0} />
    </button>
  );
}

function ContinuousAreaSparkline({
  tone,
  isActive,
}: {
  tone: Exclude<AnalyticsMetricTone, "neutral">;
  isActive: boolean;
}) {
  const rawId = useId();
  const gradientId = `wmAnalyticsSparklineGradient${rawId.replace(/:/g, "")}`;

  const sparklineStyle: AnalyticsSparklineStyle = {
    "--wm-analytics-tone": getToneColor(tone),
  };

  return (
    <div className="wm-analyticsSparklineWrap">
      <svg
        className="wm-analyticsSparklineSvg"
        viewBox="0 0 160 34"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        style={sparklineStyle}
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="7"
            x2="0"
            y2="34"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" className="wm-analyticsSparklineGradientTop" />
            <stop offset="58%" className="wm-analyticsSparklineGradientMid" />
            <stop offset="100%" className="wm-analyticsSparklineGradientBottom" />
          </linearGradient>
        </defs>

        <path
          className="wm-analyticsSparklineGhost"
          d="M3 23 C18 20 28 14 42 16 C57 18 66 24 81 19 C96 14 104 8 119 10 C134 12 143 20 157 8"
        />

        {isActive && (
          <>
            <path
              className="wm-analyticsSparklineArea"
              d="M3 23 C18 20 28 14 42 16 C57 18 66 24 81 19 C96 14 104 8 119 10 C134 12 143 20 157 8 L157 34 L3 34 Z"
              fill={`url(#${gradientId})`}
            />
            <path
              className="wm-analyticsSparklineLine"
              d="M3 23 C18 20 28 14 42 16 C57 18 66 24 81 19 C96 14 104 8 119 10 C134 12 143 20 157 8"
            />
            <circle className="wm-analyticsSparklineDot" cx="157" cy="8" r="2.8" />
          </>
        )}
      </svg>
    </div>
  );
}

export function NoDataHint({ tone, children }: { tone: "career" | "shift"; children: string }) {
  return (
    <div className={`wm-analyticsNoDataHint is${tone[0].toUpperCase()}${tone.slice(1)}`}>
      <span className="wm-analyticsNoDataIcon" aria-hidden="true">
        i
      </span>
      <span>{children}</span>
    </div>
  );
}
