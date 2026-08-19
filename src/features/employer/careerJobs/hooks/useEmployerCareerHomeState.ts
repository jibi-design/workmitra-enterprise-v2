// App name: Job Mitra
// File name: useEmployerCareerHomeState.ts
// Wave 3 — hydrate Loading / Empty / Error signals

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { hydrateCareerPostsFromServer } from "../../../career/services/careerPostDbTruth.service";
import { hydrateEmploymentsFromDb } from "../../../career/services/employmentDbTruth.service";
import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.service";
import { hasValidCareerEmployerScope } from "../../../shared/career/careerEmployerScope";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackTask,
} from "../../myStaff/storage/careerEmploymentFeedback.storage";
import { myStaffStorage, type StaffRecord } from "../../myStaff/storage/myStaff.storage";
import {
  getCareerHomePostsSnapshot,
  subscribeCareerHomePosts,
} from "../helpers/employerCareerHome.helpers";
import type { CareerJobPost } from "../types/careerTypes";

let cachedStaffSnapshot: StaffRecord[] = [];
let cachedStaffSnapshotKey = "";

function getStaffSnapshot(): StaffRecord[] {
  const fresh = myStaffStorage.getAll();
  const freshKey = JSON.stringify(fresh);

  if (freshKey !== cachedStaffSnapshotKey) {
    cachedStaffSnapshot = fresh;
    cachedStaffSnapshotKey = freshKey;
  }

  return cachedStaffSnapshot;
}

let cachedFeedbackSnapshot: CareerEmploymentFeedbackTask[] = [];
let cachedFeedbackSnapshotKey = "";

function getFeedbackSnapshot(): CareerEmploymentFeedbackTask[] {
  const fresh = careerEmploymentFeedbackStorage.getAll();
  const freshKey = JSON.stringify(fresh);

  if (freshKey !== cachedFeedbackSnapshotKey) {
    cachedFeedbackSnapshot = fresh;
    cachedFeedbackSnapshotKey = freshKey;
  }

  return cachedFeedbackSnapshot;
}

function isActiveStaff(record: StaffRecord): boolean {
  return (
    record.status === "joining_pending" ||
    record.status === "active" ||
    record.status === "probation" ||
    record.status === "resignation_pending" ||
    record.status === "notice_period"
  );
}

function isPastPost(post: CareerJobPost): boolean {
  return (
    post.status === "filled" ||
    post.status === "closed" ||
    post.status === "paused" ||
    post.status === "draft"
  );
}

export function useEmployerCareerHomeState() {
  const nav = useNavigate();
  const [isHydrating, setIsHydrating] = useState(
    () =>
      isCareerApiSyncEnabled() &&
      hasValidCareerEmployerScope() &&
      getCareerHomePostsSnapshot().length === 0,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const retryLoad = useCallback(() => {
    setLoadError(null);
    setRetryToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!isCareerApiSyncEnabled() || !hasValidCareerEmployerScope()) {
      return;
    }

    let cancelled = false;

    void (async () => {
      if (getCareerHomePostsSnapshot().length === 0) {
        setIsHydrating(true);
      }
      setLoadError(null);
      try {
        await Promise.all([hydrateCareerPostsFromServer(), hydrateEmploymentsFromDb("employer")]);
        if (!cancelled) {
          setIsHydrating(false);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setIsHydrating(false);
          setLoadError("Couldn't refresh career posts. Try again in a moment.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const posts = useSyncExternalStore(
    subscribeCareerHomePosts,
    getCareerHomePostsSnapshot,
    getCareerHomePostsSnapshot,
  );

  const staffRecords = useSyncExternalStore(
    myStaffStorage.subscribe,
    getStaffSnapshot,
    getStaffSnapshot,
  );
  const feedbackTasks = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    getFeedbackSnapshot,
    getFeedbackSnapshot,
  );

  const kpi = useMemo(() => {
    let active = 0;
    let paused = 0;
    let totalApps = 0;
    let inInterview = 0;
    let offered = 0;
    let hired = 0;

    for (const post of posts) {
      if (post.status === "active") active += 1;
      if (post.status === "paused") paused += 1;

      totalApps += post.totalApplications;
      inInterview += post.inInterview;
      offered += post.offered;
      hired += post.hired;
    }

    return {
      total: posts.length,
      active,
      paused,
      totalApps,
      inInterview,
      offered,
      hired,
    };
  }, [posts]);

  const postSummary = useMemo(() => {
    const activePosts = posts.filter((post) => post.status === "active").length;
    const pastPosts = posts.filter(isPastPost).length;

    return {
      total: posts.length,
      active: activePosts,
      past: pastPosts,
    };
  }, [posts]);

  const activeStaffRecords = useMemo(() => staffRecords.filter(isActiveStaff), [staffRecords]);

  const completedStaffRecords = useMemo(
    () => staffRecords.filter((record) => record.status === "exited"),
    [staffRecords],
  );

  const viewState = useMemo(() => {
    if (isHydrating && posts.length === 0) return "loading" as const;
    if (loadError && posts.length === 0) return "error" as const;
    if (posts.length === 0) return "empty" as const;
    return "active" as const;
  }, [isHydrating, loadError, posts.length]);

  function openCreate() {
    nav(ROUTE_PATHS.employerCareerCreate);
  }

  function openCareerPosts() {
    nav(ROUTE_PATHS.employerCareerPosts);
  }

  function openCompletedCareerRecords() {
    nav(ROUTE_PATHS.employerCareerCompletedRecords);
  }

  function openPostDashboard(postId: string) {
    nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId));
  }

  function openStaffDetail(staffId: string) {
    nav(ROUTE_PATHS.employerStaffDetail.replace(":staffId", staffId));
  }

  function openStaffDetailByCareerPost(postId: string) {
    const staff = myStaffStorage.findByCareerPostId(postId);

    if (!staff) {
      nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId));
      return;
    }

    nav(ROUTE_PATHS.employerStaffDetail.replace(":staffId", staff.id));
  }

  return {
    viewState,
    loadError,
    retryLoad,
    kpi,
    postSummary,
    activeStaffRecords,
    completedStaffRecords,
    feedbackTasks,
    openCreate,
    openCareerPosts,
    openCompletedCareerRecords,
    openPostDashboard,
    openStaffDetail,
    openStaffDetailByCareerPost,
  };
}
