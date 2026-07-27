// App name: Job Mitra
// File name: useEmployerShiftDashboardConfirm.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\dashboard\useEmployerShiftDashboardConfirm.ts

import { useState } from "react";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";

export type EmployerShiftDashboardConfirmHandler = (
  data: ConfirmData,
  fn: () => void | Promise<void>,
) => void;

export function useEmployerShiftDashboardConfirm() {
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [confirmFn, setConfirmFn] = useState<(() => void) | null>(null);

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

  function handleConfirmModalConfirm() {
    confirmFn?.();
    closeConfirm();
  }

  return {
    confirmData,
    openConfirm,
    closeConfirm,
    handleConfirmModalConfirm,
  };
}
