// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WaitingCandidateActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateActions\WaitingCandidateActions.tsx

import { DANGER_OUTLINE_BUTTON_STYLE, OUTLINE_BUTTON_STYLE } from "./CandidateActionButtonStyles";

type Props = {
  appId: string;
  onMoveToShortlist: (appId: string) => void;
  onRemove: (appId: string) => void;
};

export function WaitingCandidateActions({ appId, onMoveToShortlist, onRemove }: Props) {
  return (
    <>
      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => onMoveToShortlist(appId)}
        style={OUTLINE_BUTTON_STYLE}
      >
        Move to Shortlist
      </button>

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => onRemove(appId)}
        style={DANGER_OUTLINE_BUTTON_STYLE}
      >
        Reject
      </button>
    </>
  );
}
