// App name: Job Mitra
// File name: SmartCandidateBlock.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\SmartCandidateBlock.tsx

import type { ScoredApplication } from "../helpers/smartSelectionHelpers";
import type { SmartCandidateCardProps } from "../types/smartCandidateGroup.types";
import { CandidateCard } from "./CandidateCard";
import { SmartCandidatePriorityRow } from "./SmartCandidatePriorityRow";
import { SmartCandidateScoreBadge } from "./SmartCandidateScoreBadge";

type SmartCandidateBlockProps = {
  scored: ScoredApplication;
} & SmartCandidateCardProps;

export function SmartCandidateBlock({
  scored,
  tab,
  isBusy,
  quickQuestions,
  onMoveToShortlist,
  onMoveToWaiting,
  onConfirm,
  onOpenGroup,
  onRemove,
  onReplace,
  onPriorityTag,
  priorityTags,
}: SmartCandidateBlockProps) {
  const { app } = scored;

  const cardMode =
    tab === "shortlisted"
      ? "shortlist"
      : tab === "selected"
        ? "confirmed"
        : tab === "backup"
          ? "waiting"
          : tab;

  return (
    <div>
      <SmartCandidateScoreBadge scored={scored} />

      <SmartCandidatePriorityRow
        app={app}
        onPriorityTag={onPriorityTag}
        priorityTags={priorityTags}
      />

      <CandidateCard
        app={app}
        mode={cardMode}
        isBusy={isBusy}
        quickQuestions={quickQuestions}
        showCompareSelector={false}
        isCompareSelected={false}
        isCompareDisabled={false}
        onToggleCompare={() => undefined}
        onMoveToShortlist={onMoveToShortlist}
        onMoveToWaiting={onMoveToWaiting}
        onConfirm={onConfirm}
        onOpenGroup={onOpenGroup}
        onRemove={onRemove}
        onReplace={onReplace}
      />
    </div>
  );
}
