// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceHomePage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\pages\EmployerWorkforceHomePage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import type {
  WorkforceActivityEntry,
  WorkforceAnnouncement,
  WorkforceCategory,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  readActivity,
  readAnnouncements,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";
import {
  WF_ACTIVITY_CHANGED,
  WF_ACTIVITY_KEY,
  WF_ANNOUNCEMENTS_CHANGED,
  WF_ANNOUNCEMENTS_KEY,
  WF_CATEGORIES_CHANGED,
  WF_GROUPS_CHANGED,
  WF_STAFF_CHANGED,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";
import { countWorkforcePendingRatings } from "../../helpers/ratingNudgeHelpers";
import { EmployerWorkforceHomeHero } from "../components/EmployerWorkforceHomeHero";
import { EmployerWorkforceHomeQuickActions } from "../components/EmployerWorkforceHomeQuickActions";
import { EmployerWorkforceHomeSections } from "../components/EmployerWorkforceHomeSections";
import { workforceAnnouncementService } from "../services/workforceAnnouncementService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import { workforceGroupService } from "../services/workforceGroupService";
import { workforceStaffService } from "../services/workforceStaffService";

const WF_ROUTES = {
  staff: "/employer/workforce/staff",
  announcements: "/employer/workforce/announcements",
  announceCreate: "/employer/workforce/announce/create",
  announceDash: "/employer/workforce/announce/:announcementId",
  groups: "/employer/workforce/groups",
} as const;

type HomeSnapshot = {
  announcements: WorkforceAnnouncement[];
  categories: WorkforceCategory[];
  activeStaffCount: number;
  announcementCounts: Record<string, number>;
  groupCounts: Record<string, number>;
  recentActivity: WorkforceActivityEntry[];
  ver: number;
};

let snapCache: HomeSnapshot | null = null;
let snapVer = 0;

function getSnapshot(): HomeSnapshot {
  if (snapCache && snapCache.ver === snapVer) return snapCache;

  const announcements = readAnnouncements(WF_ANNOUNCEMENTS_KEY);
  const categories = workforceCategoryService.getAll();
  const activeStaffCount = workforceStaffService
    .getAll()
    .filter((staff) => staff.status === "active").length;
  const announcementCounts = workforceAnnouncementService.countByStatus();
  const groupCounts = workforceGroupService.countByStatus();
  const recentActivity = readActivity(WF_ACTIVITY_KEY).slice(0, 8);

  snapCache = {
    announcements,
    categories,
    activeStaffCount,
    announcementCounts,
    groupCounts,
    recentActivity,
    ver: snapVer,
  };

  return snapCache;
}

function subscribe(cb: () => void): () => void {
  const events = [
    WF_ANNOUNCEMENTS_CHANGED,
    WF_CATEGORIES_CHANGED,
    WF_STAFF_CHANGED,
    WF_GROUPS_CHANGED,
    WF_ACTIVITY_CHANGED,
  ];

  const handler = () => {
    snapVer++;
    snapCache = null;
    cb();
  };

  for (const eventName of events) {
    window.addEventListener(eventName, handler);
  }

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);

  return () => {
    for (const eventName of events) {
      window.removeEventListener(eventName, handler);
    }

    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
  };
}

function statusColor(status: WorkforceAnnouncement["status"]): string {
  switch (status) {
    case "open":
      return AMBER;
    case "analyzing":
      return "var(--wm-warning)";
    case "confirmed":
      return "var(--wm-success)";
    case "completed":
      return "var(--wm-er-muted)";
    case "cancelled":
      return "var(--wm-error)";
  }
}

