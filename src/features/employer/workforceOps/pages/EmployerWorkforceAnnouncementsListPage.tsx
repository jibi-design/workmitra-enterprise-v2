// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnouncementsListPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\pages\EmployerWorkforceAnnouncementsListPage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type {
  AnnouncementStatus,
  WorkforceAnnouncement,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  WF_ANNOUNCEMENTS_CHANGED,
  WF_CATEGORIES_CHANGED,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import { EmployerWorkforceAnnouncementsHeader } from "../components/EmployerWorkforceAnnouncementsHeader";
import { EmployerWorkforceAnnouncementsList } from "../components/EmployerWorkforceAnnouncementsList";
import type { EmployerWorkforceAnnouncementListItem } from "../components/EmployerWorkforceAnnouncementsList";
import { EmployerWorkforceAnnouncementsTabs } from "../components/EmployerWorkforceAnnouncementsTabs";
import type { EmployerWorkforceAnnouncementsTabKey } from "../components/EmployerWorkforceAnnouncementsTabs";
import { workforceAnnouncementService } from "../services/workforceAnnouncementService";
import { workforceCategoryService } from "../services/workforceCategoryService";

type Props = {
  onBack: () => void;
  onNewAnnouncement: () => void;
  onOpenDashboard: (announcementId: string) => void;
};

type ListSnapshot = {
  announcements: WorkforceAnnouncement[];
  counts: Record<EmployerWorkforceAnnouncementsTabKey, number>;
  ver: number;
};

let snapCache: ListSnapshot | null = null;
let snapVer = 0;

function getTabForStatus(status: AnnouncementStatus): EmployerWorkforceAnnouncementsTabKey {
  switch (status) {
    case "open":
    case "analyzing":
      return "open";
    case "confirmed":
      return "confirmed";
    case "completed":
    case "cancelled":
      return "completed";
  }
}

function getSnapshot(): ListSnapshot {
  if (snapCache && snapCache.ver === snapVer) return snapCache;

  const announcements = workforceAnnouncementService.getAll();
  const categories = workforceCategoryService.getAll();
  const counts: Record<EmployerWorkforceAnnouncementsTabKey, number> = {
    open: 0,
    confirmed: 0,
    completed: 0,
  };

  for (const announcement of announcements) {
    counts[getTabForStatus(announcement.status)] += 1;
  }

  void categories;

  snapCache = { announcements, counts, ver: snapVer };
  return snapCache;
}

function subscribe(cb: () => void): () => void {
  const events = [WF_ANNOUNCEMENTS_CHANGED, WF_CATEGORIES_CHANGED];

  const handler = () => {
    snapVer++;
    snapCache = null;
    cb();
  };

  for (const eventName of events) {
    window.addEventListener(eventName, handler);
  }

  window.addEventListener("storage", handler);

  return () => {
    for (const eventName of events) {
      window.removeEventListener(eventName, handler);
    }

    window.removeEventListener("storage", handler);
  };
}

export function EmployerWorkforceAnnouncementsListPage({
  onBack,
  onNewAnnouncement,
  onOpenDashboard,
}: Props) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [activeTab, setActiveTab] = useState<EmployerWorkforceAnnouncementsTabKey>("open");

  const filteredItems = useMemo<EmployerWorkforceAnnouncementListItem[]>(
    () =>
      data.announcements
        .filter((announcement) => getTabForStatus(announcement.status) === activeTab)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((announcement) => ({
          announcement,
          totalVacancy: workforceAnnouncementService.getTotalVacancy(announcement.id),
        })),
    [activeTab, data.announcements],
  );

  const handleTabClick = useCallback((tab: EmployerWorkforceAnnouncementsTabKey) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="wm-er-vWorkforce">
      <EmployerWorkforceAnnouncementsHeader onBack={onBack} onNewAnnouncement={onNewAnnouncement} />

      <EmployerWorkforceAnnouncementsTabs
        activeTab={activeTab}
        counts={data.counts}
        onChange={handleTabClick}
      />

      <EmployerWorkforceAnnouncementsList
        activeTab={activeTab}
        items={filteredItems}
        onNewAnnouncement={onNewAnnouncement}
        onOpenDashboard={onOpenDashboard}
      />

      <div style={{ height: 24 }} />
    </div>
  );
}
