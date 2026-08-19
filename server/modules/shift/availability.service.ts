/** Job Mitra API | Availability dual-store (DB when AUTH_USER_SOURCE=db). */

import { isDbAuthEnabled } from "../auth/env.js";
import type { AuthUser } from "../auth/types.js";
import { parseCommuteRadius } from "../location/commuteRadius.js";
import { parsePincode } from "../location/pincode.js";
import { computeExpiresAt, sanitizeSelectedDates } from "./availability.dates.js";
import { availabilityRepository } from "./availability.repository.js";
import { availabilityMemoryStore } from "./availability.store.js";
import { countWorkersCoveringJobSite, countWorkersCoveringJobSiteByDates } from "./availability.match.js";
import type {
  AvailabilityBroadcastRecord,
  AvailabilityMineDto,
  AvailabilityPublicItem,
} from "./availability.types.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function canUseDb(userId: string): boolean {
  return isDbAuthEnabled() && UUID_RE.test(userId.trim());
}

function resolveIds(
  user: AuthUser | null,
  fallbackMlId: string | undefined,
): { workerUserId: string; workerMlId: string } {
  if (user?.id.trim()) {
    const id = user.id.trim();
    return { workerUserId: id, workerMlId: id };
  }
  const ml = fallbackMlId?.trim() || "demo-worker";
  return { workerUserId: ml, workerMlId: ml };
}

function toMineDto(row: AvailabilityBroadcastRecord): AvailabilityMineDto {
  return {
    workerMlId: row.workerMlId,
    selectedDates: row.selectedDates,
    city: row.city,
    basePincode: row.basePincode,
    commuteRadius: row.commuteRadiusKm,
    updatedAt: row.updatedAt,
  };
}

function emptyMine(workerMlId: string): AvailabilityMineDto {
  return {
    workerMlId,
    selectedDates: [],
    basePincode: null,
    commuteRadius: 10,
    updatedAt: Date.now(),
  };
}

async function readBroadcast(workerUserId: string): Promise<AvailabilityBroadcastRecord | null> {
  const mem = availabilityMemoryStore.getBroadcast(workerUserId);
  if (mem) return mem;
  if (!canUseDb(workerUserId)) return null;
  try {
    return await availabilityRepository.getBroadcast(workerUserId);
  } catch {
    return null;
  }
}

export const availabilityService = {
  async getMine(user: AuthUser | null, queryMlId?: string): Promise<AvailabilityMineDto> {
    const ids = resolveIds(user, queryMlId);
    const row = await readBroadcast(ids.workerUserId);
    if (row) return toMineDto(row);

    const loc = availabilityMemoryStore.getLocation(ids.workerUserId);
    if (loc) {
      return {
        ...emptyMine(ids.workerMlId),
        basePincode: loc.basePincode,
        commuteRadius: loc.commuteRadiusKm,
        updatedAt: loc.updatedAt,
      };
    }
    if (canUseDb(ids.workerUserId)) {
      try {
        const dbLoc = await availabilityRepository.getLocation(ids.workerUserId);
        if (dbLoc) {
          return {
            ...emptyMine(ids.workerMlId),
            basePincode: dbLoc.basePincode,
            commuteRadius: dbLoc.commuteRadiusKm,
          };
        }
      } catch {
        /* empty mine */
      }
    }
    return emptyMine(ids.workerMlId);
  },

  async upsert(
    user: AuthUser | null,
    body: Record<string, unknown>,
  ): Promise<AvailabilityMineDto> {
    const ids = resolveIds(
      user,
      typeof body.workerMlId === "string" ? body.workerMlId : undefined,
    );
    const existing = await readBroadcast(ids.workerUserId);
    const existingLoc = availabilityMemoryStore.getLocation(ids.workerUserId);
    const selectedDates = sanitizeSelectedDates(body.selectedDates);
    const pinProvided = Object.prototype.hasOwnProperty.call(body, "basePincode");
    const radiusProvided = Object.prototype.hasOwnProperty.call(body, "commuteRadius");
    const basePincode = pinProvided
      ? parsePincode(typeof body.basePincode === "string" ? body.basePincode : null)
      : (existing?.basePincode ?? existingLoc?.basePincode ?? null);
    const commuteRadiusKm = radiusProvided
      ? parseCommuteRadius(body.commuteRadius)
      : (existing?.commuteRadiusKm ?? existingLoc?.commuteRadiusKm ?? parseCommuteRadius(undefined));
    const city = typeof body.city === "string" ? body.city.trim().slice(0, 80) : undefined;

    availabilityMemoryStore.putLocation(ids.workerUserId, basePincode, commuteRadiusKm);

    if (selectedDates.length === 0) {
      availabilityMemoryStore.deleteBroadcast(ids.workerUserId);
      if (canUseDb(ids.workerUserId)) {
        try {
          await availabilityRepository.deleteBroadcast(ids.workerUserId);
          await availabilityRepository.upsertLocation(
            ids.workerUserId,
            basePincode,
            commuteRadiusKm,
          );
        } catch {
          /* keep memory */
        }
      }
      return {
        ...emptyMine(ids.workerMlId),
        city,
        basePincode,
        commuteRadius: commuteRadiusKm,
      };
    }

    const row: AvailabilityBroadcastRecord = {
      workerUserId: ids.workerUserId,
      workerMlId: ids.workerMlId,
      selectedDates,
      basePincode,
      commuteRadiusKm,
      city: city || undefined,
      expiresAt: computeExpiresAt(selectedDates),
      updatedAt: Date.now(),
    };
    availabilityMemoryStore.putBroadcast(row);

    if (canUseDb(ids.workerUserId)) {
      try {
        await availabilityRepository.upsertBroadcast(row);
        await availabilityRepository.upsertLocation(
          ids.workerUserId,
          basePincode,
          commuteRadiusKm,
        );
      } catch {
        /* keep memory */
      }
    }
    return toMineDto(row);
  },

  async listBroadcasts(): Promise<AvailabilityBroadcastRecord[]> {
    if (isDbAuthEnabled()) {
      try {
        const rows = await availabilityRepository.listBroadcasts();
        if (rows.length > 0) return rows;
      } catch {
        /* memory fallback */
      }
    }
    return availabilityMemoryStore.listBroadcasts();
  },

  async countWorkersRadar(
    jobPincode: string | null | undefined,
    isoDate?: string | null,
  ): Promise<{ count: number }> {
    if (!parsePincode(jobPincode)) return { count: 0 };
    const broadcasts = await this.listBroadcasts();
    return {
      count: countWorkersCoveringJobSite({ broadcasts, jobPincode, isoDate }),
    };
  },

  async countWorkersRadarByDates(
    jobPincode: string | null | undefined,
    isoDates: readonly string[],
  ): Promise<{ counts: Record<string, number> }> {
    const broadcasts = await this.listBroadcasts();
    return {
      counts: countWorkersCoveringJobSiteByDates({ broadcasts, jobPincode, isoDates }),
    };
  },

  async publicPool(): Promise<{ items: AvailabilityPublicItem[]; generatedAt: number }> {
    const rows = await this.listBroadcasts();
    const items = rows.map((row) => ({
      workerMlId: row.workerMlId,
      freeDayCount: row.selectedDates.length,
      cityHash: row.city ? `h_${row.city.length}` : undefined,
    }));
    return { items, generatedAt: Date.now() };
  },
};
