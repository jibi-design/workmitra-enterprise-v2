/** Job Mitra | employmentLayoutPreview.purge.ts — remove layout-inspection employment pollution */

import { employmentLifecycleStorage } from "./employmentLifecycle.storage";
import { workDiaryStorage } from "./workDiary.storage";

/** Seeded only by HOME_LAYOUT_INSPECTION home preview — never a real hire. */
export const LAYOUT_PREVIEW_CAREER_POST_ID = "layout_preview_career_post";

/**
 * Removes layout-preview employment records and any Work Diary rows/settings
 * keyed to those employment ids. Real hires and vault data are untouched.
 */
export function purgeLayoutPreviewEmploymentArtifacts(): {
  removedEmploymentIds: string[];
} {
  const all = employmentLifecycleStorage.getAll();
  const removed = all.filter((record) => record.careerPostId === LAYOUT_PREVIEW_CAREER_POST_ID);

  if (removed.length === 0) {
    return { removedEmploymentIds: [] };
  }

  const removedEmploymentIds = removed.map((record) => record.id);
  const keep = all.filter((record) => record.careerPostId !== LAYOUT_PREVIEW_CAREER_POST_ID);

  employmentLifecycleStorage.restoreEmploymentLifecycleRecords(keep);
  workDiaryStorage.purgeForEmployments(removedEmploymentIds);

  // Re-assert a valid primary among remaining actives (invalid stored id falls through).
  const nextPrimary = employmentLifecycleStorage.getPrimaryActiveId();
  if (nextPrimary) {
    employmentLifecycleStorage.setPrimaryActiveId(nextPrimary);
  }

  return { removedEmploymentIds };
}
