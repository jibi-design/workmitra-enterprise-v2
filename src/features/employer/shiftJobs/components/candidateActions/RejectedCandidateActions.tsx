// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RejectedCandidateActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateActions\RejectedCandidateActions.tsx

import { OUTLINE_BUTTON_STYLE } from "./CandidateActionButtonStyles";

type Props = {
  appId: string;
  onMoveToShortlist: (appId: string) => void;
};

export function RejectedCandidateActions({ appId, onMoveToShortlist }: Props) {
  return (
    <button
      className="wm-outlineBtn"
      type="button"
      onClick={() => onMoveToShortlist(appId)}
      style={OUTLINE_BUTTON_STYLE}
    >
      Reconsider
    </button>
  );
}
