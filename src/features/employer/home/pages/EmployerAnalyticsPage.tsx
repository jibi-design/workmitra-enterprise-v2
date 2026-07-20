/** Job Mitra | EmployerAnalyticsPage.tsx | src/features/employer/home/pages/EmployerAnalyticsPage.tsx */

import { useId, useSyncExternalStore, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { getDashboardSnapshot, subscribeDashboard } from "../helpers/employerHomeDashboard";

type AnalyticsMetricTone = "neutral" | "career" | "shift" | "success";

type AnalyticsSparklineStyle = CSSProperties &
  Partial<{
    "--wm-analytics-tone": string;
  }>;

export function EmployerAnalyticsPage() {
  const nav = useNavigate();
  const data = useSyncExternalStore(subscribeDashboard, getDashboardSnapshot, getDashboardSnapshot);

  const careerMax = Math.max(
    data.careerActive,
    data.careerApplications,
    data.careerInterviews,
    data.careerOffered,
    1,
  );

  const shiftMax = Math.max(
    data.shiftActive,
    data.shiftApplications,
    data.shiftConfirmed,
    data.shiftGroups,
    1,
  );

  const hasCareerActivity =
    data.careerActive + data.careerApplications + data.careerInterviews + data.careerOffered > 0;

  const hasShiftActivity =
    data.shiftActive + data.shiftApplications + data.shiftConfirmed + data.shiftGroups > 0;

  function openCareerPosts() {
    nav(ROUTE_PATHS.employerCareerPosts);
  }

  function createCareerJob() {
    nav(ROUTE_PATHS.employerCareerCreate, {
      state: {
        backTo: ROUTE_PATHS.employerAnalytics,
      },
    });
  }

  function openShiftPosts() {
    nav(ROUTE_PATHS.employerShiftPosts);
  }

  function createShift() {
    nav(ROUTE_PATHS.employerShiftCreate, {
      state: {
        backTo: ROUTE_PATHS.employerAnalytics,
      },
    });
  }

  return (
    <div className="wm-analyticsPage">
      <section className="wm-analyticsHero">
        <div className="wm-analyticsHeroKicker">Executive Snapshot</div>

        <h1 className="wm-analyticsHeroTitle">Business Intelligence</h1>

        <p className="wm-analyticsHeroSub">Local hiring and workforce activity snapshot.</p>

        <div className="wm-analyticsHeroMetrics">
          <MetricBlock label="Total Posts" value={data.totalPosts} tone="neutral" hero />
          <MetricBlock
            label="Total Applications"
            value={data.applicationsActivity}
            tone="neutral"
            hero
          />
          <MetricBlock label="Hired / Confirmed" value={data.hiringActivity} tone="success" hero />
        </div>
      </section>

      <div className="wm-analyticsGrid">
        <section className="wm-analyticsCard isCareer">
          <div className="wm-analyticsSectionKicker isCareer">Career Operations</div>

          <h2 className="wm-analyticsSectionTitle">Permanent Hiring Funnel</h2>

          <p className="wm-analyticsSectionSub">Permanent hiring pipeline.</p>

          <div className="wm-analyticsFunnelList">
            <FunnelRow
              label="Active Posts"
              value={data.careerActive}
              total={careerMax}
              tone="career"
              onOpen={openCareerPosts}
            />

            <FunnelRow
              label="Applications"
              value={data.careerApplications}
              total={careerMax}
              tone="career"
              onOpen={openCareerPosts}
            />

            <FunnelRow
              label="Interviews"
              value={data.careerInterviews}
              total={careerMax}
              tone="career"
              onOpen={openCareerPosts}
            />

            <FunnelRow
              label="Offers Made"
              value={data.careerOffered}
              total={careerMax}
              tone="success"
              onOpen={openCareerPosts}
            />
          </div>

          {!hasCareerActivity && (
            <NoDataHint tone="career">
              Post your first career job to see pipeline analytics.
            </NoDataHint>
          )}

          <div className="wm-analyticsActionRow">
            <button
              type="button"
              className="wm-analyticsActionBtn isCareerSecondary"
              onClick={openCareerPosts}
            >
              Open Career Posts
            </button>

            <button
              type="button"
              className="wm-analyticsActionBtn isCareerPrimary"
              onClick={createCareerJob}
            >
              + Create Career Job
            </button>
          </div>
        </section>

        <section className="wm-analyticsCard isShift">
          <div className="wm-analyticsSectionKicker isShift">Shift Operations</div>

          <h2 className="wm-analyticsSectionTitle">Daily / Weekly Activity</h2>

          <p className="wm-analyticsSectionSub">Daily and weekly shift activity.</p>

          <div className="wm-analyticsFunnelList">
            <FunnelRow
              label="Active Shifts"
              value={data.shiftActive}
              total={shiftMax}
              tone="shift"
              onOpen={openShiftPosts}
            />

            <FunnelRow
              label="Shift Applications"
              value={data.shiftApplications}
              total={shiftMax}
              tone="shift"
              onOpen={openShiftPosts}
            />

            <FunnelRow
              label="Confirmed"
              value={data.shiftConfirmed}
              total={shiftMax}
              tone="success"
              onOpen={openShiftPosts}
            />

            <FunnelRow
              label="Work Groups"
              value={data.shiftGroups}
              total={shiftMax}
              tone="shift"
              onOpen={openShiftPosts}
            />
          </div>

          {!hasShiftActivity && (
            <NoDataHint tone="shift">
              Create your first shift to see daily activity analytics.
            </NoDataHint>
          )}

          <div className="wm-analyticsActionRow">
            <button
              type="button"
              className="wm-analyticsActionBtn isShiftSecondary"
              onClick={openShiftPosts}
            >
              Open Shift Posts
            </button>

            <button
              type="button"
              className="wm-analyticsActionBtn isShiftPrimary"
              onClick={createShift}
            >
              + Create Shift
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricBlock({
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

function FunnelRow({
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

function NoDataHint({ tone, children }: { tone: "career" | "shift"; children: string }) {
  return (
    <div className={`wm-analyticsNoDataHint is${tone[0].toUpperCase()}${tone.slice(1)}`}>
      <span className="wm-analyticsNoDataIcon" aria-hidden="true">
        i
      </span>

      <span>{children}</span>
    </div>
  );
}

function getToneColor(tone: Exclude<AnalyticsMetricTone, "neutral">): string {
  if (tone === "success") return "var(--wm-success)";
  if (tone === "shift") return "var(--wm-shift-accent)";

  return "var(--wm-career-accent)";
}
