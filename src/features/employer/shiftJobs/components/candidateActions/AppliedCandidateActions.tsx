// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AppliedCandidateActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateActions\AppliedCandidateActions.tsx

import { DANGER_OUTLINE_BUTTON_STYLE, OUTLINE_BUTTON_STYLE } from "./CandidateActionButtonStyles";

type Props = {
  appId: string;
  isBusy: boolean;
  onMoveToShortlist: (appId: string) => void;
  onRemove: (appId: string) => void;
};

export function AppliedCandidateActions({ appId, isBusy, onMoveToShortlist, onRemove }: Props) {
  return (
    <>
      <button
        className="wm-outlineBtn"
        type="button"
        data-testid="shift-candidate-shortlist"
        onClick={() => onMoveToShortlist(appId)}
        disabled={isBusy}
        style={OUTLINE_BUTTON_STYLE}
      >
        Shortlist
      </button>

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => onRemove(appId)}
        disabled={isBusy}
        style={DANGER_OUTLINE_BUTTON_STYLE}
      >
        Reject
      </button>
    </>
  );
}
