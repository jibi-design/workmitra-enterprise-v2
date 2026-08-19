/** Job Mitra | ensurePersonalWorkDiaryEmployment — heal missing primary for home diary */

import type { EmploymentRecord } from "../../employment/storage/employmentLifecycle.storage";
import { employmentLifecycleStorage } from "../../employment/storage/employmentLifecycle.storage";
import { workDiaryStorage } from "../../employment/storage/workDiary.storage";

/** Not layout-preview — home purge must not delete this continuity hire. */
const CONTINUITY_CAREER_POST_ID = "personal_work_diary_continuity_v1";

function pickContinuityEmploymentId(): string {
  const fromDiary = workDiaryStorage.getAllEntries().map((entry) => entry.employmentId).filter(Boolean);
  if (fromDiary[0]) return fromDiary[0];

  try {
    const stored = localStorage.getItem("wm_primary_current_employment_id_v1");
    if (stored?.trim()) return stored.trim();
  } catch {
    // ignore
  }

  return `emp_personal_${Date.now().toString(36)}`;
}

/**
 * Home Personal Work Diary needs an active employment for calendar + punch.
 * If lifecycle is empty (or primary missing) but the home card still opens,
 * restore/create Demo Partner Co continuity so classic diary can render.
 */
export function ensurePersonalWorkDiaryEmployment(): EmploymentRecord | null {
  const primary = employmentLifecycleStorage.getPrimaryActive();
  if (primary) return primary;

  const firstActive = employmentLifecycleStorage.getActiveList()[0];
  if (firstActive) {
    employmentLifecycleStorage.setPrimaryActiveId(firstActive.id);
    return employmentLifecycleStorage.getPrimaryActive();
  }

  const now = Date.now();
  const id = pickContinuityEmploymentId();
  const existing = employmentLifecycleStorage.getAll().find((record) => record.id === id);

  if (existing) {
    if (existing.status === "exited") {
      employmentLifecycleStorage.update(id, { status: "active", exitedAt: undefined });
    }
    employmentLifecycleStorage.setPrimaryActiveId(id);
    return employmentLifecycleStorage.getPrimaryActive();
  }

  const record: EmploymentRecord = {
    id,
    careerPostId: CONTINUITY_CAREER_POST_ID,
    companyName: "Demo Partner Co",
    jobTitle: "Warehouse Supervisor",
    department: "Operations",
    location: "On-site",
    joinedAt: now,
    status: "active",
    verified: false,
    hireMethod: "manually_added",
    createdAt: now,
    updatedAt: now,
  };

  const others = employmentLifecycleStorage.getAll().filter((item) => item.id !== id);
  employmentLifecycleStorage.restoreEmploymentLifecycleRecords([record, ...others]);
  employmentLifecycleStorage.setPrimaryActiveId(id);
  return employmentLifecycleStorage.getPrimaryActive();
}
