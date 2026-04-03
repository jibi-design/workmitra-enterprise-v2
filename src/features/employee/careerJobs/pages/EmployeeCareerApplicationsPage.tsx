// src/features/employee/careerJobs/pages/EmployeeCareerApplicationsPage.tsx
//
// My Career Applications — main page. Orchestration only.
// Domain: Career Blue #1d4ed8

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getCareerSearchSnapshot,
  subscribeCareerSearch,
} from "../helpers/careerSearchHelpers";
import { withdrawCareerApplication, acceptCareerOffer, declineCareerOffer } from "../services/careerApplyService";
import { CenterModal } from "../../../../shared/components/CenterModal";
import {
  getAppsSnapshot, subscribeApps,
  stageToTab, computeKpi, computeTabCounts,
} from "../helpers/careerApplicationHelpers";
import type { Tab } from "../types/careerApplicationTypes";
import {
  KpiTiles, FilterTabs, EmptyState, AppCard,
} from "../components/CareerApplicationComponents";


/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployeeCareerApplicationsPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("active");
  const [withdrawJobId, setWithdrawJobId] = useState<string | null>(null);
  const [withdrawJobTitle, setWithdrawJobTitle] = useState("");

  const apps = useSyncExternalStore(subscribeApps, getAppsSnapshot, getAppsSnapshot);
  const posts = useSyncExternalStore(subscribeCareerSearch, getCareerSearchSnapshot, getCareerSearchSnapshot);

  const postsMap = useMemo(() => {
    const m = new Map<string, ReturnType<typeof getCareerSearchSnapshot>[number]>();
    for (const p of posts) m.set(p.id, p);
    return m;
  }, [posts]);

  const kpi = useMemo(() => computeKpi(apps), [apps]);
  const counts = useMemo(() => computeTabCounts(apps), [apps]);
  const filtered = useMemo(
    () => apps.filter((a) => tab === "all" || stageToTab(a.stage) === tab),
    [apps, tab],
  );

  function handleWithdrawConfirm() {
    if (!withdrawJobId) return;
    withdrawCareerApplication(withdrawJobId);
    setWithdrawJobId(null);
    setWithdrawJobTitle("");
  }

  const goFind = () => nav(ROUTE_PATHS.employeeCareerSearch);

  return (
    <div>
      {/* Withdraw Modal */}
      <CenterModal
        open={withdrawJobId !== null}
        onBackdropClose={() => setWithdrawJobId(null)}
        ariaLabel="Withdraw Application"
      >
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#ef4444" }}>Withdraw Application?</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, lineHeight: 1.6 }}>
            Your application for <b>{withdrawJobTitle}</b> will be withdrawn.
            You can re-apply if the position is still open.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button className="wm-outlineBtn" type="button" onClick={() => setWithdrawJobId(null)}>
              Cancel
            </button>
            <button
              className="wm-primarybtn" type="button" onClick={handleWithdrawConfirm}
              style={{ background: "#ef4444", borderColor: "#ef4444" }}
            >
              Withdraw
            </button>
          </div>
        </div>
      </CenterModal>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#eff6ff", border: "1px solid rgba(29,78,216,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24">
              <path fill="#1d4ed8" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text, #1e293b)" }}>My Applications</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Track your career applications</div>
          </div>
        </div>
        <button type="button" onClick={goFind} style={{
          padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          border: "1.5px solid #1d4ed8", color: "#1d4ed8",
          background: "transparent", cursor: "pointer",
        }}>
          Find Jobs
        </button>
      </div>

     {/* KPI Tiles */}
      <KpiTiles kpi={kpi} />

      {/* Filter Tabs */}
      <FilterTabs tab={tab} counts={counts} onChange={setTab} />

      {/* Empty State */}
      {filtered.length === 0 && <EmptyState onFind={goFind} />}

      {/* Application Cards */}
      {filtered.length > 0 && filtered.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          post={postsMap.get(app.jobId)}
          onOpen={() => nav(ROUTE_PATHS.employeeCareerPostDetails.replace(":postId", app.jobId))}
          onAcceptOffer={() => { acceptCareerOffer(app.jobId); }}
          onDeclineOffer={() => { declineCareerOffer(app.jobId); }}
          onWithdraw={() => {
            const post = postsMap.get(app.jobId);
            setWithdrawJobTitle(post?.jobTitle ?? "this position");
            setWithdrawJobId(app.jobId);
          }}
        />
      ))}

      <div style={{ height: 32 }} />
    </div>
  );
}