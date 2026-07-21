// Job Mitra | useEmployerDemandPlannerState.helpers.ts

import type { Step1Data } from "../components/wizard/DemandPlannerStep1.types";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";

export function buildStep1FromDraft(
  draft: NonNullable<ReturnType<typeof demandPlannerStorage.getById>>,
): Step1Data {
  return {
    name: draft.name,
    companyName: draft.companyName,
    locationName: draft.locationName,
    category: draft.category,
    experience: draft.experience,
    startDate: draft.startDate,
    endDate: draft.endDate,
    workingDays: draft.workingDays,
    description: draft.description ?? "",
    defaultWorkers: draft.slots[0]?.workers || 2,
    waitingBuffer: 2,
    shiftTiming: "",
    mapsLink: "",
  };
}
