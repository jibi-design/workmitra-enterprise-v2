// App name: Job Mitra
// File name: EmployerCareerPostDashboardModals.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\EmployerCareerPostDashboardModals.tsx

import { CompareApplicantsModal } from "../../../../shared/components/CompareApplicantsModal";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { NoticeModal } from "../../../../shared/components/NoticeModal";
import type { useEmployerCareerPostDashboardState } from "../hooks/useEmployerCareerPostDashboardState";
import { CareerOfferModal } from "./CareerOfferModal";
import { CareerPostNotesModal } from "./CareerPostNotesModal";
import { CareerRejectModal } from "./CareerRejectModal";
import { CareerResultModal } from "./CareerResultModal";
import { CareerScheduleModal } from "./CareerScheduleModal";

type DashboardState = ReturnType<typeof useEmployerCareerPostDashboardState>;

type EmployerCareerPostDashboardModalsProps = {
  state: DashboardState;
};

export function EmployerCareerPostDashboardModals({
  state,
}: EmployerCareerPostDashboardModalsProps) {
  if (!state.post) return null;

  return (
    <>
      <NoticeModal notice={state.notice} onClose={() => state.setNotice(null)} />

      <ConfirmModal
        confirm={state.confirmData}
        onConfirm={state.handleConfirm}
        onCancel={state.closeConfirm}
      />

      <CareerScheduleModal
        open={state.scheduleTarget !== null}
        roundLabel={state.scheduleTarget?.roundLabel ?? ""}
        onClose={() => state.setScheduleTarget(null)}
        onSubmit={state.handleScheduleSubmit}
      />

      <CareerResultModal
        open={state.resultTarget !== null}
        roundLabel={state.resultTarget?.roundLabel ?? ""}
        candidateName={state.resultTarget?.candidateName ?? ""}
        candidateWorkerId={state.resultTarget?.candidateWorkerId ?? ""}
        onClose={() => state.setResultTarget(null)}
        onSubmit={state.handleResultSubmit}
      />

      <CareerRejectModal
        open={state.rejectTarget !== null}
        candidateName={state.rejectTarget?.candidateName ?? ""}
        currentStage={state.rejectTarget?.currentStage ?? "applied"}
        mode={state.rejectTarget?.mode ?? "single"}
        onClose={() => state.setRejectTarget(null)}
        onSubmit={state.handleRejectSubmit}
      />

      <CareerOfferModal
        open={state.offerTarget !== null}
        jobTitle={state.post.jobTitle}
        candidateName={state.offerTarget?.candidateName ?? ""}
        candidateWorkerId={state.offerTarget?.candidateWorkerId ?? ""}
        onClose={() => state.setOfferTarget(null)}
        onSubmit={state.handleOfferSubmit}
      />

      <CareerPostNotesModal
        open={state.notesTarget !== null}
        value={state.notesValue}
        onValueChange={state.setNotesValue}
        onSave={state.handleNotesSave}
        onClose={() => {
          state.setNotesTarget(null);
          state.setNotesValue("");
        }}
      />

      <CompareApplicantsModal
        isOpen={state.compareOpen}
        applicants={state.compareApplicants}
        onClose={state.closeCompare}
      />
    </>
  );
}
