// src/features/employee/employment/components/EmploymentRatingSection.tsx
//
// Protected Career employment feedback section.
// Keeps employer-to-employee feedback and employee-to-employer feedback separated.

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  careerEmployerFeedbackStorage,
  type CareerEmployerFeedbackRecordSnapshot,
  type CareerEmployerFeedbackTag,
} from "../../../../shared/employmentFeedback/careerEmployerFeedback.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import {
  EmployeeEmployerFeedbackForm,
  type FeedbackConfirmationState,
} from "./feedback/EmployeeEmployerFeedbackForm";
import { EmployeeEmployerFeedbackConfirmModal } from "./feedback/EmployeeEmployerFeedbackConfirmModal";
import { EmployeeEmployerFeedbackExpiredCard } from "./feedback/EmployeeEmployerFeedbackExpiredCard";
import { EmployeeEmployerFeedbackSubmittedCard } from "./feedback/EmployeeEmployerFeedbackSubmittedCard";
import { EmployerFeedbackAboutEmployeeCard } from "./feedback/EmployerFeedbackAboutEmployeeCard";

type Props = {
  record: EmploymentRecord;
};

function parseFeedbackSnapshot(raw: string): CareerEmployerFeedbackRecordSnapshot {
  try {
    const parsed = JSON.parse(raw) as CareerEmployerFeedbackRecordSnapshot;

    return {
      task: parsed.task ?? null,
      canSubmit: Boolean(parsed.canSubmit),
      canEdit: Boolean(parsed.canEdit),
      isExpired: Boolean(parsed.isExpired),
      daysLeft: Number(parsed.daysLeft) || 0,
    };
  } catch {
    return {
      task: null,
      canSubmit: false,
      canEdit: false,
      isExpired: false,
      daysLeft: 0,
    };
  }
}

function toggleTag(
  current: CareerEmployerFeedbackTag[],
  next: CareerEmployerFeedbackTag,
): CareerEmployerFeedbackTag[] {
  return current.includes(next) ? current.filter((tag) => tag !== next) : [...current, next];
}

function hasSensitiveWarningText(comment: string): boolean {
  const value = comment.toLowerCase();
  const warningWords = [
    "fraud",
    "cheat",
    "abuse",
    "threat",
    "illegal",
    "harass",
    "scam",
    "criminal",
  ];

  return warningWords.some((word) => value.includes(word));
}

function emptyConfirmations(): FeedbackConfirmationState {
  return {
    realExperience: false,
    fairTruthful: false,
    lockUnderstood: false,
  };
}

function allConfirmed(value: FeedbackConfirmationState): boolean {
  return value.realExperience && value.fairTruthful && value.lockUnderstood;
}

function getSubmittedByLabel(): string {
  const profile = employeeProfileStorage.get();

  return profile.uniqueId || "Employee ID not available";
}

export function EmploymentRatingSection({ record }: Props) {
  const [selectedTags, setSelectedTags] = useState<CareerEmployerFeedbackTag[]>([]);
  const [privateComment, setPrivateComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [confirmations, setConfirmations] = useState<FeedbackConfirmationState>(() =>
    emptyConfirmations(),
  );
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  const snapshotRaw = useSyncExternalStore(
    careerEmployerFeedbackStorage.subscribe,
    () => careerEmployerFeedbackStorage.getRecordSnapshot(record),
    () => careerEmployerFeedbackStorage.getRecordSnapshot(record),
  );

  const snapshot = useMemo(() => parseFeedbackSnapshot(snapshotRaw), [snapshotRaw]);
  const submittedBy = useMemo(() => getSubmittedByLabel(), []);

  const isExited = record.status === "exited";
  const completedTask = snapshot.task?.state === "completed" ? snapshot.task : null;
  const showForm = isExited && snapshot.canSubmit && (!completedTask || isEditing);
  const canContinue = selectedTags.length > 0 && allConfirmed(confirmations);
  const shouldShowSensitiveWarning = hasSensitiveWarningText(privateComment);

  function resetFormState() {
    setIsEditing(false);
    setSelectedTags([]);
    setPrivateComment("");
    setConfirmations(emptyConfirmations());
    setShowFinalConfirm(false);
  }

  function handleFinalSubmit() {
    if (!canContinue) return;

    const success = careerEmployerFeedbackStorage.submit(record, selectedTags, privateComment);

    if (success) {
      resetFormState();
    }
  }

  function handleEdit() {
    if (!completedTask || !snapshot.canEdit) return;

    setSelectedTags(completedTask.selectedTags ?? []);
    setPrivateComment(completedTask.privateComment ?? "");
    setConfirmations(emptyConfirmations());
    setIsEditing(true);
  }

  function updateConfirmation(key: keyof FeedbackConfirmationState, checked: boolean) {
    setConfirmations((current) => ({ ...current, [key]: checked }));
  }

  return (
    <>
      {isExited && typeof record.employerRating === "number" && (
        <EmployerFeedbackAboutEmployeeCard
          rating={record.employerRating}
          comment={record.employerComment}
          companyName={record.companyName}
          careerPostId={record.careerPostId}
          jobTitle={record.jobTitle}
          employeeUniqueId={submittedBy}
          recordedAt={record.exitedAt ?? record.updatedAt}
        />
      )}

      {showForm && (
        <EmployeeEmployerFeedbackForm
          selectedTags={selectedTags}
          privateComment={privateComment}
          confirmations={confirmations}
          daysLeft={snapshot.daysLeft}
          isEditing={isEditing}
          canContinue={canContinue}
          shouldShowSensitiveWarning={shouldShowSensitiveWarning}
          onToggleTag={(tag) => setSelectedTags((current) => toggleTag(current, tag))}
          onCommentChange={setPrivateComment}
          onConfirmationChange={updateConfirmation}
          onCancelEdit={resetFormState}
          onContinue={() => setShowFinalConfirm(true)}
        />
      )}

      {completedTask && !isEditing && (
        <EmployeeEmployerFeedbackSubmittedCard
          task={completedTask}
          canEdit={snapshot.canEdit}
          submittedBy={submittedBy}
          onEdit={handleEdit}
        />
      )}

      {isExited && snapshot.isExpired && !completedTask && <EmployeeEmployerFeedbackExpiredCard />}

      <EmployeeEmployerFeedbackConfirmModal
        open={showFinalConfirm}
        onClose={() => setShowFinalConfirm(false)}
        onConfirm={handleFinalSubmit}
      />
    </>
  );
}
