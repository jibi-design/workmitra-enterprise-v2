// App: Job Mitra / WorkMitra_Enterprise_v2
// File: careerWorkspacePage.helpers.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerWorkspacePage.helpers.ts

import type { CareerEmploymentFeedbackCompletedSnapshot } from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import {
  employmentLifecycleStorage,
  type EmploymentRecord,
} from "../../employment/storage/employmentLifecycle.storage";

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

export function getLifecycleSnapshot(): string {
  return JSON.stringify(employmentLifecycleStorage.getAll());
}

export function parseLifecycleRecord(careerPostId: string, raw: string): EmploymentRecord | null {
  try {
    const parsed = JSON.parse(raw) as EmploymentRecord[];
    if (!Array.isArray(parsed)) return null;

    return (
      parsed.find((item) => item.careerPostId === careerPostId && item.status !== "exited") ??
      parsed.find((item) => item.careerPostId === careerPostId) ??
      null
    );
  } catch {
    return null;
  }
}
