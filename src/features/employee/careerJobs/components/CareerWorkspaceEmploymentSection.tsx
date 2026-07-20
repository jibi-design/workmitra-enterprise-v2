// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CareerWorkspaceEmploymentSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\CareerWorkspaceEmploymentSection.tsx

import { useState, useSyncExternalStore } from "react";
import {
  syncCareerSideRecordsAfterForceComplete,
  syncCareerSideRecordsAfterResignation,
  syncCareerSideRecordsAfterWithdraw,
} from "../services/careerEmploymentSideSyncService";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { employmentActions } from "../../../../shared/employment/employmentActions";
import { EmploymentTimeline } from "../../../../shared/employment/components/EmploymentTimeline";

import { ResignJobModal } from "../../../../shared/employment/components/ResignJobModal";
import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import {
  formatDate,
  getDaysUntilForceComplete,
  getEmployeeActions,
  getStatusLabel,
} from "../../../../shared/employment/employmentDisplayHelpers";
import type { EmploymentRecord } from "../../../../shared/employment/employmentTypes";

let cachedRecords: EmploymentRecord[] = [];

function getSnapshot(): EmploymentRecord[] {
  const fresh = employmentStorage.getAll();
  if (JSON.stringify(fresh) !== JSON.stringify(cachedRecords)) cachedRecords = fresh;
  return cachedRecords;
}

type Props = {
  careerPostId: string;
  companyName: string;
  onNotice: (n: NoticeData) => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-emp-text, #111827)";
const CAREER_MUTED = "var(--wm-emp-muted, #6b7280)";
const DANGER = "var(--wm-error, #dc2626)";
const WARNING = "#b45309";
const DAY_MS = 86_400_000;

function isRepairTimelineEntry(note: string): boolean {
  const normalized = note.toLowerCase();
  return (
    normalized.includes("repaired") || normalized.includes("corrected to active joined employment")
  );
}

function makeVisibleTimelineRecord(record: EmploymentRecord): EmploymentRecord {
  return {
    ...record,
    timeline: record.timeline.filter((entry) => !isRepairTimelineEntry(entry.note)),
  };
}

function formatDateLabel(timestamp: number | null | undefined): string {
  if (!timestamp) return "Not set";

  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Not set";
  }
}

function getNoticeDaysLeft(lastWorkingDay: number | null | undefined): number | null {
  if (!lastWorkingDay) return null;
  return Math.max(0, Math.ceil((lastWorkingDay - Date.now()) / DAY_MS));
}

function CareerStatusBadge({ record }: { record: EmploymentRecord }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 11px",
        borderRadius: 999,
        border: "1px solid rgba(29,78,216,0.16)",
        background: "rgba(29,78,216,0.08)",
        color: CAREER_BLUE_DEEP,
        fontSize: 10.8,
        fontWeight: 950,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: CAREER_BLUE,
        }}
      />
      {getStatusLabel(record)}
    </span>
  );
}

function NoticeCountdownPanel({ record }: { record: EmploymentRecord }) {
  if (record.status !== "notice" && record.status !== "resigned") return null;

  const hasNoticePeriod = record.noticePeriodDays > 0 && !!record.lastWorkingDay;
  const daysLeft = hasNoticePeriod ? getNoticeDaysLeft(record.lastWorkingDay) : null;
  const countdownLabel = !hasNoticePeriod
    ? "No notice period"
    : daysLeft === null
      ? "Notice period active"
      : daysLeft <= 0
        ? "Notice period completed"
        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;

  const lastWorkingDateLabel = hasNoticePeriod
    ? formatDateLabel(record.lastWorkingDay)
    : "Can close now";

  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 12px",
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(255,251,235,0.92), rgba(255,255,255,0.96))",
        border: "1px solid rgba(217,119,6,0.18)",
      }}
    >
      <div style={{ fontSize: 12.8, fontWeight: 950, color: WARNING }}>
        {hasNoticePeriod ? "Notice period countdown" : "Resignation submitted"}
      </div>

      <div
        style={{
          marginTop: 9,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <div
          style={{
            padding: "10px 11px",
            borderRadius: 13,
            background: "rgba(217,119,6,0.08)",
            border: "1px solid rgba(217,119,6,0.14)",
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>
            {hasNoticePeriod ? "Days left" : "Notice status"}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: WARNING }}>
            {countdownLabel}
          </div>
        </div>

        <div
          style={{
            padding: "10px 11px",
            borderRadius: 13,
            background: "rgba(15,23,42,0.035)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>
            {hasNoticePeriod ? "Last working date" : "Employer action"}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: CAREER_TEXT }}>
            {lastWorkingDateLabel}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 9,
          fontSize: 11.6,
          color: CAREER_MUTED,
          lineHeight: 1.45,
          fontWeight: 750,
        }}
      >
        {hasNoticePeriod
          ? "Your employment stays active during notice period. The employer should close the record on or after the last working date."
          : "Your employer can review and close this employment record now because no notice period is required."}
      </div>
    </div>
  );
}

