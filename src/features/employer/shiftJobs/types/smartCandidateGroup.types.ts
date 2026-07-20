// App name: Job Mitra
// File name: smartCandidateGroup.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\types\smartCandidateGroup.types.ts

import type { DashboardTab } from "../helpers/shiftDashboardHelpers";
import type {
  EmployeeShiftApplication,
  PriorityTag,
} from "../../shiftJobs/storage/employerShift.storage";

export type SmartCandidateGroupProps = {
  apps: EmployeeShiftApplication[];
  tab: DashboardTab;
  isBusy: boolean;
  quickQuestions?: { id: string; text: string }[];
  onMoveToShortlist: (id: string) => void;
  onMoveToWaiting: (id: string) => void;
  onConfirm: (id: string) => void;
  onOpenGroup: (id: string) => void;
  onRemove: (id: string) => void;
  onReplace: (id: string) => void;
  onPriorityTag: (id: string, tag: PriorityTag | undefined) => void;
  priorityTags: Record<string, PriorityTag | undefined>;
};

export type SmartCandidateCardProps = Omit<SmartCandidateGroupProps, "apps">;
