// App: Job Mitra / WorkMitra_Enterprise_v2
// File: BulkNotificationsPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\pages\BulkNotificationsPage.tsx

import { useEffect, useMemo, useState } from "react";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { BulkNoticeCreateCard } from "../components/bulkNotifications/BulkNoticeCreateCard";
import { BulkNoticeHistoryCard } from "../components/bulkNotifications/BulkNoticeHistoryCard";
import { BulkNotificationsHeader } from "../components/bulkNotifications/BulkNotificationsHeader";
import type { ExtendedTarget } from "../helpers/bulkNotificationsHelpers";
import { companyNoticeStorage } from "../storage/companyNotice.storage";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { hrEmployerScopedKey } from "../storage/hrStorageKeys";
import { hrService } from "../services/hrService";
import type { CompanyNotice, NoticeTarget } from "../types/companyNotice.types";
import type { HRCandidateRecord } from "../types/hrManagement.types";

export function BulkNotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<ExtendedTarget>("all");
  const [targetValue, setTargetValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [empSearch, setEmpSearch] = useState("");

  const [notices, setNotices] = useState<CompanyNotice[]>(() => companyNoticeStorage.getAll());
  const [departments] = useState<string[]>(() => companyNoticeStorage.getAvailableDepartments());
  const [locations] = useState<string[]>(() => companyNoticeStorage.getAvailableLocations());
  const [employees] = useState<HRCandidateRecord[]>(() =>
    hrManagementStorage.getAll().filter((record) => record.status === "active"),
  );

  const [sendConfirm, setSendConfirm] = useState<ConfirmData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmData | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const refresh = () => setNotices(companyNoticeStorage.getAll());

    refresh();
    void hrService.hydrateReads();

    return companyNoticeStorage.subscribe(refresh);
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!empSearch.trim()) return employees;

    const query = empSearch.toLowerCase().trim();

    return employees.filter(
      (record) =>
        record.employeeName.toLowerCase().includes(query) ||
        record.jobTitle.toLowerCase().includes(query) ||
        (record.department?.toLowerCase().includes(query) ?? false) ||
        (record.location?.toLowerCase().includes(query) ?? false),
    );
  }, [employees, empSearch]);

  const canSend =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    (target === "all" ||
      (target === "department" && targetValue.length > 0) ||
      (target === "location" && targetValue.length > 0) ||
      (target === "specific" && selectedIds.size > 0));

  const displayNotices = showAll ? notices : notices.slice(0, 5);

  function handleTargetChange(value: ExtendedTarget) {
    setTarget(value);
    setTargetValue("");
    setSelectedIds(new Set());
    setEmpSearch("");
  }

  function toggleEmployee(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function handleSendRequest() {
    if (!canSend) return;

    let targetLabel: string;
    let recipientCount: number;

    if (target === "all") {
      targetLabel = "all employees";
      recipientCount = employees.length;
    } else if (target === "department") {
      targetLabel = `department "${targetValue}"`;
      recipientCount = employees.filter(
        (record) => record.department?.trim().toLowerCase() === targetValue.toLowerCase(),
      ).length;
    } else if (target === "location") {
      targetLabel = `location "${targetValue}"`;
      recipientCount = employees.filter(
        (record) => record.location?.trim().toLowerCase() === targetValue.toLowerCase(),
      ).length;
    } else {
      targetLabel = `${selectedIds.size} specific employee${selectedIds.size > 1 ? "s" : ""}`;
      recipientCount = selectedIds.size;
    }

    setSendConfirm({
      title: "Send Notice",
      message: `This will send "${title.trim()}" to ${targetLabel} (${recipientCount} recipient${
        recipientCount > 1 ? "s" : ""
      }). All selected employees will see this in their app.`,
      tone: "neutral",
      confirmLabel: `Send to ${recipientCount}`,
      cancelLabel: "Cancel",
    });
  }

  async function handleSendConfirm() {
    if (target === "specific") {
      const prior = companyNoticeStorage.getAll();
      const notice: CompanyNotice = {
        id: "ntc_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8),
        title: title.trim(),
        body: body.trim(),
        target: "all",
        targetValue: "Specific Employees",
        recipientCount: selectedIds.size,
        recipientIds: [...selectedIds],
        readReceipts: [],
        createdAt: Date.now(),
      };
      localStorage.setItem(
        hrEmployerScopedKey("company_notices_v1"),
        JSON.stringify([notice, ...prior]),
      );
      window.dispatchEvent(new Event("wm:company-notices-changed"));

      if (hrService.isSyncEnabled()) {
        const synced = await hrService.createCompanyNotice({
          title: notice.title,
          body: notice.body,
          target: "all",
          targetValue: notice.targetValue,
        });
        if (!synced) {
          localStorage.setItem(hrEmployerScopedKey("company_notices_v1"), JSON.stringify(prior));
          window.dispatchEvent(new Event("wm:company-notices-changed"));
        }
      }
    } else {
      await hrService.createCompanyNotice({
        title,
        body,
        target: target as NoticeTarget,
        targetValue,
      });
    }

    setTitle("");
    setBody("");
    setTarget("all");
    setTargetValue("");
    setSelectedIds(new Set());
    setEmpSearch("");
    setSendConfirm(null);
    setSuccessMessage("Notice sent successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  function handleDeleteRequest(id: string) {
    setPendingDeleteId(id);
    setDeleteConfirm({
      title: "Delete Notice",
      message: "This will permanently delete this notice. Employees will no longer see it.",
      tone: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Keep",
    });
  }

  function handleDeleteConfirm() {
    if (pendingDeleteId) {
      companyNoticeStorage.deleteNotice(pendingDeleteId);
    }

    setPendingDeleteId(null);
    setDeleteConfirm(null);
  }

  return (
    <div>
      <BulkNotificationsHeader successMessage={successMessage} />

      <BulkNoticeCreateCard
        title={title}
        body={body}
        target={target}
        targetValue={targetValue}
        selectedIds={selectedIds}
        empSearch={empSearch}
        departments={departments}
        locations={locations}
        employees={employees}
        filteredEmployees={filteredEmployees}
        canSend={canSend}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        onTargetChange={handleTargetChange}
        onTargetValueChange={setTargetValue}
        onEmpSearchChange={setEmpSearch}
        onToggleEmployee={toggleEmployee}
        onSendRequest={handleSendRequest}
      />

      <BulkNoticeHistoryCard
        notices={notices}
        displayNotices={displayNotices}
        showAll={showAll}
        onShowAll={() => setShowAll(true)}
        onDelete={handleDeleteRequest}
      />

      <ConfirmModal
        confirm={sendConfirm}
        onConfirm={handleSendConfirm}
        onCancel={() => setSendConfirm(null)}
      />

      <ConfirmModal
        confirm={deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setPendingDeleteId(null);
          setDeleteConfirm(null);
        }}
      />
    </div>
  );
}
