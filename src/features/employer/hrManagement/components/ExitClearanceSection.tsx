// src/features/employer/hrManagement/components/ExitClearanceSection.tsx
//
// Full exit processing view: trigger info, notice period,
// clearance checklist, settlement note, finalize exit.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { ExitClearanceChecklist } from "./ExitClearanceChecklist";
import { ExitInitiationForm } from "./ExitInitiationForm";
import {
  ExitInfoCard,
  ExperienceLetterPanel,
  SettlementNotePanel,
} from "./ExitClearanceSection.parts";
import { FinalizeErrorBanner, FinalizeExitPanel } from "./ExitClearanceSection.finalize.parts";
import { getFinalizeErrorMessage } from "./ExitClearanceSection.helpers";

type Props = {
  record: HRCandidateRecord;
};

export function ExitClearanceSection({ record }: Props) {
  const [nowMs] = useState(() => Date.now());
  const [settlementNote, setSettlementNote] = useState(record.exitData?.settlementNote || "");
  const [showConfirmFinalize, setShowConfirmFinalize] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  if (!record.exitData) {
    return <ExitInitiationForm record={record} />;
  }

  const exitData = record.exitData;
  const allCleared = exitData.clearanceItems.every((i) => i.completedAt);
  const canFinalize = allCleared && exitData.experienceLetterSent;

  const handleSaveSettlement = () => {
    hrManagementStorage.saveSettlementNote(record.id, settlementNote);
  };

  const handleFinalize = async () => {
    setFinalizeError(null);

    const result = await hrManagementStorage.completeExitSaga(record.id);

    if (!result.ok) {
      setFinalizeError(getFinalizeErrorMessage(result.reason));
      setShowConfirmFinalize(false);
      return;
    }

    setShowConfirmFinalize(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ExitInfoCard exitData={exitData} nowMs={nowMs} />
      <ExitClearanceChecklist recordId={record.id} exitData={exitData} />
      <SettlementNotePanel
        settlementNote={settlementNote}
        onChange={setSettlementNote}
        onSave={handleSaveSettlement}
      />
      <ExperienceLetterPanel experienceLetterSent={exitData.experienceLetterSent} />
      {finalizeError && <FinalizeErrorBanner message={finalizeError} />}
      <FinalizeExitPanel
        record={record}
        exitData={exitData}
        canFinalize={canFinalize}
        allCleared={allCleared}
        showConfirmFinalize={showConfirmFinalize}
        onShowConfirm={() => setShowConfirmFinalize(true)}
        onHideConfirm={() => setShowConfirmFinalize(false)}
        onFinalize={handleFinalize}
      />
    </div>
  );
}
