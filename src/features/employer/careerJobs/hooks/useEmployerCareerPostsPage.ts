// App name: Job Mitra
// File name: useEmployerCareerPostsPage.ts

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  filterCareerPosts,
  type CareerPostStatusFilter,
} from "../helpers/employerCareerPostList.helpers";
import {
  getCareerHomePostsSnapshot,
  subscribeCareerHomePosts,
} from "../helpers/employerCareerHome.helpers";

export function useEmployerCareerPostsPage() {
  const nav = useNavigate();
  const posts = useSyncExternalStore(
    subscribeCareerHomePosts,
    getCareerHomePostsSnapshot,
    getCareerHomePostsSnapshot,
  );

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CareerPostStatusFilter>("all");

  const filtered = useMemo(
    () => filterCareerPosts({ posts, query, status }),
    [posts, query, status],
  );

  function openCreate() {
    nav(ROUTE_PATHS.employerCareerCreate);
  }

  function openPost(postId: string) {
    nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId));
  }

  return {
    posts,
    query,
    setQuery,
    status,
    setStatus,
    filtered,
    openCreate,
    openPost,
  };
}
