import { describe, expect, it } from "vitest";
import {
  buildPlannerPlanMutationBody,
  clientStatusFromServer,
  toServerPlannerStatus,
} from "../plannerDbTruth.mappers";
import type { DemandPlan } from "../../storage/demandPlanner.schema";
import type { ServerPlannerPlanDto } from "../plannerGateApi.types";

function samplePlan(status: DemandPlan["status"]): DemandPlan {
  return {
    id: "dp_local_1",
    name: "Crew A",
    companyName: "Co",
    locationName: "Site",
    category: "Security",
    experience: "experienced",
    startDate: "2026-10-01",
    endDate: "2026-10-02",
    workingDays: [4, 5],
    slots: [{ date: "2026-10-01", workers: 2, payPerDay: 900, slotId: "sl_1" }],
    status,
    createdAt: 1,
    updatedAt: 2,
    schemaVersion: 2,
    legalEntityMlId: "",
    epochDays: 30,
    milestoneCursor: 0,
  };
}

describe("plannerDbTruth.mappers", () => {
  it("maps completed client status to cancelled server column", () => {
    expect(toServerPlannerStatus("completed")).toBe("cancelled");
    expect(toServerPlannerStatus("active")).toBe("active");
  });

  it("puts full DemandPlan snapshot in details for dual-write", () => {
    const body = buildPlannerPlanMutationBody(samplePlan("draft"));
    expect(body.name).toBe("Crew A");
    expect(body.status).toBe("draft");
    const details = body.details as Record<string, unknown>;
    expect(details.clientPlanId).toBe("dp_local_1");
    expect(details.clientStatus).toBe("draft");
    expect(details.demandPlan).toMatchObject({ id: "dp_local_1", name: "Crew A" });
  });

  it("prefers details.clientStatus over server column", () => {
    const dto: ServerPlannerPlanDto = {
      id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      employer_user_id: "u1",
      name: "Crew A",
      status: "cancelled",
      details: { clientStatus: "completed" },
      created_at: "",
      updated_at: "",
    };
    expect(clientStatusFromServer(dto, null)).toBe("completed");
  });
});
