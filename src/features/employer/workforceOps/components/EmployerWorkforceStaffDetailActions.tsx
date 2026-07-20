// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffDetailActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffDetailActions.tsx

import type { WorkforceStaff } from "../../../../shared/domains/workforce/types/workforceTypes";
import { EmployerWorkforceStaffNotesSection } from "./EmployerWorkforceStaffNotesSection";
import { EmployerWorkforceStaffRatingSection } from "./EmployerWorkforceStaffRatingSection";
import { EmployerWorkforceStaffRemoveSection } from "./EmployerWorkforceStaffRemoveSection";

type Props = {
  staff: WorkforceStaff;
  editingBio: boolean;
  bioVal: string;
  plusVal: string;
  commentVal: string;
  ratingOpen: boolean;
  ratingVal: number;
  confirmRemove: boolean;
  onEditOrSaveBio: () => void;
  onCancelBioEdit: () => void;
  onBioChange: (value: string) => void;
  onPlusChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onToggleRating: () => void;
  onRatingChange: (value: number) => void;
  onSubmitRating: () => void;
  onCancelRating: () => void;
  onRequestRemove: () => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
};

export function EmployerWorkforceStaffDetailActions({
  staff,
  editingBio,
  bioVal,
  plusVal,
  commentVal,
  ratingOpen,
  ratingVal,
  confirmRemove,
  onEditOrSaveBio,
  onCancelBioEdit,
  onBioChange,
  onPlusChange,
  onCommentChange,
  onToggleRating,
  onRatingChange,
  onSubmitRating,
  onCancelRating,
  onRequestRemove,
  onConfirmRemove,
  onCancelRemove,
}: Props) {
  return (
    <>
      <EmployerWorkforceStaffRatingSection
        staff={staff}
        ratingOpen={ratingOpen}
        ratingVal={ratingVal}
        onToggleRating={onToggleRating}
        onRatingChange={onRatingChange}
        onSubmitRating={onSubmitRating}
        onCancelRating={onCancelRating}
      />

      <EmployerWorkforceStaffNotesSection
        staff={staff}
        editingBio={editingBio}
        bioVal={bioVal}
        plusVal={plusVal}
        commentVal={commentVal}
        onEditOrSaveBio={onEditOrSaveBio}
        onCancelBioEdit={onCancelBioEdit}
        onBioChange={onBioChange}
        onPlusChange={onPlusChange}
        onCommentChange={onCommentChange}
      />

      <EmployerWorkforceStaffRemoveSection
        staff={staff}
        confirmRemove={confirmRemove}
        onRequestRemove={onRequestRemove}
        onConfirmRemove={onConfirmRemove}
        onCancelRemove={onCancelRemove}
      />
    </>
  );
}
