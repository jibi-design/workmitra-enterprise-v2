// App name: Job Mitra
// File name: useEmployerShiftWorkspacesState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\useEmployerShiftWorkspacesState.ts

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  EMPLOYER_WORKSPACE_CHANGED,
  createWorkspaceCounts,
  filterEmployerWorkspaces,
  getEmployerWorkspaceStorageKey,
  parseEmployerWorkspaces,
} from "../helpers/employerShiftWorkspaces.helpers";
import type {
  EmployerWorkspaceFilter,
  EmployerWorkspaceMode,
} from "../types/employerShiftWorkspaces.types";
import { SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT } from "../../../shared/shift/shiftEmployerScope";

let cachedRaw: string | null = null;
let cachedKey = "";
let cachedWorkspaces = parseEmployerWorkspaces(null);

function getWorkspaceSnapshot() {
  const key = getEmployerWorkspaceStorageKey();
  const raw = localStorage.getItem(key);

  if (raw === cachedRaw && key === cachedKey) return cachedWorkspaces;

  cachedRaw = raw;
  cachedKey = key;
  cachedWorkspaces = parseEmployerWorkspaces(raw);
  return cachedWorkspaces;
}

function subscribeWorkspaceSnapshot(callback: () => void): () => void {
  const handler = () => callback();

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  window.addEventListener(EMPLOYER_WORKSPACE_CHANGED, handler);
  window.addEventListener(SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT, handler);
  document.addEventListener("visibilitychange", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    window.removeEventListener(EMPLOYER_WORKSPACE_CHANGED, handler);
    window.removeEventListener(SHIFT_EMPLOYER_SCOPE_CHANGED_EVENT, handler);
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
