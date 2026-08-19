// App: Job Mitra / WorkMitra_Enterprise_v2
// File: useAdminHomePage.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\hooks\useAdminHomePage.ts

import { useCallback, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  exportAdminHomeData,
  formatAdminHomeBytes,
  formatAdminHomeDate,
  formatAdminHomeRelativeTime,
  getAdminHomeSnapshot,
  subscribeAdminHome,
} from "../helpers/adminHomePage.helpers";

export function useAdminHomePage() {
  const nav = useNavigate();
  const data = useSyncExternalStore(subscribeAdminHome, getAdminHomeSnapshot, getAdminHomeSnapshot);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = useCallback(() => {
    // DANGER MIG-010: nuclear clear — remove before production cutover
    if (!window.confirm("WARNING: This will clear ALL local data. Continue?")) return;
    localStorage.clear();
    window.location.reload();
  }, []);

  const openAuditLog = useCallback(() => {
    nav(ROUTE_PATHS.adminAlerts);
  }, [nav]);

  const openModeration = useCallback(() => {
    nav(ROUTE_PATHS.adminModeration);
  }, [nav]);

  const toggleTimeline = useCallback(() => {
    setShowTimeline((value) => !value);
  }, []);

  const openResetConfirm = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const closeResetConfirm = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  return {
    data,
    showTimeline,
    showResetConfirm,
    handleReset,
    openAuditLog,
    openModeration,
    toggleTimeline,
    openResetConfirm,
    closeResetConfirm,
    exportAllData: exportAdminHomeData,
    formatBytes: formatAdminHomeBytes,
    relativeTime: formatAdminHomeRelativeTime,
    formatDate: formatAdminHomeDate,
  };
}
