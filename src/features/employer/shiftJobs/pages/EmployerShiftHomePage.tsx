// src/features/employer/shiftJobs/pages/EmployerShiftHomePage.tsx
// Shift Jobs home — orchestration only. All sections extracted.

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { countShiftPendingRatings } from "../../helpers/ratingNudgeHelpers";
import { availabilityStorage } from "../../../employee/shiftJobs/storage/availabilityStorage";
import { favoritesStorage } from "../storage/favoritesStorage";
import {
  getPostsSnapshot, subscribePosts,
  countApplicationsForPost, countActiveWorkspaceGroups,
} from "../helpers/shiftHomeHelpers";
import {
  ShiftHomeKpiTiles, ShiftRatingNudge, ShiftHomeActionRow,
  ShiftHomeAnalyzedSection, ShiftHomeHowItWorks, ShiftHomeRecentPosts,
} from "../components/ShiftHomeSections";
import { IconPlus, IconShiftCalendar } from "../components/ShiftHomeIcons";

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerShiftHomePage() {
  const nav   = useNavigate();
  const posts = useSyncExternalStore(subscribePosts, getPostsSnapshot, getPostsSnapshot);

  const kpi = useMemo(() => {
    let open = 0; let active = 0; let totalApplied = 0;
    let totalShortlisted = 0; let totalConfirmed = 0;
    for (const p of posts) {
      if (p.status === "completed" || p.status === "cancelled") continue;
      if (p.confirmedIds.length > 0) active++;
      else open++;
      totalShortlisted += p.shortlistIds.length;
      totalConfirmed   += p.confirmedIds.length;
      totalApplied     += countApplicationsForPost(p.id, "applied");
    }
    return {
      total: posts.length, open, active,
      applied: totalApplied, shortlisted: totalShortlisted,
      confirmed: totalConfirmed, groups: countActiveWorkspaceGroups(),
    };
  }, [posts]);

  const recentlyAnalyzed = useMemo(
    () => posts
      .filter((p) => p.analysisStatus === "done" && p.analyzedAt !== undefined)
      .sort((a, b) => (b.analyzedAt ?? 0) - (a.analyzedAt ?? 0))
      .slice(0, 3),
    [posts],
  );

  const recentPosts = useMemo(() => posts.slice(0, 5), [posts]);
  const favCount    = favoritesStorage.getAll().length;

  function openPost(postId: string) {
    nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId));
  }

  return (
    <div className="wm-er-vShift">
      {/* Header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(22,163,74,0.08)", color: "var(--wm-er-accent-shift)",
          }}>
            <IconShiftCalendar />
          </div>
          <div>
            <div className="wm-pageTitle">Shift Jobs</div>
            <div className="wm-pageSub">Manage posts, workers and groups</div>
          </div>
        </div>
        <button
          className="wm-primarybtn" type="button"
          onClick={() => nav(ROUTE_PATHS.employerShiftCreate)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
        >
          <IconPlus /> New Shift
        </button>
      </div>

      <ShiftHomeKpiTiles kpi={kpi} />
      <ShiftRatingNudge pendingCount={countShiftPendingRatings()} />
      {(() => {
        const count = availabilityStorage.getActiveCount();
        if (count === 0) return null;
        return (
          <div style={{
            marginTop: 10, padding: "10px 14px", borderRadius: "var(--wm-radius-14)",
            background: "rgba(22,163,74,0.05)", border: "1px solid rgba(22,163,74,0.2)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)" }}>
                {count} worker{count !== 1 ? "s" : ""} available now
              </div>
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                Workers have broadcast their availability. Post a shift to reach them.
              </div>
            </div>
            <button className="wm-primarybtn" type="button"
              onClick={() => nav(ROUTE_PATHS.employerShiftCreate)}
              style={{ fontSize: 12, whiteSpace: "nowrap", padding: "8px 14px" }}>
              Post Shift
            </button>
          </div>
        );
      })()}
      <ShiftHomeActionRow
        groups={kpi.groups}
        favCount={favCount}
        onPosts={() => nav(ROUTE_PATHS.employerShiftPosts)}
        onGroups={() => nav(ROUTE_PATHS.employerShiftWorkspaces + "?mode=groups")}
        onBroadcasts={() => nav(ROUTE_PATHS.employerShiftWorkspaces + "?mode=broadcasts")}
        onFavorites={() => nav(ROUTE_PATHS.employerShiftFavorites)}
        onPlanner={() => nav(ROUTE_PATHS.employerShiftDemandPlanner)}
      />
      <ShiftHomeAnalyzedSection posts={recentlyAnalyzed} onOpen={openPost} />
      <ShiftHomeHowItWorks />
      <ShiftHomeRecentPosts
        posts={recentPosts}
        onOpen={openPost}
        onCreate={() => nav(ROUTE_PATHS.employerShiftCreate)}
      />
    </div>
  );
}