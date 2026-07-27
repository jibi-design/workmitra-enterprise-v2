/** Job Mitra | EmployerAnalyticsPage.tsx | src/features/employer/home/pages/EmployerAnalyticsPage.tsx */

import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { getDashboardSnapshot, subscribeDashboard } from "../helpers/employerHomeDashboard";
import { FunnelRow, MetricBlock, NoDataHint } from "./EmployerAnalyticsPage.parts";

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
      state: { backTo: ROUTE_PATHS.employerAnalytics },
    });
  }

  function openShiftPosts() {
    nav(ROUTE_PATHS.employerShiftPosts);
  }

  function createShift() {
    nav(ROUTE_PATHS.employerShiftCreate, {
      state: { backTo: ROUTE_PATHS.employerAnalytics },
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
