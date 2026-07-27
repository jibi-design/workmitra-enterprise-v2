import { useEffect, useState, useSyncExternalStore } from "react";
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
import { getEmployeeActions } from "../../../../shared/employment/employmentDisplayHelpers";
import { hydrateEmploymentsFromDb } from "../../../career/services/employmentDbTruth.service";
import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.service";
import {
  CareerStatusBadge,
  NoticeCountdownPanel,
} from "./careerWorkspaceEmployment/CareerWorkspaceEmploymentPanels";
import {
  CAREER_BLUE,
  CAREER_MUTED,
  getEmploymentSnapshot,
  makeVisibleTimelineRecord,
} from "./careerWorkspaceEmployment/CareerWorkspaceEmploymentPanels.helpers";
import {
  CareerWorkspaceEmploymentActions,
  CareerWorkspaceEmploymentSummary,
} from "./careerWorkspaceEmployment/CareerWorkspaceEmploymentActions";

type Props = {
  careerPostId: string;
  companyName: string;
  onNotice: (n: NoticeData) => void;
};

export function CareerWorkspaceEmploymentSection({ careerPostId, companyName, onNotice }: Props) {
  const allRecords = useSyncExternalStore(
    employmentStorage.subscribe,
    getEmploymentSnapshot,
    getEmploymentSnapshot,
  );
  const record = allRecords.find((item) => item.careerPostId === careerPostId) ?? null;

  const [resignOpen, setResignOpen] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState<ConfirmData | null>(null);
  const [forceConfirm, setForceConfirm] = useState<ConfirmData | null>(null);

  useEffect(() => {
    if (!isCareerApiSyncEnabled()) return;
    void hydrateEmploymentsFromDb("employee");
  }, []);

  async function handleResign(
    reason: Parameters<typeof employmentActions.resign>[1],
    notes: string,
  ): Promise<void> {
    const result = await employmentActions.resign(careerPostId, reason, notes);
    setResignOpen(false);

    if (result) {
      const syncResult = syncCareerSideRecordsAfterResignation(careerPostId, result, reason, notes);
      if (!syncResult.ok)
        console.warn("[CareerSideSync] resignation sync failed:", syncResult.reason);
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

  async function handleForceComplete(): Promise<void> {
    const result = await employmentActions.forceComplete(careerPostId);
    setForceConfirm(null);

    if (result) {
      const syncResult = syncCareerSideRecordsAfterForceComplete(
        careerPostId,
        result.completedAt ?? Date.now(),
      );
      if (!syncResult.ok)
        console.warn("[CareerSideSync] force complete sync failed:", syncResult.reason);
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

  async function handleWithdraw(): Promise<void> {
    const result = await employmentActions.withdrawResignation(careerPostId);
    setWithdrawConfirm(null);

    if (result) {
      const syncResult = syncCareerSideRecordsAfterWithdraw(careerPostId);
      if (!syncResult.ok) console.warn("[CareerSideSync] withdraw sync failed:", syncResult.reason);
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
          borderRadius: "var(--wm-radius-employer-card)",
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

          <CareerWorkspaceEmploymentSummary record={record} />
          <NoticeCountdownPanel record={record} />
        </div>

        <CareerWorkspaceEmploymentActions
          record={record}
          actions={actions}
          onOpenResign={() => setResignOpen(true)}
          onOpenWithdrawConfirm={setWithdrawConfirm}
          onOpenForceConfirm={setForceConfirm}
        />
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
