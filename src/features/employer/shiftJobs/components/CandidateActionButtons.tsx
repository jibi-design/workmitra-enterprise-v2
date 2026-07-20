// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CandidateActionButtons.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\CandidateActionButtons.tsx

import type { Tab } from "../helpers/dashboardHelpers";
import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";
import { AppliedCandidateActions } from "./candidateActions/AppliedCandidateActions";
import { ConfirmedCandidateActions } from "./candidateActions/ConfirmedCandidateActions";
import { RejectedCandidateActions } from "./candidateActions/RejectedCandidateActions";
import { ShortlistCandidateActions } from "./candidateActions/ShortlistCandidateActions";
import { WaitingCandidateActions } from "./candidateActions/WaitingCandidateActions";

type CandidateActionButtonsProps = {
  app: EmployeeShiftApplication;
  mode: Tab;
  isBusy: boolean;
  onMoveToShortlist: (appId: string) => void;
  onMoveToWaiting: (appId: string) => void;
  onConfirm: (appId: string) => void;
  onOpenGroup: (appId: string) => void;
  onRemove: (appId: string) => void;
  onReplace: (appId: string) => void;
};

export function CandidateActionButtons({
  app,
  mode,
  isBusy,
  onMoveToShortlist,
  onMoveToWaiting,
  onConfirm,
  onOpenGroup,
  onRemove,
  onReplace,
}: CandidateActionButtonsProps) {
  return (
    <div
      style={{
        marginTop: 10,
        display: "flex",
        gap: 8,
        justifyContent: "flex-end",
        flexWrap: "wrap",
      }}
    >
      {mode === "applied" && (
        <AppliedCandidateActions
          appId={app.id}
          isBusy={isBusy}
          onMoveToShortlist={onMoveToShortlist}
          onRemove={onRemove}
        />
      )}

      {mode === "shortlist" && (
        <ShortlistCandidateActions
          app={app}
          isBusy={isBusy}
          onConfirm={onConfirm}
          onOpenGroup={onOpenGroup}
          onMoveToWaiting={onMoveToWaiting}
          onRemove={onRemove}
        />
      )}

      {mode === "waiting" && (
        <WaitingCandidateActions
          appId={app.id}
          onMoveToShortlist={onMoveToShortlist}
          onRemove={onRemove}
        />
      )}

      {mode === "confirmed" && (
        <ConfirmedCandidateActions appId={app.id} onOpenGroup={onOpenGroup} onReplace={onReplace} />
      )}

      {mode === "rejected" && (
        <RejectedCandidateActions appId={app.id} onMoveToShortlist={onMoveToShortlist} />
      )}
    </div>
  );
}
