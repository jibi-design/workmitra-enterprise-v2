/**
 * Master Testing Roadmap — programmatic harness index
 *
 * Phase 1 PASS → Case 1 availability sync
 *   npm test -- src/tests/phase1.availabilitySync.case1.test.ts
 *
 * Phase 2 → Step 3 favorites + Step 4 direct invite
 *   npm test -- src/tests/phase2.favoritesDirectInvite.test.ts
 *
 * Both:
 *   npm test -- src/tests/phase1.availabilitySync.case1.test.ts src/tests/phase2.favoritesDirectInvite.test.ts
 */

export const MASTER_QA_PHASES = {
  phase1: {
    id: "CASE_1_AVAILABILITY_SYNC",
    status: "PASS",
    harness: "src/tests/phase1.availabilitySync.case1.test.ts",
    surfaces: [
      "ShiftAvailabilityBroadcastCard / availabilityStorage",
      "LocalWorkersRadarCard",
      "FavoriteWorkerAvailabilityBadge",
      "ShiftCreateNearbyAvailabilityCard",
      "wm:availability-broadcasts-changed",
    ],
  },
  phase2: {
    id: "STEP_3_4_FAVORITES_DIRECT_INVITE",
    status: "HARNESS_READY",
    harness: "src/tests/phase2.favoritesDirectInvite.test.ts",
    surfaces: [
      "favoritesStorage add/remove + radar favoriteAvailableCount",
      "sendShiftDirectInvite",
      "shiftDirectInviteStorage pending/decline/expire",
      "acceptShiftDirectInvite (local AUTH-off + membership truth)",
    ],
  },
} as const;
