// App name: Job Mitra
// File name: CareerCandidateEmploymentActions.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCandidateEmploymentActions.tsx

// Employer employment lifecycle actions for hired Career candidates.

import { useEffect, useState, useSyncExternalStore } from "react";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import { employmentActions } from "../../../../shared/employment/employmentActions";
import type { EmploymentRecord } from "../../../../shared/employment/employmentTypes";
import {
  getEmployerActions,
  formatDate,
  getNoticeCountdownText,
  isNoticeExpired,
} from "../../../../shared/employment/employmentDisplayHelpers";
import { EmploymentStatusBadge } from "../../../../shared/employment/components/EmploymentBadges";
import { MarkAsJoinedModal } from "../../../../shared/employment/components/MarkAsJoinedModal";
import { TerminateEmployeeModal } from "../../../../shared/employment/components/TerminateEmployeeModal";
import {
  syncCareerSideRecordsAfterConfirmResignation,
  syncCareerSideRecordsAfterMarkJoined,
  syncCareerSideRecordsAfterTerminate,
} from "../../../career/services/careerEmploymentPublic";
import { hydrateEmploymentsFromDb } from "../../../career/services/employmentDbTruth.service";
import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.service";

let cached: EmploymentRecord[] = [];

function getSnapshot(): EmploymentRecord[] {
  const fresh = employmentStorage.getAll();
  if (JSON.stringify(fresh) !== JSON.stringify(cached)) cached = fresh;
  return cached;
}

type Props = {
  careerPostId: string;
  employeeName: string;
  onNotice: (notice: NoticeData) => void;
};

export function CareerCandidateEmploymentActions({ careerPostId, employeeName, onNotice }: Props) {
  const allRecords = useSyncExternalStore(employmentStorage.subscribe, getSnapshot, getSnapshot);
  const record = allRecords.find((item) => item.careerPostId === careerPostId) ?? null;

  const [joinedOpen, setJoinedOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [confirmResign, setConfirmResign] = useState<ConfirmData | null>(null);

  useEffect(() => {
    if (!isCareerApiSyncEnabled()) return;
    void hydrateEmploymentsFromDb("employer");
  }, []);

  async function handleMarkJoined(joinedAt: number): Promise<void> {
    const result = await employmentActions.markAsJoined(careerPostId, joinedAt);
    setJoinedOpen(false);

    if (result) {
      const syncResult = syncCareerSideRecordsAfterMarkJoined(careerPostId, result, joinedAt);
      if (!syncResult.ok) {
        console.warn("[CareerSideSync] mark joined sync failed:", syncResult.reason);
      }
      onNotice({
        title: "Employee joined",
        message: `${employeeName} is now marked as working.`,
        tone: "success",
      });
      return;
    }

    onNotice({ title: "Cannot update", message: "Please try again.", tone: "warn" });
  }

  async function handleConfirmResign(): Promise<void> {
    const result = await employmentActions.confirmResignation(careerPostId);
    setConfirmResign(null);

    if (result) {
      const syncResult = syncCareerSideRecordsAfterConfirmResignation(careerPostId, result);
      if (!syncResult.ok) {
        console.warn("[CareerSideSync] confirm resignation sync failed:", syncResult.reason);
      }
      onNotice({
        title: "Resignation confirmed",
        message: `${employeeName}'s employment has been completed.`,
        tone: "success",
      });
      return;
    }

    onNotice({ title: "Cannot confirm", message: "Please try again.", tone: "warn" });
  }

  async function handleTerminate(
    reason: Parameters<typeof employmentActions.terminate>[1],
    notes: string,
  ): Promise<void> {
    const result = await employmentActions.terminate(careerPostId, reason, notes);
    setTerminateOpen(false);

    if (result) {
      const syncResult = syncCareerSideRecordsAfterTerminate(careerPostId, result, reason);
      if (!syncResult.ok) {
        console.warn("[CareerSideSync] terminate sync failed:", syncResult.reason);
      }
      onNotice({
        title: "Employee terminated",
        message: `${employeeName}'s employment has been ended.`,
        tone: "success",
      });
      return;
    }

    onNotice({ title: "Cannot terminate", message: "Please try again.", tone: "warn" });
  }

  if (!record) return null;

  const actions = getEmployerActions(record);
  const noticeText = getNoticeCountdownText(record);
  const expired = isNoticeExpired(record);

  return (
    <>
      <div
        style={{
          marginTop: 10,
          padding: "10px 12px",
          borderRadius: "var(--wm-radius-10)",
          background: "rgba(29,78,216,0.04)",
          border: "1px solid rgba(29,78,216,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-accent-career)" }}>
            Employment
          </div>
          <EmploymentStatusBadge record={record} />
        </div>

        {record.joinedAt && (
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
            Joined:{" "}
            <span style={{ fontWeight: 600, color: "var(--wm-er-text)" }}>
              {formatDate(record.joinedAt)}
            </span>
          </div>
        )}

        {record.workDurationDisplay && (
          <div style={{ marginTop: 2, fontSize: 11, color: "var(--wm-er-muted)" }}>
            Duration:{" "}
            <span style={{ fontWeight: 600, color: "var(--wm-er-text)" }}>
              {record.workDurationDisplay}
            </span>
          </div>
        )}

        {noticeText && (
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              fontWeight: 600,
              color: expired ? "var(--wm-error, #dc2626)" : "#b45309",
            }}
          >
            {noticeText}
            {record.lastWorkingDay ? ` - Last day: ${formatDate(record.lastWorkingDay)}` : ""}
          </div>
        )}

        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {actions.canMarkJoined && (
            <button
              type="button"
              className="wm-primarybtn"
              data-testid="career-mark-as-joined"
              onClick={() => setJoinedOpen(true)}
              style={{ fontSize: 11, padding: "6px 12px", height: 32 }}
            >
              Mark as joined
            </button>
          )}

          {actions.canConfirmResign && (
            <button
              type="button"
              className="wm-primarybtn"
              data-testid="career-confirm-resignation"
              onClick={() =>
                setConfirmResign({
                  title: "Confirm resignation?",
                  message: `${employeeName}'s employment will be marked as completed. Both sides will be asked to rate.`,
                  tone: "warn",
                  confirmLabel: "Confirm",
                  cancelLabel: "Cancel",
                })
              }
              style={{ fontSize: 11, padding: "6px 12px", height: 32 }}
            >
              Confirm resignation
            </button>
          )}

          {actions.canTerminate && (
            <button
              type="button"
              onClick={() => setTerminateOpen(true)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                height: 32,
                padding: "0 12px",
                borderRadius: "var(--wm-radius-8)",
                border: "1px solid rgba(220,38,38,0.3)",
                background: "rgba(220,38,38,0.06)",
                color: "var(--wm-error, #dc2626)",
                cursor: "pointer",
              }}
            >
              Terminate
            </button>
          )}
        </div>
      </div>

      <MarkAsJoinedModal
        open={joinedOpen}
        employeeName={employeeName}
        onConfirm={handleMarkJoined}
        onCancel={() => setJoinedOpen(false)}
      />

      <TerminateEmployeeModal
        open={terminateOpen}
        employeeName={employeeName}
        onConfirm={handleTerminate}
        onCancel={() => setTerminateOpen(false)}
      />

      <ConfirmModal
        confirm={confirmResign}
        onConfirm={handleConfirmResign}
        onCancel={() => setConfirmResign(null)}
      />
    </>
  );
}
