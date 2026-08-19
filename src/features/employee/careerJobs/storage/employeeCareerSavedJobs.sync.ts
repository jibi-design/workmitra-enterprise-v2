import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.bridge";
import { careerSavedJobsApi } from "../../../career/services/careerSavedJobsApi.client";
import { careerPostIdBridge } from "../../../career/utils/careerPostIdBridge";
import { isCareerServerUuid } from "../../../career/utils/careerAppIdBridge";
import { employeeCareerSavedJobsStorage } from "./employeeCareerSavedJobs.storage";

function resolvePostUuid(postId: string): string | null {
  const bridged = careerPostIdBridge.resolveServerPostId(postId) ?? postId.trim();
  return isCareerServerUuid(bridged) ? bridged : null;
}

export function queueCareerSavedJobSync(postId: string, saved: boolean): void {
  if (!isCareerApiSyncEnabled()) return;
  const uuid = resolvePostUuid(postId);
  if (!uuid) return;
  void (async () => {
    try {
      if (saved) await careerSavedJobsApi.save(uuid);
      else await careerSavedJobsApi.unsave(uuid);
    } catch {
      /* fail-soft: LS bookmark remains */
    }
  })();
}

let hydrateInFlight: Promise<void> | null = null;
let lastHydrateAt = 0;
const HYDRATE_COOLDOWN_MS = 5_000;

export async function hydrateCareerSavedJobsFromServer(): Promise<void> {
  if (!isCareerApiSyncEnabled()) return;
  const now = Date.now();
  if (hydrateInFlight) {
    await hydrateInFlight;
    return;
  }
  if (now - lastHydrateAt < HYDRATE_COOLDOWN_MS) return;

  hydrateInFlight = (async () => {
    try {
      const remote = await careerSavedJobsApi.listMine();
      const remoteRecords = remote.map((row) => ({
        postId: row.post_id,
        savedAt: Date.parse(row.saved_at) || Date.now(),
      }));
      const local = employeeCareerSavedJobsStorage.getAll();
      const byId = new Map(remoteRecords.map((r) => [r.postId, r]));
      for (const rec of local) {
        const uuid = resolvePostUuid(rec.postId);
        if (!uuid) {
          byId.set(rec.postId, rec);
          continue;
        }
        if (!byId.has(uuid)) {
          byId.set(uuid, { postId: uuid, savedAt: rec.savedAt });
          try {
            await careerSavedJobsApi.save(uuid);
          } catch {
            /* keep local */
          }
        }
      }
      employeeCareerSavedJobsStorage.replaceAll([...byId.values()]);
      lastHydrateAt = Date.now();
    } catch {
      /* LS fallback */
    } finally {
      hydrateInFlight = null;
    }
  })();

  await hydrateInFlight;
}
