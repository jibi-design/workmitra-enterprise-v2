// App name: Job Mitra
// File name: EmployerShiftHomePage.tsx
// Employer Shift Jobs Home — discovery + compact workspace actions

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { favoritesStorage } from "../storage/favoritesStorage";
import { shiftTemplatesStorage } from "../storage/shiftTemplatesStorage";
import {
  countActiveWorkspaceGroups,
  countApplicationsForPost,
  findConfirmWaitingPost,
  getPostsSnapshot,
  shiftPostDashboardPath,
  subscribePosts,
} from "../helpers/shiftHomeHelpers";
import {
  ShiftHomeActionRow,
  ShiftHomeAnalyzedSection,
  ShiftHomeKpiTiles,
  ShiftHomeRecentPosts,
  ShiftHomeTemplatesHint,
} from "../components/ShiftHomeSections";
import { EmployerShiftDraftReminderCard } from "../components/EmployerShiftDraftReminderCard";
import { ShiftHomeConfirmWaitingBanner } from "../components/ShiftHomeConfirmWaitingBanner";
import { LocalWorkersRadarCard } from "../components/LocalWorkersRadarCard";
import { EmployerGigProjectsPromoStrip } from "../components/EmployerGigProjectsPromoStrip";
import { IconPlus, IconShiftCalendar } from "../components/ShiftHomeIcons";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";

export function EmployerShiftHomePage() {
  const nav = useNavigate();

  const posts = useSyncExternalStore(subscribePosts, getPostsSnapshot, getPostsSnapshot);

  const favCount = useSyncExternalStore(
    favoritesStorage.subscribe,
    () => favoritesStorage.getAll().length,
    () => favoritesStorage.getAll().length,
  );

  const templateCount = useSyncExternalStore(
    shiftTemplatesStorage.subscribe,
    () => shiftTemplatesStorage.getAll().length,
    () => shiftTemplatesStorage.getAll().length,
  );

  const kpi = useMemo(() => {
    let open = 0;
    let active = 0;
    let totalApplied = 0;
    let totalShortlisted = 0;
    let totalConfirmed = 0;

    for (const post of posts) {
      if (post.status === "completed" || post.status === "cancelled") continue;

      if (post.confirmedIds.length > 0) {
        active += 1;
      } else {
        open += 1;
      }

      totalShortlisted += post.shortlistIds.length;
      totalConfirmed += post.confirmedIds.length;
      totalApplied += countApplicationsForPost(post.id, "applied");
    }

    return {
      total: posts.length,
      open,
      active,
      applied: totalApplied,
      shortlisted: totalShortlisted,
      confirmed: totalConfirmed,
      groups: countActiveWorkspaceGroups(),
    };
  }, [posts]);

  const recentlyAnalyzed = useMemo(
    () =>
      posts
        .filter((post) => post.analysisStatus === "done" && post.analyzedAt !== undefined)
        .sort((a, b) => (b.analyzedAt ?? 0) - (a.analyzedAt ?? 0))
        .slice(0, 3),
    [posts],
  );

  const recentPosts = useMemo(() => posts.slice(0, 5), [posts]);
  const confirmWaiting = useMemo(() => findConfirmWaitingPost(posts), [posts]);

  function openPost(postId: string) {
    const waiting =
      confirmWaiting?.postId === postId
        ? confirmWaiting
        : findConfirmWaitingPost(posts.filter((post) => post.id === postId));
    nav(shiftPostDashboardPath(postId, waiting ? "shortlisted" : undefined));
  }

  function goToPostsFiltered(status: string) {
    nav(`${ROUTE_PATHS.employerShiftPosts}?status=${status}`);
  }

  return (
    <div
      className="wm-er-vShift wm-shiftHomePage wm-stackGrid"
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      <DomainHero
        variant="shift"
        audience="employer"
        icon={<IconShiftCalendar />}
        title="Shift Jobs"
        subtitle="Manage posts, workers and groups"
        description="Create shift posts, shortlist workers, confirm teams, and manage daily workforce activity from one place."
        trailing={
          <button
            className="wm-primarybtn wm-shiftHomeHeroButton"
            type="button"
            onClick={() => nav(ROUTE_PATHS.employerShiftCreate)}
          >
            <IconPlus /> New Shift
          </button>
        }
      />

      {confirmWaiting ? (
        <ShiftHomeConfirmWaitingBanner
          waiting={confirmWaiting}
          onOpen={() => nav(shiftPostDashboardPath(confirmWaiting.postId, "shortlisted"))}
        />
      ) : (
        <EmployerShiftDraftReminderCard />
      )}

      <ShiftHomeKpiTiles
        kpi={kpi}
        onApplied={kpi.applied > 0 ? () => goToPostsFiltered("applied") : undefined}
        onShortlisted={kpi.shortlisted > 0 ? () => goToPostsFiltered("shortlisted") : undefined}
        onConfirmed={kpi.confirmed > 0 ? () => goToPostsFiltered("confirmed") : undefined}
      />

      <EmployerGigProjectsPromoStrip onOpen={() => nav(ROUTE_PATHS.employerPlannerHome)} />

      <LocalWorkersRadarCard />

      <ShiftHomeActionRow
        postsCount={kpi.total}
        activeShiftsCount={kpi.active}
        groups={kpi.groups}
        favCount={favCount}
        onPosts={() => nav(ROUTE_PATHS.employerShiftPosts)}
        onGroups={() => nav(ROUTE_PATHS.employerShiftWorkspaces + "?mode=groups")}
        onFavorites={() => nav(ROUTE_PATHS.employerShiftFavorites)}
      />

      <ShiftHomeAnalyzedSection posts={recentlyAnalyzed} onOpen={openPost} />

      <ShiftHomeTemplatesHint
        count={templateCount}
        onClick={() => nav(ROUTE_PATHS.employerShiftTemplates)}
      />

      <ShiftHomeRecentPosts
        posts={recentPosts}
        onOpen={openPost}
        onCreate={() => nav(ROUTE_PATHS.employerShiftCreate)}
      />
    </div>
  );
}
