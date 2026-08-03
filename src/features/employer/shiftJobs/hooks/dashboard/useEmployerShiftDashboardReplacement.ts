// App name: Job Mitra
// File name: useEmployerShiftDashboardReplacement.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\dashboard\useEmployerShiftDashboardReplacement.ts

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import type { DashboardTab } from "../../helpers/shiftDashboardHelpers";
import { employerShiftStorage } from "../../storage/employerShift.storage";
import type { EmployeeShiftApplication } from "../../storage/employerShift.storage";

type ReplacementReason = NonNullable<EmployeeShiftApplication["replacedReason"]>;

type UseEmployerShiftDashboardReplacementInput = {
  readonly postId: string;
  readonly backupApps: readonly EmployeeShiftApplication[];
  readonly selectedApps: readonly EmployeeShiftApplication[];
  readonly busy: (fn: () => void | Promise<void>) => void;
  readonly setTab: Dispatch<SetStateAction<DashboardTab>>;
  readonly setNotice: Dispatch<SetStateAction<NoticeData | null>>;
};

export function useEmployerShiftDashboardReplacement({
  postId,
  backupApps,
  selectedApps,
  busy,
  setTab,
  setNotice,
}: UseEmployerShiftDashboardReplacementInput) {
  const [replaceCandidateId, setReplaceCandidateId] = useState<string | null>(null);

  const replaceCandidate =
    selectedApps.find((application) => application.id === replaceCandidateId) ?? null;
  const replaceCandidateName = getCandidateDisplayName(replaceCandidate);

  function requestReplaceCandidate(applicationId: string) {
    setReplaceCandidateId(applicationId);
  }

  function closeReplaceCandidateModal() {
    setReplaceCandidateId(null);
  }

  function handleConfirmReplaceCandidate(reason: ReplacementReason) {
    if (!replaceCandidateId) {
      return;
    }

    busy(async () => {
      const replaced = await employerShiftStorage.replaceConfirmed(
        postId,
        replaceCandidateId,
        reason,
      );

      setReplaceCandidateId(null);

      if (!replaced) {
        setNotice({
          title: "Replace failed",
          message: "This worker could not be replaced. Please refresh and try again.",
          tone: "warn",
        });
        return;
      }

      if (backupApps.length > 0) {
        setTab("backup");
        setNotice({
          title: "Slot released",
          message:
            "A confirmed slot is now open. Review backup candidates and confirm one manually.",
          tone: "success",
        });
        return;
      }

      setTab("selected");
      setNotice({
        title: "Worker replaced",
        message: "A confirmed slot is now open, but there are no backup candidates yet.",
        tone: "success",
      });
    });
  }

  return {
    replaceCandidateId,
    replaceCandidateName,
    requestReplaceCandidate,
    closeReplaceCandidateModal,
    handleConfirmReplaceCandidate,
  };
}

function getCandidateDisplayName(candidate: EmployeeShiftApplication | null): string {
  if (!candidate) {
    return "This worker";
  }

  const fullName = candidate.profileSnapshot?.fullName?.trim();

  if (fullName) {
    return fullName;
  }

  const uniqueId = candidate.profileSnapshot?.uniqueId?.trim();

  if (uniqueId) {
    return uniqueId;
  }

  return "This worker";
}
