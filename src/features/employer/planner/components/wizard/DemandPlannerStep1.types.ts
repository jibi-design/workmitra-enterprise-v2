// Job Mitra | DemandPlannerStep1.types.ts

import type { ExperienceLabel } from "../../storage/demandPlannerStorage";
import type { WorkingDay } from "../../storage/demandPlannerStorage";

export type Step1Data = {
  name: string;
  companyName: string;
  locationName: string;
  locationPincode: string;
  category: string;
  experience: ExperienceLabel;
  startDate: string;
  endDate: string;
  workingDays: WorkingDay[];
  description: string;
  defaultWorkers: number;
  waitingBuffer: number;
  shiftTiming: string;
  mapsLink: string;
};

export const DEFAULT_STEP1_DATA: Omit<
  Step1Data,
  "companyName" | "locationName" | "locationPincode" | "category"
> & {
  companyName: string;
  locationName: string;
  locationPincode: string;
  category: string;
} = {
  name: "",
  companyName: "",
  locationName: "",
  locationPincode: "",
  category: "Construction",
  experience: "helper",
  startDate: "",
  endDate: "",
  workingDays: [1, 2, 3, 4, 5],
  description: "",
  defaultWorkers: 2,
  waitingBuffer: 2,
  shiftTiming: "",
  mapsLink: "",
};
