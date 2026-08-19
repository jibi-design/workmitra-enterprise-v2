/** Job Mitra | employmentRecordModel.ts | Shared employment workspace data */

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { hrManagementStorage } from "../../../shared/hr/hrPublic";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackCompletedSnapshot,
} from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import { LAUNCH_VISIBILITY } from "../../../../shared/launch/launchVisibility";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import {
  employmentLifecycleStorage,
  type EmploymentRecord,
} from "../storage/employmentLifecycle.storage";

export type EmploymentPageSnapshot = {
  records: EmploymentRecord[];
  activeRecords: EmploymentRecord[];
  primaryId: string | null;
};

export function findHRCandidateId(careerPostId: string): string | null {
  const all = hrManagementStorage.getAll();
  const found = all.find(
    (record) => record.careerPostId === careerPostId && record.status === "active",
  );
  return found?.id ?? null;
}

export function parseCompletedFeedbackSnapshot(
  raw: string,
): CareerEmploymentFeedbackCompletedSnapshot {
  try {
    const parsed = JSON.parse(raw) as CareerEmploymentFeedbackCompletedSnapshot;
    return { task: parsed.task ?? null };
  } catch {
    return { task: null };
  }
}

export function getEmployeeUniqueId(): string {
  const profile = employeeProfileStorage.get();
  return profile.uniqueId || "Employee ID not available";
}

function readSnapshot(): string {
  const snapshot: EmploymentPageSnapshot = {
    records: employmentLifecycleStorage.getAll(),
    activeRecords: employmentLifecycleStorage.getActiveList(),
    primaryId: employmentLifecycleStorage.getPrimaryActiveId(),
  };
  return JSON.stringify(snapshot);
}

export function useEmploymentRecordModel(employmentId: string | undefined) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const subscribe = useCallback(
    (callback: () => void) => employmentLifecycleStorage.subscribe(callback),
    [],
  );
  const feedbackSubscribe = useCallback(
    (callback: () => void) => careerEmploymentFeedbackStorage.subscribe(callback),
    [],
  );

  const raw = useSyncExternalStore(subscribe, readSnapshot, readSnapshot);

  const parsed = useMemo<EmploymentPageSnapshot>(() => {
    try {
      const value = JSON.parse(raw) as EmploymentPageSnapshot;
      return {
        records: Array.isArray(value.records) ? value.records : [],
        activeRecords: Array.isArray(value.activeRecords) ? value.activeRecords : [],
        primaryId: value.primaryId ?? null,
      };
    } catch {
      return { records: [], activeRecords: [], primaryId: null };
    }
  }, [raw]);

  const record = useMemo(
    () => parsed.records.find((item) => item.id === employmentId) ?? null,
    [parsed.records, employmentId],
  );

  const employeeUniqueId = useMemo(() => getEmployeeUniqueId(), []);
  const careerPostId = record?.careerPostId ?? "";

  const feedbackRaw = useSyncExternalStore(
    feedbackSubscribe,
    () => careerEmploymentFeedbackStorage.getCompletedCareerPostSnapshot(careerPostId),
    () => careerEmploymentFeedbackStorage.getCompletedCareerPostSnapshot(careerPostId),
  );

  const completedFeedback = useMemo(
    () => parseCompletedFeedbackSnapshot(feedbackRaw).task,
    [feedbackRaw],
  );

  const hrCandidateId = useMemo(() => {
    if (!record) return null;
    return findHRCandidateId(record.careerPostId);
  }, [record]);

  const isClosedEmployment = record?.status === "exited";
  const showHrEmploymentTools =
    !!record && !isClosedEmployment && !!hrCandidateId && LAUNCH_VISIBILITY.employerHrManagement;
  const showManagerEmploymentTools =
    !!record && !isClosedEmployment && !!hrCandidateId && LAUNCH_VISIBILITY.employerManagerConsole;
  const canApplyLeave =
    showHrEmploymentTools && (record.status === "active" || record.status === "probation");

  return {
    record,
    parsed,
    employeeUniqueId,
    completedFeedback,
    hrCandidateId,
    isClosedEmployment,
    showHrEmploymentTools,
    showManagerEmploymentTools,
    canApplyLeave,
    showLeaveModal,
    setShowLeaveModal,
  };
}
