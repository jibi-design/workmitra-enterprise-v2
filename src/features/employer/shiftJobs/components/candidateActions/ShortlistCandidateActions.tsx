// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShortlistCandidateActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateActions\ShortlistCandidateActions.tsx

import type { EmployeeShiftApplication } from "../../storage/employerShift.storage";
import {
  DANGER_OUTLINE_BUTTON_STYLE,
  OUTLINE_BUTTON_STYLE,
  PRIMARY_BUTTON_STYLE,
} from "./CandidateActionButtonStyles";

type Props = {
  app: EmployeeShiftApplication;
  isBusy: boolean;
  onConfirm: (appId: string) => void;
  onOpenGroup: (appId: string) => void;
  onMoveToWaiting: (appId: string) => void;
  onRemove: (appId: string) => void;
};

export function ShortlistCandidateActions({
  app,
  isBusy,
  onConfirm,
  onOpenGroup,
  onMoveToWaiting,
  onRemove,
}: Props) {
  const isConfirmed = app.status === "confirmed";

  return (
    <>
      {isConfirmed ? (
        <button
          className="wm-primarybtn"
          type="button"
          onClick={() => onOpenGroup(app.id)}
          style={PRIMARY_BUTTON_STYLE}
        >
          Open Group
        </button>
      ) : (
        <button
          className="wm-primarybtn"
          type="button"
          data-testid="shift-candidate-confirm-worker"
          onClick={() => onConfirm(app.id)}
          disabled={isBusy}
          style={PRIMARY_BUTTON_STYLE}
        >
          {isBusy ? "..." : "Confirm Worker"}
        </button>
      )}

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => onMoveToWaiting(app.id)}
        disabled={isBusy}
        style={OUTLINE_BUTTON_STYLE}
      >
        Move to Backup
      </button>

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => onRemove(app.id)}
        disabled={isBusy}
        style={DANGER_OUTLINE_BUTTON_STYLE}
      >
        Reject
      </button>
    </>
  );
}
