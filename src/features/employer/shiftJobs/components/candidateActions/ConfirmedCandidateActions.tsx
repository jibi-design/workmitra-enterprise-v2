// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ConfirmedCandidateActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateActions\ConfirmedCandidateActions.tsx

import { DANGER_OUTLINE_BUTTON_STYLE, PRIMARY_BUTTON_STYLE } from "./CandidateActionButtonStyles";

type Props = {
  appId: string;
  onOpenGroup: (appId: string) => void;
  onReplace: (appId: string) => void;
};

export function ConfirmedCandidateActions({ appId, onOpenGroup, onReplace }: Props) {
  return (
    <>
      <button
        className="wm-primarybtn"
        type="button"
        onClick={() => onOpenGroup(appId)}
        style={PRIMARY_BUTTON_STYLE}
      >
        Open Group
      </button>

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => onReplace(appId)}
        style={DANGER_OUTLINE_BUTTON_STYLE}
      >
        Replace
      </button>
    </>
  );
}
