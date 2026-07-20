// App name: Job Mitra
// File name: EmployeeCareerApplicationsPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerApplicationsPage.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { CenterModal } from "../../../../shared/components/CenterModal";
import {
  EmptyState,
  FilterTabs,
  KpiTiles,
  AppCard,
} from "../components/CareerApplicationComponents";
import {
  computeKpi,
  computeTabCounts,
  getAppsSnapshot,
  stageToTab,
  subscribeApps,
} from "../helpers/careerApplicationHelpers";
import { getCareerSearchSnapshot, subscribeCareerSearch } from "../helpers/careerSearchHelpers";
import { PulseTargetCard } from "../../../../features/pulse/PulseTarget";
import { usePulseStore, type PulseNodeId } from "../../../../features/pulse/pulseStore";
import {
  acceptCareerOffer,
  declineCareerOffer,
  withdrawCareerApplication,
} from "../services/careerApplyService";
import { acceptInterview, declineInterview } from "../services/careerInterviewRsvpService";
import type { Tab } from "../types/careerApplicationTypes";
import type { CareerWorkspace } from "../../../employer/careerJobs/types/careerTypes";
import {
  CAREER_WORKSPACES_KEY,
  safeParse,
} from "../../../employer/careerJobs/helpers/careerStorageUtils";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e40af";
const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#64748b";

type EmployeeApplicationPulseTarget = {
  readonly pulseId: PulseNodeId;
};

function getEmployeeApplicationPulseTarget(stage: string): EmployeeApplicationPulseTarget | null {
  if (stage === "shortlisted") {
    return {
      pulseId: "career-applications-shortlisted",
    };
  }

  if (stage === "interview") {
    return {
      pulseId: "career-funnel-interviews",
    };
  }

  if (stage === "offered" || stage === "offer_accepted") {
    return {
      pulseId: "career-applications-offers",
    };
  }

  return null;
}

function getPulseTabOverride(activePulseNodeId: PulseNodeId | null): Tab | null {
  if (activePulseNodeId === "career-funnel-interviews") {
    return "interview";
  }

  if (activePulseNodeId === "career-applications-offers") {
    return "offers";
  }

  if (activePulseNodeId === "career-applications-shortlisted") {
    return "active";
  }

  return null;
}

export function EmployeeCareerApplicationsPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("active");
  const [withdrawJobId, setWithdrawJobId] = useState<string | null>(null);
  const [withdrawJobTitle, setWithdrawJobTitle] = useState("");
  const [declineJobId, setDeclineJobId] = useState<string | null>(null);
  const [declineJobTitle, setDeclineJobTitle] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const apps = useSyncExternalStore(subscribeApps, getAppsSnapshot, getAppsSnapshot);
  const posts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );

  const postsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getCareerSearchSnapshot>[number]>();
    for (const post of posts) map.set(post.id, post);
    return map;
  }, [posts]);

  const counts = useMemo(() => computeTabCounts(apps), [apps]);
  const activePulseNodeId = usePulseStore((state) => state.chain[0] ?? null);
  const pulseTabOverride = getPulseTabOverride(activePulseNodeId);
  const visibleTab = pulseTabOverride ?? tab;
  const filtered = useMemo(
    () => apps.filter((app) => visibleTab === "all" || stageToTab(app.stage) === visibleTab),
    [apps, visibleTab],
  );
  const kpi = useMemo(() => computeKpi(filtered), [filtered]);

  function handleWithdrawConfirm() {
    if (!withdrawJobId) return;

    const ok = withdrawCareerApplication(withdrawJobId);

    setWithdrawJobId(null);
    setWithdrawJobTitle("");

    if (!ok) {
      setActionError("This application cannot be withdrawn from its current status.");
    }
  }

  function handleDeclineOfferConfirm() {
    if (!declineJobId) return;

    const ok = declineCareerOffer(declineJobId);

    setDeclineJobId(null);
    setDeclineJobTitle("");

    if (!ok) {
      setActionError("This offer cannot be declined from its current status.");
    }
  }

  const goFind = () => nav(ROUTE_PATHS.employeeCareerSearch);

  function openApplicationTarget(jobId: string, stage: string) {
    if (stage !== "hired") {
      nav(ROUTE_PATHS.employeeCareerPostDetails.replace(":postId", jobId));
      return;
    }

    const workspaces = safeParse<CareerWorkspace>(localStorage.getItem(CAREER_WORKSPACES_KEY));
    const workspace = workspaces.find((item) => item.jobId === jobId);

    if (workspace) {
      nav(ROUTE_PATHS.employeeCareerWorkspace.replace(":workspaceId", workspace.id));
      return;
    }

    nav(ROUTE_PATHS.employeeCareerApplications.replace("applications", "workspaces"));
  }

  return (
    <div style={{ paddingBottom: "32px" }}>
      <CenterModal
        open={withdrawJobId !== null}
        onBackdropClose={() => setWithdrawJobId(null)}
        ariaLabel="Withdraw Application"
      >
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--wm-error, #dc2626)" }}>
            Withdraw application?
          </div>

          <div style={{ fontSize: 14, color: CAREER_MUTED, marginTop: 8, lineHeight: 1.6 }}>
            Your application for <b>{withdrawJobTitle}</b> will be withdrawn. The employer may stop
            processing it after this.
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <button className="wm-outlineBtn" type="button" onClick={() => setWithdrawJobId(null)}>
              Cancel
            </button>

            <button
              className="wm-primarybtn"
              type="button"
              onClick={handleWithdrawConfirm}
              style={{
                background: "var(--wm-error, #dc2626)",
                borderColor: "var(--wm-error, #dc2626)",
              }}
            >
              Withdraw
            </button>
          </div>
        </div>
      </CenterModal>

      <CenterModal
        open={declineJobId !== null}
        onBackdropClose={() => {
          setDeclineJobId(null);
          setDeclineJobTitle("");
        }}
        ariaLabel="Decline Offer"
      >
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--wm-error, #dc2626)" }}>
            Decline job offer?
          </div>

          <div style={{ fontSize: 14, color: CAREER_MUTED, marginTop: 8, lineHeight: 1.6 }}>
            Your offer for <b>{declineJobTitle}</b> will be declined. This will close this
            application in your records. Continue only if you do not want to proceed with this
            offer.
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <button
              className="wm-outlineBtn"
              type="button"
              onClick={() => {
                setDeclineJobId(null);
                setDeclineJobTitle("");
              }}
            >
              Cancel
            </button>

            <button
              className="wm-primarybtn"
              type="button"
              onClick={handleDeclineOfferConfirm}
              style={{
                background: "var(--wm-error, #dc2626)",
                borderColor: "var(--wm-error, #dc2626)",
              }}
            >
              Decline Offer
            </button>
          </div>
        </div>
      </CenterModal>

      <CenterModal
        open={actionError !== null}
        onBackdropClose={() => setActionError(null)}
        ariaLabel="Application Action Notice"
      >
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--wm-error, #dc2626)" }}>
            Action unavailable
          </div>

          <div style={{ fontSize: 14, color: CAREER_MUTED, marginTop: 8, lineHeight: 1.6 }}>
            {actionError}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <button className="wm-outlineBtn" type="button" onClick={() => setActionError(null)}>
              OK
            </button>
          </div>
        </div>
      </CenterModal>

      {/* Consistent Hero Section */}
      <section
        style={{
          margin: "2px 4px 0 4px",
          padding: "16px",
          borderRadius: "20px",
          border: "1px solid rgba(29,78,216,0.12)",
          background: "linear-gradient(135deg, #ffffff, #eff6ff)",
          boxShadow: "0 4px 14px rgba(29,78,216,0.03)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              minWidth: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                flexShrink: 0,
                background: "rgba(29,78,216,0.08)",
                border: "1px solid rgba(29,78,216,0.12)",
                color: CAREER_BLUE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  background: "rgba(29,78,216,0.1)",
                  color: CAREER_BLUE,
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Career Applications
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 900,
                  color: CAREER_TEXT,
                  lineHeight: 1.2,
                }}
              >
                Track your application journey
              </h1>

              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "13px",
                  color: CAREER_MUTED,
                  fontWeight: 500,
                }}
              >
                Review applications, interviews, offers, and outcomes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={goFind}
            style={{
              flexShrink: 0,
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 800,
              border: "1px solid rgba(29,78,216,0.2)",
              color: CAREER_BLUE_DEEP,
              background: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            Find Jobs
          </button>
        </div>
      </section>

      <div style={{ padding: "0 4px" }}>
        <KpiTiles kpi={kpi} />
        <FilterTabs tab={visibleTab} counts={counts} onChange={setTab} />

        {filtered.length === 0 && <EmptyState onFind={goFind} />}

        {filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((app) => {
              const pulseTarget = getEmployeeApplicationPulseTarget(app.stage);
              const isPulseActive = Boolean(
                pulseTarget && pulseTarget.pulseId === activePulseNodeId,
              );

              const applicationCard = (
                <AppCard
                  app={app}
                  post={postsMap.get(app.jobId)}
                  isPulseActive={isPulseActive}
                  onOpen={() => openApplicationTarget(app.jobId, app.stage)}
                  onAcceptOffer={() => {
                    const result = acceptCareerOffer(app.jobId);

                    if (result.ok) {
                      setActionError(null);
                      return;
                    }

                    setActionError("This offer cannot be accepted from its current status.");
                  }}
                  onDeclineOffer={() => {
                    const post = postsMap.get(app.jobId);
                    setDeclineJobTitle(post?.jobTitle ?? "this position");
                    setDeclineJobId(app.jobId);
                  }}
                  onAcceptInterview={() => {
                    const ok = acceptInterview(app.jobId);
                    if (!ok) {
                      setActionError("This interview cannot be accepted from its current status.");
                    }
                  }}
                  onDeclineInterview={() => {
                    const ok = declineInterview(app.jobId);
                    if (!ok) {
                      setActionError("This interview cannot be declined from its current status.");
                    }
                  }}
                  onWithdraw={() => {
                    const post = postsMap.get(app.jobId);
                    setWithdrawJobTitle(post?.jobTitle ?? "this position");
                    setWithdrawJobId(app.jobId);
                  }}
                />
              );

              if (!pulseTarget) {
                return <div key={app.id}>{applicationCard}</div>;
              }

              return (
                <PulseTargetCard
                  key={app.id}
                  pulseId={pulseTarget.pulseId}
                  edgeMode="full"
                  radius="24px"
                >
                  {applicationCard}
                </PulseTargetCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
