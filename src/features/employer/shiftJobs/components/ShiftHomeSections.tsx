// src/features/employer/shiftJobs/components/ShiftHomeSections.tsx
// All section components for EmployerShiftHomePage.

import type { ShiftPost } from "../storage/employerShift.storage";
import {
  tileColor, HOW_IT_WORKS, countApplicationsForPost,
  getPostStatusDisplay,
} from "../helpers/shiftHomeHelpers";
import {
  IconPost, IconGroup, IconBroadcast, IconFavorites,
  IconAnalysis, IconArrowRight, IconEmpty, IconPlus,
} from "./ShiftHomeIcons";

/* ------------------------------------------------ */
/* Shared styles                                    */
/* ------------------------------------------------ */
const actionIconWrap: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(15,118,110,0.08)", color: "var(--wm-er-accent-shift)",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)",
  marginBottom: 8, display: "flex", alignItems: "center", gap: 8,
};

const recentPostBtn: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  borderRadius: "var(--wm-radius-14)", border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)", cursor: "pointer", textAlign: "left",
};

const analyzedPostBtn: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  borderRadius: "var(--wm-radius-10)", border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)", cursor: "pointer", textAlign: "left",
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
};

/* ------------------------------------------------ */
/* KPI Tiles                                        */
/* ------------------------------------------------ */
type KpiData = {
  total: number; open: number; active: number;
  applied: number; shortlisted: number; confirmed: number; groups: number;
};

