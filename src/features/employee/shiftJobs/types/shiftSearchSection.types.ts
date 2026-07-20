// App name: Job Mitra
// File name: shiftSearchSection.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\types\shiftSearchSection.types.ts

export type ShiftCardData = {
  id: string;
  jobName: string;
  companyName: string;
  payPerDay: number;
  locationName: string;
  distanceKm: number;
  category: string;
  dateLabel: string;
  timingLabel: string;
  durationLabel: string;
  workerTypeLabel: string;
  isApplied?: boolean;
};