function statusLabel(status: WorkforceAnnouncement["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function EmployerWorkforceHomePage() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const nav = useNavigate();

  const [showCatInput, setShowCatInput] = useState(false);
  const [catVal, setCatVal] = useState("");
  const [catErr, setCatErr] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    assignedCount: number;
  } | null>(null);
  const [deleteErr, setDeleteErr] = useState("");

  const recentAnnouncements = useMemo(() => data.announcements.slice(0, 5), [data.announcements]);
  const hasData = data.activeStaffCount > 0 || data.announcements.length > 0;
  const pendingRatingCount = useMemo(() => countWorkforcePendingRatings(), []);

  const navTo = useCallback(
    (path: string) => {
      nav(path);
    },
    [nav],
  );

  useMemo(() => {
    workforceCategoryService.seedDefaults();
  }, []);

  const addCategory = useCallback(() => {
    const result = workforceCategoryService.create(catVal);

    if (result.success) {
      setCatVal("");
      setShowCatInput(false);
      setCatErr("");
      snapVer++;
      return;
    }

    setCatErr(result.errors?.[0] ?? "Failed to add.");
  }, [catVal]);

  const startDelete = useCallback((category: WorkforceCategory) => {
    const staffList = workforceStaffService.getAll().filter((staff) => staff.status === "active");
    const assignedCount = staffList.filter((staff) =>
      staff.categories.includes(category.id),
    ).length;

    setDeleteTarget({ id: category.id, name: category.name, assignedCount });
    setDeleteErr("");
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    const staffList = workforceStaffService.getAll().filter((staff) => staff.status === "active");
    const result = workforceCategoryService.delete(deleteTarget.id, staffList, true);

    if (result.success) {
      setDeleteTarget(null);
      setDeleteErr("");
      snapVer++;
      return;
    }

    setDeleteErr(result.errors?.[0] ?? "Failed to delete.");
  }, [deleteTarget]);

  const cancelCategoryInput = useCallback(() => {
    setShowCatInput(false);
    setCatVal("");
    setCatErr("");
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
    setDeleteErr("");
  }, []);

  return (
    <div className="wm-er-vWorkforce">
      <EmployerWorkforceHomeHero
        activeStaffCount={data.activeStaffCount}
        categoryCount={data.categories.length}
        activeGroupCount={data.groupCounts.active}
        openAnnouncementCount={data.announcementCounts.open}
        confirmedAnnouncementCount={data.announcementCounts.confirmed}
        completedAnnouncementCount={data.announcementCounts.completed}
        pendingRatingCount={pendingRatingCount}
        onCreateAnnouncement={() => navTo(WF_ROUTES.announceCreate)}
      />

      <EmployerWorkforceHomeQuickActions
        activeStaffCount={data.activeStaffCount}
        openAnnouncementCount={data.announcementCounts.open}
        activeGroupCount={data.groupCounts.active}
        onOpenStaff={() => navTo(WF_ROUTES.staff)}
        onOpenAnnouncements={() => navTo(WF_ROUTES.announcements)}
        onOpenGroups={() => navTo(WF_ROUTES.groups)}
      />

      <EmployerWorkforceHomeSections
        categories={data.categories}
        recentAnnouncements={recentAnnouncements}
        recentActivity={data.recentActivity}
        hasData={hasData}
        showCatInput={showCatInput}
        catVal={catVal}
        catErr={catErr}
        deleteTarget={deleteTarget}
        deleteErr={deleteErr}
        getTotalVacancy={workforceAnnouncementService.getTotalVacancy}
        statusColor={statusColor}
        statusLabel={statusLabel}
        onStartDelete={startDelete}
        onConfirmDelete={confirmDelete}
        onCancelDelete={cancelDelete}
        onCatValueChange={(value) => {
          setCatVal(value);
          setCatErr("");
        }}
        onOpenCategoryInput={() => setShowCatInput(true)}
        onAddCategory={addCategory}
        onCancelCategoryInput={cancelCategoryInput}
        onOpenStaff={() => navTo(WF_ROUTES.staff)}
        onOpenAnnouncementDash={(announcementId) =>
          navTo(WF_ROUTES.announceDash.replace(":announcementId", announcementId))
        }
      />
    </div>
  );
}
