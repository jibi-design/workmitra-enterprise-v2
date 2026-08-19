/** Dual-write + hydrate Demand Plans when AUTH_BACKEND_ENABLED. */

import { plannerPublicIndex } from "../storage/plannerPublicIndex.storage";
import { demandPlannerStorage, type DemandPlan } from "../storage/demandPlannerStorage";
import { isPlannerServerUuid, plannerPlanIdBridge } from "../utils/plannerPlanIdBridge";
import { isPlannerApiSyncEnabled, plannerGateApi } from "./plannerGateApi.client";
import type { ServerPlannerPlanDto } from "./plannerGateApi.types";
import {
  buildPlannerPlanMutationBody,
  demandPlanFromServerDto,
  readClientPlanId,
} from "./plannerDbTruth.mappers";

const HYDRATE_COOLDOWN_MS = 5_000;
const UPSERT_DEBOUNCE_MS = 400;

let hydrateInFlight: Promise<DemandPlan[]> | null = null;
let lastHydrateAt = 0;
const upsertTimers = new Map<string, ReturnType<typeof setTimeout>>();

function parseIsoMs(value: string, fallback: number): number {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : fallback;
}

function mergeServerPlanIntoLsCache(dto: ServerPlannerPlanDto): DemandPlan | null {
  const stub = demandPlanFromServerDto(dto);
  if (!stub) return null;

  const plans = demandPlannerStorage.getAll();
  const clientId = readClientPlanId(dto);
  const bridgedLocal = plannerPlanIdBridge.load().serverToLocal[dto.id];
  const existing =
    plans.find((p) => p.id === dto.id) ??
    (clientId ? plans.find((p) => p.id === clientId) : undefined) ??
    (bridgedLocal ? plans.find((p) => p.id === bridgedLocal) : undefined);

  const localId = existing?.id ?? stub.id;
  plannerPlanIdBridge.upsert(localId, dto.id);

  const serverUpdated = parseIsoMs(dto.updated_at, 0);
  if (existing && existing.updatedAt > serverUpdated + 2_000) {
    return existing;
  }

  const merged: DemandPlan = {
    ...stub,
    id: localId,
  };

  const next = existing
    ? plans.map((p) => (p.id === existing.id ? merged : p))
    : [merged, ...plans];
  demandPlannerStorage.replaceAll(next);

  if (merged.status === "active") {
    plannerPublicIndex.publishFromPlan(merged);
  }

  return merged;
}

async function flushPlanUpsert(planId: string): Promise<void> {
  if (!isPlannerApiSyncEnabled()) return;
  const plan = demandPlannerStorage.getById(planId);
  if (!plan) return;

  const body = buildPlannerPlanMutationBody(plan);
  const serverId = plannerPlanIdBridge.resolveServerPlanId(plan.id);

  try {
    const dto = serverId
      ? await plannerGateApi.updatePlan(serverId, body)
      : await plannerGateApi.createPlan(body);
    plannerPlanIdBridge.upsert(plan.id, dto.id);
  } catch {
    /* fail-soft: LS remains SoT for planner e2e / offline */
  }
}

async function flushPlanCancel(planId: string): Promise<void> {
  if (!isPlannerApiSyncEnabled()) return;
  const serverId = plannerPlanIdBridge.resolveServerPlanId(planId);
  if (!serverId) return;
  try {
    await plannerGateApi.updatePlan(serverId, {
      status: "cancelled",
      details: { clientPlanId: planId, clientStatus: "cancelled" },
    });
  } catch {
    /* fail-soft */
  }
}

export function syncDemandPlanToServer(planId: string, op: "upsert" | "delete" = "upsert"): void {
  if (!isPlannerApiSyncEnabled() || !planId.trim()) return;
  const id = planId.trim();
  const prev = upsertTimers.get(id);
  if (prev) clearTimeout(prev);

  if (op === "delete") {
    void flushPlanCancel(id);
    return;
  }

  upsertTimers.set(
    id,
    setTimeout(() => {
      upsertTimers.delete(id);
      void flushPlanUpsert(id);
    }, UPSERT_DEBOUNCE_MS),
  );
}

export async function hydratePlannerPlansFromServer(): Promise<DemandPlan[]> {
  if (!isPlannerApiSyncEnabled()) {
    return demandPlannerStorage.getAll();
  }

  const now = Date.now();
  if (hydrateInFlight) return hydrateInFlight;
  if (now - lastHydrateAt < HYDRATE_COOLDOWN_MS) {
    return demandPlannerStorage.getAll();
  }

  hydrateInFlight = (async () => {
    try {
      const rows = await plannerGateApi.listMyPlans();
      for (const dto of rows) {
        mergeServerPlanIntoLsCache(dto);
      }
      lastHydrateAt = Date.now();
    } catch {
      /* LS cache fallback */
    } finally {
      hydrateInFlight = null;
    }
    return demandPlannerStorage.getAll();
  })();

  return hydrateInFlight;
}

export function isPlannerPlanServerBacked(planId: string): boolean {
  return isPlannerServerUuid(planId) || Boolean(plannerPlanIdBridge.resolveServerPlanId(planId));
}
