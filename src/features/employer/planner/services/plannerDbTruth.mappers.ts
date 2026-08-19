/** Map DemandPlan ↔ planner_plans row (details JSON holds full client snapshot). */

import { migrateDemandPlanToV2 } from "../storage/demandPlanner.migrate";
import type { DemandPlan, DemandPlanStatus } from "../storage/demandPlanner.schema";
import type { ServerPlannerPlanDto } from "./plannerGateApi.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toServerPlannerStatus(status: DemandPlanStatus): "draft" | "active" | "cancelled" {
  if (status === "draft") return "draft";
  if (status === "active") return "active";
  return "cancelled";
}

export function clientStatusFromServer(
  dto: ServerPlannerPlanDto,
  snapshot: DemandPlan | null,
): DemandPlanStatus {
  const fromDetails = dto.details.clientStatus;
  if (
    fromDetails === "draft" ||
    fromDetails === "active" ||
    fromDetails === "completed" ||
    fromDetails === "cancelled"
  ) {
    return fromDetails;
  }
  if (snapshot?.status) return snapshot.status;
  if (dto.status === "active") return "active";
  if (dto.status === "cancelled") return "cancelled";
  return "draft";
}

export function buildPlannerPlanMutationBody(plan: DemandPlan): Record<string, unknown> {
  return {
    name: plan.name.trim() || "Untitled plan",
    status: toServerPlannerStatus(plan.status),
    locationPincode: plan.locationPincode ?? "",
    details: {
      clientPlanId: plan.id,
      clientStatus: plan.status,
      demandPlan: plan,
    },
  };
}

export function demandPlanFromServerDto(dto: ServerPlannerPlanDto): DemandPlan | null {
  const rawSnapshot = dto.details.demandPlan;
  const snapshot = migrateDemandPlanToV2(rawSnapshot);
  const status = clientStatusFromServer(dto, snapshot);
  if (snapshot) {
    return { ...snapshot, status };
  }

  const fallbackId =
    typeof dto.details.clientPlanId === "string" && dto.details.clientPlanId.trim()
      ? dto.details.clientPlanId.trim()
      : dto.id;

  return migrateDemandPlanToV2({
    id: fallbackId,
    name: dto.name || "Plan",
    companyName: "",
    locationName: "",
    locationPincode:
      typeof dto.details.locationPincode === "string" ? dto.details.locationPincode : "",
    category: "",
    experience: "experienced",
    startDate: "",
    endDate: "",
    workingDays: [],
    slots: [],
    status,
    createdAt: Date.parse(dto.created_at) || Date.now(),
    updatedAt: Date.parse(dto.updated_at) || Date.now(),
    schemaVersion: 2,
    legalEntityMlId: "",
    epochDays: 30,
    milestoneCursor: 0,
  });
}

export function readClientPlanId(dto: ServerPlannerPlanDto): string | null {
  const fromDetails = dto.details.clientPlanId;
  if (typeof fromDetails === "string" && fromDetails.trim()) return fromDetails.trim();
  if (!isRecord(dto.details.demandPlan)) return null;
  const id = dto.details.demandPlan.id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}