export function CareerWorkspaceEmploymentSection({ careerPostId, companyName, onNotice }: Props) {
  const allRecords = useSyncExternalStore(employmentStorage.subscribe, getSnapshot, getSnapshot);
  const record = allRecords.find((item) => item.careerPostId === careerPostId) ?? null;

  const [resignOpen, setResignOpen] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState<ConfirmData | null>(null);
  const [forceConfirm, setForceConfirm] = useState<ConfirmData | null>(null);

  function handleResign(
    reason: Parameters<typeof employmentActions.resign>[1],
    notes: string,
  ): void {
    const result = employmentActions.resign(careerPostId, reason, notes);
    setResignOpen(false);

    if (result) {
      const syncResult = syncCareerSideRecordsAfterResignation(careerPostId, result, reason, notes);
      if (!syncResult.ok) {
        console.warn("[CareerSideSync] resignation sync failed:", syncResult.reason);
      }

      onNotice({
        title: "Resignation submitted",
        message: "Notice period has started. Your employer has been notified.",
        tone: "success",
      });
      return;
    }

    onNotice({
      title: "Cannot resign",
      message: "Please check the resignation details and try again.",
      tone: "warn",
    });
  }

  function handleForceComplete(): void {
    const result = employmentActions.forceComplete(careerPostId);
    setForceConfirm(null);

    if (result) {
      const syncResult = syncCareerSideRecordsAfterForceComplete(
        careerPostId,
        result.completedAt ?? Date.now(),
      );
      if (!syncResult.ok) {
        console.warn("[CareerSideSync] force complete sync failed:", syncResult.reason);
      }

      onNotice({
        title: "Employment completed",
        message: "You can now rate your employer. Work history has been updated.",
        tone: "success",
      });
      return;
    }

    onNotice({
      title: "Cannot complete",
      message: "Conditions not met. Please try again later.",
      tone: "warn",
    });
  }

  function handleWithdraw(): void {
    const result = employmentActions.withdrawResignation(careerPostId);
    setWithdrawConfirm(null);

    if (result) {
      const syncResult = syncCareerSideRecordsAfterWithdraw(careerPostId);
      if (!syncResult.ok) {
        console.warn("[CareerSideSync] withdraw sync failed:", syncResult.reason);
      }

      onNotice({
        title: "Resignation withdrawn",
        message: "You are back to working status.",
        tone: "success",
      });
      return;
    }

    onNotice({
      title: "Cannot withdraw",
      message: "Your employer may have already confirmed.",
      tone: "warn",
    });
  }

  if (!record) return null;

  const actions = getEmployeeActions(record);
  const visibleTimelineRecord = makeVisibleTimelineRecord(record);

  return (
    <>
      <div
        style={{
          marginTop: 16,
          padding: 0,
          overflow: "hidden",
          borderRadius: 28,
          border: "1px solid rgba(226, 232, 240, 0.8)",
          background: "linear-gradient(180deg, #ffffff 0%, #fcfdfe 100%)",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ padding: "15px 16px 13px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 950, color: CAREER_BLUE }}>
                Employment status
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11.8,
                  color: CAREER_MUTED,
                  fontWeight: 750,
                  lineHeight: 1.45,
                }}
              >
                Manage this job only from your Career Workspace.
              </div>
            </div>

            <CareerStatusBadge record={record} />
          </div>

          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: record.workDurationDisplay ? "1fr 1fr" : "1fr",
              gap: 9,
            }}
          >
            {record.joinedAt && (
              <div
                style={{
                  padding: "10px 11px",
                  borderRadius: 15,
                  background: "rgba(29,78,216,0.055)",
                  border: "1px solid rgba(29,78,216,0.09)",
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>Joined</div>
                <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 950, color: CAREER_TEXT }}>
                  {formatDate(record.joinedAt)}
                </div>
              </div>
            )}

            {record.workDurationDisplay && (
              <div
                style={{
                  padding: "10px 11px",
                  borderRadius: 15,
                  background: "rgba(15,23,42,0.035)",
                  border: "1px solid rgba(15,23,42,0.05)",
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>Duration</div>
                <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 950, color: CAREER_TEXT }}>
                  {record.workDurationDisplay}
                </div>
              </div>
            )}
          </div>

          {record.status === "completed" && (
            <div style={{ marginTop: 10, fontSize: 12, color: CAREER_MUTED }}>
              Status: <span style={{ fontWeight: 900 }}>{getStatusLabel(record)}</span>
            </div>
          )}

          <NoticeCountdownPanel record={record} />
        </div>

        {(actions.canResign || actions.canWithdraw || actions.canForceComplete) && (
          <div
            style={{
              padding: "13px 16px 15px",
              borderTop: "1px solid rgba(148,163,184,0.14)",
              background: actions.canResign
                ? "linear-gradient(135deg, rgba(255,247,237,0.82), rgba(255,255,255,0.96))"
                : "linear-gradient(135deg, rgba(239,246,255,0.78), rgba(255,255,255,0.96))",
            }}
          >
            {actions.canResign && (
              <div
                style={{
                  marginBottom: 11,
                  padding: "10px 11px",
                  borderRadius: 15,
                  background: "rgba(220,38,38,0.055)",
                  border: "1px solid rgba(220,38,38,0.13)",
                }}
              >
                <div style={{ fontSize: 12.4, fontWeight: 950, color: DANGER }}>
                  Resignation action
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11.7,
                    color: CAREER_MUTED,
                    fontWeight: 750,
                    lineHeight: 1.45,
                  }}
                >
                  Use this only when you want to leave this job. Your notice period countdown will
                  start after submission.
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              {actions.canResign && (
                <button
                  type="button"
                  onClick={() => setResignOpen(true)}
                  style={{
                    minHeight: 40,
                    padding: "0 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "#dc2626",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Resign job
                </button>
              )}

              {actions.canWithdraw && (
                <button
                  type="button"
                  onClick={() =>
                    setWithdrawConfirm({
                      title: "Withdraw resignation?",
                      message:
                        "You will return to working status. This is only possible before your employer closes the employment record.",
                      tone: "neutral",
                      confirmLabel: "Withdraw",
                      cancelLabel: "Cancel",
                    })
                  }
                  style={{
                    minHeight: 40,
                    padding: "0 17px",
                    borderRadius: 13,
                    border: "1px solid rgba(29,78,216,0.24)",
                    background: "rgba(29,78,216,0.06)",
                    color: CAREER_BLUE,
                    fontSize: 13,
                    fontWeight: 950,
                    cursor: "pointer",
                  }}
                >
                  Withdraw resignation
                </button>
              )}

              {actions.canForceComplete && (
                <button
                  type="button"
                  onClick={() =>
                    setForceConfirm({
                      title: "Complete employment?",
                      message:
                        "Your employer has not closed this record after the notice period. This will mark the employment as completed and unlock ratings. Your employer will be notified.",
                      tone: "neutral",
                      confirmLabel: "Complete now",
                      cancelLabel: "Wait",
                    })
                  }
                  style={{
                    minHeight: 40,
                    padding: "0 17px",
                    borderRadius: 13,
                    border: "1px solid rgba(180,83,9,0.35)",
                    background: "rgba(180,83,9,0.07)",
                    color: WARNING,
                    fontSize: 13,
                    fontWeight: 950,
                    cursor: "pointer",
                  }}
                >
                  Complete employment
                </button>
              )}

              {!actions.canForceComplete &&
                (record.status === "notice" || record.status === "resigned") &&
                (() => {
                  const daysLeft = getDaysUntilForceComplete(record);

                  return daysLeft > 0 ? (
                    <div
                      style={{
                        fontSize: 11,
                        color: CAREER_MUTED,
                        marginTop: 4,
                        width: "100%",
                        textAlign: "right",
                      }}
                    >
                      If employer does not respond after notice period, you can complete this in{" "}
                      {daysLeft} day{daysLeft > 1 ? "s" : ""}.
                    </div>
                  ) : null;
                })()}
            </div>
          </div>
        )}
      </div>

      {visibleTimelineRecord.timeline.length > 1 && (
        <div className="wm-ee-card" style={{ marginTop: 12 }}>
          <EmploymentTimeline record={visibleTimelineRecord} />
        </div>
      )}

      <ResignJobModal
        open={resignOpen}
        companyName={companyName}
        noticePeriodDays={record.noticePeriodDays}
        onConfirm={handleResign}
        onCancel={() => setResignOpen(false)}
      />

      <ConfirmModal
        confirm={withdrawConfirm}
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawConfirm(null)}
      />
      <ConfirmModal
        confirm={forceConfirm}
        onConfirm={handleForceComplete}
        onCancel={() => setForceConfirm(null)}
      />
    </>
  );
}