export function ShiftHomeKpiTiles({ kpi }: { kpi: KpiData }) {
  return (
    <>
      <div className="wm-er-tiles" style={{ marginTop: 14 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Posts</div>
          <div className="wm-er-tileValue" style={tileColor(kpi.total)}>{kpi.total}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Open</div>
          <div className="wm-er-tileValue" style={tileColor(kpi.open, "var(--wm-er-accent-shift)")}>{kpi.open}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Active</div>
          <div className="wm-er-tileValue" style={tileColor(kpi.active, "var(--wm-success)")}>{kpi.active}</div>
        </div>
      </div>
      <div className="wm-er-tiles" style={{ marginTop: 8 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Applied</div>
          <div className="wm-er-tileValue" style={tileColor(kpi.applied)}>{kpi.applied}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Shortlisted</div>
          <div className="wm-er-tileValue" style={tileColor(kpi.shortlisted, "var(--wm-warning)")}>{kpi.shortlisted}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Confirmed</div>
          <div className="wm-er-tileValue" style={tileColor(kpi.confirmed, "var(--wm-success)")}>{kpi.confirmed}</div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------ */
/* Rating Nudge Banner                              */
/* ------------------------------------------------ */
export function ShiftRatingNudge({ pendingCount }: { pendingCount: number }) {
  if (pendingCount === 0) return null;
  return (
    <div style={{
      marginTop: 12, padding: "12px 16px", borderRadius: "var(--wm-radius-14)",
      background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.18)",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
          {pendingCount} worker{pendingCount !== 1 ? "s" : ""} pending rating
        </div>
        <div style={{ fontSize: 11, color: "#92400e", marginTop: 2, opacity: 0.8 }}>
          Rate completed shifts to help workers get better opportunities.
        </div>
      </div>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0, fontSize: 16,
        background: "rgba(217,119,6,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        &#9888;
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Action Buttons Row                               */
/* ------------------------------------------------ */
type ActionRowProps = {
  groups: number;
  favCount: number;
  onPosts: () => void;
  onGroups: () => void;
  onBroadcasts: () => void;
  onFavorites: () => void;
  onPlanner: () => void;
};

const actionBtnBase: React.CSSProperties = {
  flex: "1 1 0", minWidth: 0,
  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
  padding: "14px 8px", borderRadius: "var(--wm-radius-14)",
  border: "1px solid var(--wm-er-border)", background: "var(--wm-er-card, #fff)",
  cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)",
};

export function ShiftHomeActionRow({ groups, favCount, onPosts, onGroups, onBroadcasts, onFavorites, onPlanner }: ActionRowProps) {
  return (
    <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button type="button" style={actionBtnBase} onClick={onPosts}>
        <div style={actionIconWrap}><IconPost /></div>
        <span>My Posts</span>
      </button>
      <button type="button" style={actionBtnBase} onClick={onGroups}>
        <div style={actionIconWrap}><IconGroup /></div>
        <span>My Groups</span>
        {groups > 0 && <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>{groups} active</span>}
      </button>
      <button type="button" style={actionBtnBase} onClick={onFavorites}>
        <div style={{ ...actionIconWrap, background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
          <IconFavorites />
        </div>
        <span>Favorites</span>
        {favCount > 0 && <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>{favCount}</span>}
      </button>
      <button type="button" style={actionBtnBase} onClick={onBroadcasts}>
        <div style={actionIconWrap}><IconBroadcast /></div>
        <span>Broadcasts</span>
      </button>
      <button type="button" style={actionBtnBase} onClick={onPlanner}>
        <div style={{ ...actionIconWrap, background: "rgba(29,78,216,0.08)", color: "var(--wm-er-accent-career, #1d4ed8)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 16H5V8h14v11ZM7 10h5v5H7z"/></svg>
        </div>
        <span>Planner</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------ */
/* Templates quick link (shown in home if any exist)*/
/* ------------------------------------------------ */
export function ShiftHomeTemplatesHint({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null;
  return (
    <button type="button" onClick={onClick} style={{
      marginTop: 10, width: "100%", padding: "10px 14px",
      borderRadius: "var(--wm-radius-14)", border: "1px solid var(--wm-er-border)",
      background: "var(--wm-er-surface)", cursor: "pointer", textAlign: "left",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)" }}>
        &#128203; {count} saved template{count !== 1 ? "s" : ""}
      </span>
      <span style={{ fontSize: 12, color: "var(--wm-er-accent-shift, #16a34a)", fontWeight: 700 }}>
        Use a template &#8250;
      </span>
    </button>
  );
}



/* ------------------------------------------------ */
/* Recently Analyzed Section                        */
/* ------------------------------------------------ */
type AnalyzedProps = { posts: ShiftPost[]; onOpen: (id: string) => void };

export function ShiftHomeAnalyzedSection({ posts, onOpen }: AnalyzedProps) {
  if (posts.length === 0) return null;
  return (
    <div className="wm-er-card" style={{ marginTop: 14 }}>
      <div style={sectionTitle}>
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "rgba(217,119,6,0.08)", color: "var(--wm-warning)",
        }}>
          <IconAnalysis />
        </div>
        Recently Analyzed
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {posts.map((p) => {
          const date = p.analyzedAt
            ? new Date(p.analyzedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
            : "";
          return (
            <button key={p.id} type="button" style={analyzedPostBtn} onClick={() => onOpen(p.id)}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.jobName} &mdash; {p.companyName}
                </div>
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {date} &middot; {p.shortlistIds.length} shortlisted &middot; {p.waitingIds.length} waiting &middot; {p.confirmedIds.length} confirmed
                </div>
              </div>
              <div style={{ color: "var(--wm-er-muted)", flexShrink: 0 }}><IconArrowRight /></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* How It Works                                     */
/* ------------------------------------------------ */
export function ShiftHomeHowItWorks() {
  return (
    <div className="wm-er-card" style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-text)" }}>How it works</div>
      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {HOW_IT_WORKS.map((step) => (
          <div key={step.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 999, flexShrink: 0,
              background: "rgba(15,118,110,0.10)", color: "var(--wm-er-accent-shift)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>
              {step.n}
            </div>
            <div style={{ fontSize: 13, color: "var(--wm-er-text)" }}>{step.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Recent Posts                                     */
/* ------------------------------------------------ */
type RecentProps = { posts: ShiftPost[]; onOpen: (id: string) => void; onCreate: () => void };

export function ShiftHomeRecentPosts({ posts, onOpen, onCreate }: RecentProps) {
  if (posts.length === 0) {
    return (
      <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "32px 16px", textAlign: "center" }}>
          <IconEmpty />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--wm-er-text)" }}>No shift posts yet</div>
          <div style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 280, lineHeight: 1.5 }}>
            Create your first shift post to start receiving applications from workers.
          </div>
          <button className="wm-primarybtn" type="button" onClick={onCreate}
            style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconPlus /> Create First Shift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 14, marginBottom: 24 }}>
      <div style={sectionTitle}>Recent Posts</div>
      <div style={{ display: "grid", gap: 8 }}>
        {posts.map((p) => {
          const applied = countApplicationsForPost(p.id, "applied");
          const statusDisplay = getPostStatusDisplay(p);
          return (
            <button key={p.id} type="button" style={recentPostBtn} onClick={() => onOpen(p.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.jobName} &mdash; {p.companyName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                    {applied} applied &middot; {p.shortlistIds.length} shortlisted &middot; {p.confirmedIds.length} confirmed &middot; {p.vacancies} {p.vacancies === 1 ? "vacancy" : "vacancies"}
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: statusDisplay.color, flexShrink: 0, whiteSpace: "nowrap" }}>
                  {statusDisplay.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}