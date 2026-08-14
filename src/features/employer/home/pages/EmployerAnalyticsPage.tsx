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
        <div className="wm-analyticsHeroKicker">This week</div>
        <h1 className="wm-analyticsHeroTitle">How hiring is going</h1>
        <p className="wm-analyticsHeroSub">
          A quick look at posts, applications, and people you’ve hired or confirmed.
        </p>

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
          <div className="wm-analyticsSectionKicker isCareer">Career</div>
          <h2 className="wm-analyticsSectionTitle">Permanent roles</h2>
          <p className="wm-analyticsSectionSub">From post to offer, in one place.</p>

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
            <NoDataHint tone="career">Post a career job to see these numbers fill in.</NoDataHint>
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
          <div className="wm-analyticsSectionKicker isShift">Shift</div>
          <h2 className="wm-analyticsSectionTitle">Day-to-day shifts</h2>
          <p className="wm-analyticsSectionSub">
            Who applied, who’s confirmed, and which groups are live.
          </p>

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
            <NoDataHint tone="shift">Create a shift to see this activity.</NoDataHint>
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
