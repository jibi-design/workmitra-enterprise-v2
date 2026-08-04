/**
 * Phase 4 — Migrate wm_guest_* artifacts into authenticated employee profile storage.
 * Best-effort; never throws into auth success path.
 */

import { guestStorage } from "./guestStorage";
import {
  toggleFavoriteShift,
  getFavoriteShiftIds,
} from "../../features/employee/shiftJobs/helpers/shiftSearchHelpers";

export type GuestMigrationResult = {
  readonly shiftedFavorites: number;
  readonly careerShortlist: number;
  readonly skillsMerged: number;
};

/**
 * Merge guest shortlists / shadow skills into employee-scoped stores.
 * Career saved jobs require worker ML-ID — shortlist IDs are kept in guest storage
 * until profile has an ID; we still merge shift favorites immediately.
 */
export function migrateGuestArtifactsToUserProfile(): GuestMigrationResult {
  const artifacts = guestStorage.exportArtifacts();
  let shiftedFavorites = 0;
  let skillsMerged = 0;

  try {
    const existing = new Set(getFavoriteShiftIds());
    for (const postId of artifacts.shortlistShifts) {
      if (!existing.has(postId)) {
        toggleFavoriteShift(postId);
        shiftedFavorites += 1;
      }
    }
  } catch {
    /* fail-soft */
  }

  try {
    const shadow = artifacts.shadow;
    if (shadow.skills.length > 0) {
      // Persist skills back onto guest shadow after merge stamp — employee profile
      // skills field varies by schema; keep shadow until dedicated profile merge ships.
      guestStorage.saveShadowProfile({
        skills: shadow.skills,
        searchRadiusKm: shadow.searchRadiusKm,
        preferredCity: shadow.preferredCity,
      });
      skillsMerged = shadow.skills.length;
    }
  } catch {
    /* fail-soft */
  }

  // Keep guest keys for career shortlist / drafts until consumed by ResumeIntentExecutor.
  // Do not clearAll() here — intent resume may still need drafts.

  return {
    shiftedFavorites,
    careerShortlist: artifacts.shortlistCareers.length,
    skillsMerged,
  };
}
