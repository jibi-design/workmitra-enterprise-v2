// App name: Job Mitra
// File name: useEmployerShiftWorkspacesState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\useEmployerShiftWorkspacesState.ts

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  EMPLOYER_WORKSPACE_CHANGED,
  EMPLOYER_WORKSPACE_KEY,
  createWorkspaceCounts,
  filterEmployerWorkspaces,
  parseEmployerWorkspaces,
} from "../helpers/employerShiftWorkspaces.helpers";
import type {
  EmployerWorkspaceFilter,
  EmployerWorkspaceMode,
} from "../types/employerShiftWorkspaces.types";

let cachedRaw: string | null = null;
let cachedWorkspaces = parseEmployerWorkspaces(null);

function getWorkspaceSnapshot() {
  const raw = localStorage.getItem(EMPLOYER_WORKSPACE_KEY);

  if (raw === cachedRaw) return cachedWorkspaces;

  cachedRaw = raw;
  cachedWorkspaces = parseEmployerWorkspaces(raw);
  return cachedWorkspaces;
}

function subscribeWorkspaceSnapshot(callback: () => void): () => void {
  const handler = () => callback();

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  window.addEventListener(EMPLOYER_WORKSPACE_CHANGED, handler);
  document.addEventListener("visibilitychange", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    window.removeEventListener(EMPLOYER_WORKSPACE_CHANGED, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

export function useEmployerShiftWorkspacesState() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const mode: EmployerWorkspaceMode =
    searchParams.get("mode") === "broadcasts" ? "broadcasts" : "groups";
  const allWorkspaces = useSyncExternalStore(
    subscribeWorkspaceSnapshot,
    getWorkspaceSnapshot,
    getWorkspaceSnapshot,
  );

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<EmployerWorkspaceFilter>("all");

  const counts = useMemo(() => createWorkspaceCounts(allWorkspaces), [allWorkspaces]);

  const filteredWorkspaces = useMemo(
    () =>
      filterEmployerWorkspaces({
        workspaces: allWorkspaces,
        filter,
        query,
      }),
    [allWorkspaces, filter, query],
  );

  function openHome() {
    nav(ROUTE_PATHS.employerShiftHome);
  }

  function openWorkspace(workspaceId: string) {
    nav(ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", workspaceId));
  }

  function openPost(postId: string) {
    nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId));
  }

  return {
    mode,
    query,
    setQuery,
    filter,
    setFilter,
    counts,
    allCount: allWorkspaces.length,
    filteredWorkspaces,
    openHome,
    openWorkspace,
    openPost,
  };
}
