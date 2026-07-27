// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CareerResultModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerResultModal.tsx

import { useState } from "react";
import { CareerResultConfirmModal } from "./careerResult/CareerResultConfirmModal";
import { CareerResultFormModal } from "./careerResult/CareerResultFormModal";

type Props = {
  open: boolean;
  roundLabel: string;
  candidateName: string;
  candidateWorkerId: string;
  onClose: () => void;
  onSubmit: (result: "passed" | "failed", feedback: string) => void;
};

export function CareerResultModal({
  open,
  roundLabel,
  candidateName,
  candidateWorkerId,
  onClose,
  onSubmit,
}: Props) {
  const [result, setResult] = useState<"passed" | "failed" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const canSubmit = result !== null;
  const safeCandidateName = candidateName.trim() || "this candidate";

  function handleSubmitClick() {
    if (!result) return;
    setShowConfirm(true);
  }

  function handleConfirmedSubmit() {
    if (!result) return;
    onSubmit(result, feedback.trim());
    resetAndClose();
  }

  function resetAndClose() {
    setResult(null);
    setFeedback("");
    setShowConfirm(false);
    onClose();
  }

  const confirmTitle =
    result === "passed" ? "Confirm: Mark as Passed?" : "Confirm: Mark as Not Passed?";

  const confirmMessage =
    result === "passed"
      ? `Are you sure ${safeCandidateName} passed ${roundLabel}? This action will advance the candidate in the pipeline and cannot be easily undone.`
      : `Are you sure ${safeCandidateName} did not pass ${roundLabel}? This may end the candidate's progress in the interview pipeline.`;

  const confirmColor =
    result === "passed" ? "var(--wm-career-success, #16a34a)" : "var(--wm-error, #dc2626)";

  return (
    <>
      <CareerResultFormModal
        open={open && !showConfirm}
        roundLabel={roundLabel}
        candidateName={candidateName}
        result={result}
        feedback={feedback}
        canSubmit={canSubmit}
        onResultChange={setResult}
        onFeedbackChange={setFeedback}
        onSubmitClick={handleSubmitClick}
        onClose={resetAndClose}
      />

      <CareerResultConfirmModal
        open={showConfirm}
        result={result}
        confirmTitle={confirmTitle}
        candidateName={safeCandidateName}
        candidateWorkerId={candidateWorkerId}
        roundLabel={roundLabel}
        confirmMessage={confirmMessage}
        confirmColor={confirmColor}
        onBack={() => setShowConfirm(false)}
        onConfirm={handleConfirmedSubmit}
      />
    </>
  );
}
