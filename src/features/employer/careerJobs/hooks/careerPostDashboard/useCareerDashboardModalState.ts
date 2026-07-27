// App name: Job Mitra
// File name: useCareerDashboardModalState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\hooks\careerPostDashboard\useCareerDashboardModalState.ts

import { useState } from "react";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import type {
  CareerNotesTarget,
  CareerOfferTarget,
  CareerRejectTarget,
  CareerResultTarget,
  CareerScheduleTarget,
} from "../../types/careerPostDashboard.types";

export function useCareerDashboardModalState() {
  const [showLog, setShowLog] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [confirmFn, setConfirmFn] = useState<(() => void) | null>(null);

  const [scheduleTarget, setScheduleTarget] = useState<CareerScheduleTarget | null>(null);
  const [resultTarget, setResultTarget] = useState<CareerResultTarget | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CareerRejectTarget | null>(null);
  const [offerTarget, setOfferTarget] = useState<CareerOfferTarget | null>(null);
  const [notesTarget, setNotesTarget] = useState<CareerNotesTarget | null>(null);
  const [notesValue, setNotesValue] = useState("");

  function openConfirm(data: ConfirmData, fn: () => void | Promise<void>) {
    setConfirmData(data);
    setConfirmFn(() => () => {
      void Promise.resolve(fn());
    });
  }

  function closeConfirm() {
    setConfirmData(null);
    setConfirmFn(null);
  }

  function handleConfirm() {
    confirmFn?.();
    closeConfirm();
  }

  return {
    showLog,
    setShowLog,
    notice,
    setNotice,
    confirmData,
    openConfirm,
    closeConfirm,
    handleConfirm,
    scheduleTarget,
    setScheduleTarget,
    resultTarget,
    setResultTarget,
    rejectTarget,
    setRejectTarget,
    offerTarget,
    setOfferTarget,
    notesTarget,
    setNotesTarget,
    notesValue,
    setNotesValue,
  };
}
