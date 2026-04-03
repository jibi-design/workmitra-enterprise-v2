// src/features/employer/careerJobs/pages/EmployerCareerHomePage.tsx
//
// Career Jobs control room for employer.
// KPI tiles, recent posts, how-it-works guide, empty state.

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { CareerJobPost } from "../types/careerTypes";
import { getCareerPosts } from "../services/careerPostService";
import { CAREER_EVENTS } from "../services/careerPipelineService";
import { CAREER_POSTS_KEY } from "../helpers/careerStorageUtils";
import { EmployerMyEmployeesCard } from "../components/EmployerMyEmployeesCard";

/* ------------------------------------------------ */
/* SVG Icons                                        */
/* ------------------------------------------------ */
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6Z" />
    </svg>
  );
}

function IconEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="var(--wm-er-muted)"
        opacity="0.3"
        d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2Zm-6 0h-4V4h4v2Z"
      />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Stable-reference cache                           */
/* ------------------------------------------------ */
let cachedRaw: string | null = "__init__";
let cachedPosts: CareerJobPost[] = [];

function getPostsSnapshot(): CareerJobPost[] {
  const raw = localStorage.getItem(CAREER_POSTS_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPosts = getCareerPosts();
  }
  return cachedPosts;
}

function subscribePosts(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(CAREER_EVENTS.careerPostsChanged, handler);
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);
  return () => {
    window.removeEventListener(CAREER_EVENTS.careerPostsChanged, handler);
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

/* ------------------------------------------------ */
/* Post Status Display                              */
/* ------------------------------------------------ */
type StatusDisplay = { label: string; color: string };

function getStatusDisplay(post: CareerJobPost): StatusDisplay {
  if (post.status === "filled") return { label: "Filled", color: "var(--wm-success)" };
  if (post.status === "closed") return { label: "Closed", color: "var(--wm-er-muted)" };
  if (post.status === "paused") return { label: "Paused", color: "var(--wm-warning)" };
  if (post.status === "draft") return { label: "Draft", color: "var(--wm-er-muted)" };
  return { label: "Active", color: "var(--wm-er-accent-career)" };
}

/* ------------------------------------------------ */
/* Static Styles                                    */
/* ------------------------------------------------ */
const postBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-14)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
  cursor: "pointer",
  textAlign: "left",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--wm-er-text)",
  marginBottom: 8,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const emptyStateStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: "32px 16px",
  textAlign: "center",
};

/* ------------------------------------------------ */
/* How It Works steps                               */
/* ------------------------------------------------ */
const HOW_IT_WORKS = [
  { n: "1", text: "Create a career post with job details and requirements" },
  { n: "2", text: "Applicants find your post and apply with their profile" },
  { n: "3", text: "Shortlist candidates and schedule interviews" },
  { n: "4", text: "Send offers and hire — a workspace is created automatically" },
];

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerCareerHomePage() {
  const nav = useNavigate();
  const posts = useSyncExternalStore(subscribePosts, getPostsSnapshot, getPostsSnapshot);

  const kpi = useMemo(() => {
    let active = 0; let paused = 0; let totalApps = 0;
    let inInterview = 0; let offered = 0; let hired = 0;
    for (const p of posts) {
      if (p.status === "active") active++;
      if (p.status === "paused") paused++;
      totalApps += p.totalApplications;
      inInterview += p.inInterview;
      offered += p.offered;
      hired += p.hired;
    }
    return { total: posts.length, active, paused, totalApps, inInterview, offered, hired };
  }, [posts]);

  const recentPosts = useMemo(() => posts.slice(0, 5), [posts]);

  function openPostDashboard(postId: string): void {
    nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId));
  }

  return (
    <div className="wm-er-vCareer">
      {/* Page Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Career Jobs</div>
          <div className="wm-pageSub">Post permanent roles and manage candidates</div>
        </div>
        <button
          className="wm-primarybtn"
          type="button"
          onClick={() => nav(ROUTE_PATHS.employerCareerCreate)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
        >
          <IconPlus />
          New Job
        </button>
      </div>

     {/* KPI Tiles — Row 1 */}
      <div className="wm-er-tiles" style={{ marginTop: 14 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Posts</div>
          <div className="wm-er-tileValue">{kpi.total}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Active</div>
          <div
            className="wm-er-tileValue"
            style={{ color: kpi.active > 0 ? "var(--wm-er-accent-career)" : undefined }}
          >
            {kpi.active}
          </div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Applications</div>
          <div className="wm-er-tileValue">{kpi.totalApps}</div>
        </div>
      </div>

      {/* KPI Tiles — Row 2 */}
      <div className="wm-er-tiles" style={{ marginTop: 8 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Interviews</div>
          <div
            className="wm-er-tileValue"
            style={{ color: kpi.inInterview > 0 ? "var(--wm-warning)" : undefined }}
          >
            {kpi.inInterview}
          </div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Offered</div>
          <div
            className="wm-er-tileValue"
            style={{ color: kpi.offered > 0 ? "var(--wm-er-accent-career)" : undefined }}
          >
            {kpi.offered}
          </div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Hired</div>
          <div
            className="wm-er-tileValue"
            style={{ color: kpi.hired > 0 ? "var(--wm-success)" : undefined }}
          >
            {kpi.hired}
          </div>
        </div>
      </div>

      {/* My Employees */}
      <EmployerMyEmployeesCard onOpenPost={(postId) => nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId))} />

      {/* How It Works */}
      <div className="wm-er-card" style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-text)" }}>
          How it works
        </div>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {HOW_IT_WORKS.map((s) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                background: "rgba(55,48,163,0.10)",
                color: "var(--wm-er-accent-career)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}>
                {s.n}
              </div>
              <div style={{ fontSize: 13, color: "var(--wm-er-text)" }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts / Empty State */}
      {recentPosts.length > 0 ? (
        <div style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={sectionTitleStyle}>Recent Posts</div>
          <div style={{ display: "grid", gap: 8 }}>
            {recentPosts.map((p) => {
              const status = getStatusDisplay(p);
              return (
                <button key={p.id} type="button" style={postBtnStyle} onClick={() => openPostDashboard(p.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: "var(--wm-er-text)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {p.jobTitle} &mdash; {p.companyName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                        {p.totalApplications} applied &middot; {p.shortlisted} shortlisted &middot; {p.inInterview} interview &middot; {p.hired} hired
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: status.color, whiteSpace: "nowrap" }}>
                        {status.label}
                      </span>
                      <span style={{ color: "var(--wm-er-muted)" }}>
                        <IconArrowRight />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={emptyStateStyle}>
            <IconEmpty />
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--wm-er-text)" }}>
              No career posts yet
            </div>
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 280, lineHeight: 1.5 }}>
              Create your first career post to start receiving applications from candidates.
            </div>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={() => nav(ROUTE_PATHS.employerCareerCreate)}
              style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <IconPlus />
              Create First Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}