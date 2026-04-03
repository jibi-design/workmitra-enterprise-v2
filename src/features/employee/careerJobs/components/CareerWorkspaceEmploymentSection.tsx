// src/features/employee/careerJobs/components/CareerWorkspaceEmploymentSection.tsx
// Session 17: Employment lifecycle UI for employee career workspace.

import { useState, useSyncExternalStore } from "react";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import { employmentActions } from "../../../../shared/employment/employmentActions";
import type { EmploymentRecord } from "../../../../shared/employment/employmentTypes";
import {
  getEmployeeActions,
  getStatusLabel,
  formatDate,
} from "../../../../shared/employment/employmentDisplayHelpers";
import { EmploymentStatusBadge, NoticePeriodCard } from "../../../../shared/employment/components/EmploymentBadges";
import { EmploymentTimeline } from "../../../../shared/employment/components/EmploymentTimeline";
import { ResignJobModal } from "../../../../shared/employment/components/ResignJobModal";

/* ── Snapshot for useSyncExternalStore ── */
let cachedRecords: EmploymentRecord[] = [];
function getSnapshot(): EmploymentRecord[] {
  const fresh = employmentStorage.getAll();
  if (JSON.stringify(fresh) !== JSON.stringify(cachedRecords)) cachedRecords = fresh;
  return cachedRecords;
}

/* ── Props ── */
type Props = {
  careerPostId: string;
  companyName: string;
  noticePeriodDays: number;
  onNotice: (n: NoticeData) => void;
};

/* ── Component ── */
export function CareerWorkspaceEmploymentSection({ careerPostId, companyName, noticePeriodDays, onNotice }: Props) {
  const allRecords = useSyncExternalStore(employmentStorage.subscribe, getSnapshot, getSnapshot);
  const record = allRecords.find((r) => r.careerPostId === careerPostId) ?? null;

  const [resignOpen, setResignOpen] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState<ConfirmData | null>(null);

  function handleResign(reason: Parameters<typeof employmentActions.resign>[1], notes: string): void {
    const result = employmentActions.resign(careerPostId, reason, notes);
    setResignOpen(false);
    if (result) onNotice({ title: "Resignation submitted", message: "Your employer has been notified.", tone: "success" });
    else onNotice({ title: "Cannot resign", message: "Please try again.", tone: "warn" });
  }

  function handleWithdraw(): void {
    const result = employmentActions.withdrawResignation(careerPostId);
    setWithdrawConfirm(null);
    if (result) onNotice({ title: "Resignation withdrawn", message: "You are back to working status.", tone: "success" });
    else onNotice({ title: "Cannot withdraw", message: "Your employer may have already confirmed.", tone: "warn" });
  }

  if (!record) return null;

  const actions = getEmployeeActions(record);

  return (
    <>
      {/* Employment status card */}
      <div className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-career)" }}>Employment status</div>
          <EmploymentStatusBadge record={record} />
        </div>

        {/* Key dates */}
        <div style={{ marginTop: 10, display: "grid", gap: 4 }}>
          {record.joinedAt && (
            <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)" }}>
              Joined: <span style={{ fontWeight: 600, color: "var(--wm-emp-text, #111827)" }}>{formatDate(record.joinedAt)}</span>
            </div>
          )}
          {record.workDurationDisplay && (
            <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)" }}>
              Duration: <span style={{ fontWeight: 600, color: "var(--wm-emp-text, #111827)" }}>{record.workDurationDisplay}</span>
            </div>
          )}
          {record.status === "completed" && (
            <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)" }}>
              Status: <span style={{ fontWeight: 600 }}>{getStatusLabel(record)}</span>
            </div>
          )}
        </div>

        {/* Notice period countdown */}
        <NoticePeriodCard record={record} />

        {/* Actions */}
        <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          {actions.canResign && (
            <button
              type="button"
              onClick={() => setResignOpen(true)}
              style={{
                height: 38, padding: "0 16px", borderRadius: 10,
                border: "1px solid rgba(220,38,38,0.3)", background: "rgba(220,38,38,0.06)",
                color: "var(--wm-error, #dc2626)", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Resign job
            </button>
          )}
          {actions.canWithdraw && (
            <button
              type="button"
              onClick={() => setWithdrawConfirm({
                title: "Withdraw resignation?",
                message: "You will return to working status. This is only possible before your employer confirms.",
                tone: "neutral",
                confirmLabel: "Withdraw",
                cancelLabel: "Cancel",
              })}
              style={{
                height: 38, padding: "0 16px", borderRadius: 10,
                border: "1px solid var(--wm-er-accent-career, #1d4ed8)", background: "rgba(29,78,216,0.06)",
                color: "var(--wm-er-accent-career, #1d4ed8)", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Withdraw resignation
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      {record.timeline.length > 1 && (
        <div className="wm-ee-card" style={{ marginTop: 12 }}>
          <EmploymentTimeline record={record} />
        </div>
      )}

      {/* Modals */}
      <ResignJobModal
        open={resignOpen}
        companyName={companyName}
        noticePeriodDays={noticePeriodDays}
        onConfirm={handleResign}
        onCancel={() => setResignOpen(false)}
      />
      <ConfirmModal
        confirm={withdrawConfirm}
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawConfirm(null)}
      />
    </>
  );
}