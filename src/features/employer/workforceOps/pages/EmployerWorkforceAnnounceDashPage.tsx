// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnounceDashPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\pages\EmployerWorkforceAnnounceDashPage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type {
  WorkforceAnnouncement,
  WorkforceApplication,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import { readApplications } from "../../../../shared/domains/workforce/helpers/workforceNormalizers";
import {
  WF_ANNOUNCEMENTS_CHANGED,
  WF_APPLICATIONS_CHANGED,
  WF_APPLICATIONS_KEY,
  WF_CATEGORIES_CHANGED,
  WF_GROUPS_CHANGED,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";
import { EmployerWorkforceAnnounceDashboardBody } from "../components/announceDash/EmployerWorkforceAnnounceDashboardBody";
import { EmployerWorkforceAnnounceNotFound } from "../components/announceDash/EmployerWorkforceAnnounceNotFound";
import { workforceAnnouncementService } from "../services/workforceAnnouncementService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import { workforceService } from "../services/workforceService";

type Props = {
  announcementId: string;
  onBack: () => void;
  onGroupCreated?: (groupId: string) => void;
};

type DashSnapshot = {
  announcement: WorkforceAnnouncement | null;
  applications: WorkforceApplication[];
  categoryMap: Map<string, string>;
  ver: number;
};

let snapCache: DashSnapshot | null = null;
let snapVer = 0;
let cachedAnnId = "";

function getSnapshot(announcementId: string): () => DashSnapshot {
  return () => {
    if (snapCache && snapCache.ver === snapVer && cachedAnnId === announcementId) return snapCache;

    cachedAnnId = announcementId;

    const announcement = workforceAnnouncementService.getById(announcementId);
    const applications = readApplications(WF_APPLICATIONS_KEY).filter(
      (application) => application.announcementId === announcementId,
    );
    const categories = workforceCategoryService.getAll();
    const categoryMap = new Map<string, string>();

    for (const category of categories) {
      categoryMap.set(category.id, category.name);
    }

    snapCache = { announcement, applications, categoryMap, ver: snapVer };
    return snapCache;
  };
}

function subscribe(callback: () => void): () => void {
  const events = [
    WF_ANNOUNCEMENTS_CHANGED,
    WF_APPLICATIONS_CHANGED,
    WF_CATEGORIES_CHANGED,
    WF_GROUPS_CHANGED,
  ];

  const handler = () => {
    snapVer++;
    snapCache = null;
    callback();
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

function annStatusColor(status: WorkforceAnnouncement["status"]): string {
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

export function EmployerWorkforceAnnounceDashPage({
  announcementId,
  onBack,
  onGroupCreated,
}: Props) {
  const snapshotFn = useMemo(() => getSnapshot(announcementId), [announcementId]);
  const data = useSyncExternalStore(subscribe, snapshotFn, snapshotFn);

  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [confirmGroupOpen, setConfirmGroupOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const groupedApps = useMemo(() => {
    const groups = new Map<string, WorkforceApplication[]>();

    for (const application of data.applications) {
      for (const shiftId of application.shiftIds) {
        const key = `${application.categoryId}__${shiftId}`;
        const list = groups.get(key) ?? [];

        list.push(application);
        groups.set(key, list);
      }
    }

    for (const [key, list] of groups) {
      groups.set(
        key,
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
      );
    }

    return groups;
  }, [data.applications]);

  const handleStatusChange = useCallback(
    (newStatus: WorkforceAnnouncement["status"]) => {
      const result = workforceAnnouncementService.updateStatus(announcementId, newStatus);

      if (!result.success) {
        setActionError(result.errors?.[0] ?? "Failed.");
        return;
      }

      setActionError("");
      snapVer++;
    },
    [announcementId],
  );

  const handleSaveTemplate = useCallback(() => {
    const result = workforceAnnouncementService.saveAsTemplate(announcementId, templateName);

    if (result.success) {
      setSaveTemplateOpen(false);
      setTemplateName("");
      setTemplateError("");
      return;
    }

    setTemplateError(result.errors?.[0] ?? "Failed.");
  }, [announcementId, templateName]);

  const handleConfirmGroup = useCallback(async () => {
    if (!data.announcement) return;

    const selectedApps = data.applications.filter(
      (application) => application.status === "selected" || application.status === "confirmed",
    );

    if (selectedApps.length === 0) {
      setActionError("No selected applicants. Analyze and select staff first.");
      return;
    }

    const confirmedMembers = selectedApps.map((application) => ({
      staffId: application.staffId,
      employeeUniqueId: application.employeeUniqueId,
      employeeName: application.employeeName,
      categoryId: application.categoryId,
      assignedShiftIds: application.shiftIds,
    }));

    const result = await workforceService.createFromAnnouncement({
      announcement: data.announcement,
      confirmedMembers,
    });

    if (result.success && result.groupId) {
      workforceAnnouncementService.updateStatus(announcementId, "confirmed");
      setConfirmGroupOpen(false);
      onGroupCreated?.(result.groupId);
      return;
    }

    setActionError(result.errors?.[0] ?? "Failed to create group.");
  }, [announcementId, data.announcement, data.applications, onGroupCreated]);

  const handleTemplateNameChange = useCallback((value: string) => {
    setTemplateName(value);
    setTemplateError("");
  }, []);

  const handleCancelSaveTemplate = useCallback(() => {
    setSaveTemplateOpen(false);
    setTemplateName("");
    setTemplateError("");
  }, []);

  if (!data.announcement) {
    return <EmployerWorkforceAnnounceNotFound onBack={onBack} />;
  }

  const announcement = data.announcement;
  const totalVacancy = workforceAnnouncementService.getTotalVacancy(announcementId);
  const appliedCount = data.applications.filter(
    (application) => application.status === "applied",
  ).length;
  const selectedCount = data.applications.filter(
    (application) => application.status === "selected" || application.status === "confirmed",
  ).length;
  const isTerminal = announcement.status === "completed" || announcement.status === "cancelled";

  return (
    <EmployerWorkforceAnnounceDashboardBody
      announcement={announcement}
      applications={data.applications}
      groupedApplications={groupedApps}
      categoryMap={data.categoryMap}
      totalVacancy={totalVacancy}
      appliedCount={appliedCount}
      selectedCount={selectedCount}
      isTerminal={isTerminal}
      statusColor={annStatusColor(announcement.status)}
      confirmGroupOpen={confirmGroupOpen}
      saveTemplateOpen={saveTemplateOpen}
      templateName={templateName}
      templateError={templateError}
      actionError={actionError}
      onBack={onBack}
      onStatusChange={handleStatusChange}
      onOpenConfirmGroup={() => setConfirmGroupOpen(true)}
      onConfirmGroup={handleConfirmGroup}
      onCancelConfirmGroup={() => setConfirmGroupOpen(false)}
      onOpenSaveTemplate={() => setSaveTemplateOpen(true)}
      onTemplateNameChange={handleTemplateNameChange}
      onSaveTemplate={handleSaveTemplate}
      onCancelSaveTemplate={handleCancelSaveTemplate}
    />
  );
}
