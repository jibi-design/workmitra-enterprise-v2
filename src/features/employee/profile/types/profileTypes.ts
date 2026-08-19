// src/features/employee/profile/types/profileTypes.ts

import type { EmployeeProfile } from "../storage/employeeProfile.storage";

export type ChecklistId =
  | "fullName"
  | "city"
  | "basePincode"
  | "skills"
  | "experience"
  | "languages"
  | "jobTypes"
  | "availability"
  | "phoneVerified"
  | "emailVerified";

export type ChecklistItem = { id: ChecklistId; label: string };
export type ChecklistRow = ChecklistItem & { done: boolean };

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "fullName", label: "Add full name" },
  { id: "city", label: "Add city" },
  { id: "basePincode", label: "Add work area code" },
  { id: "skills", label: "Add skills" },
  { id: "experience", label: "Set experience" },
  { id: "languages", label: "Add languages" },
  { id: "jobTypes", label: "Select job types" },
  { id: "availability", label: "Set availability" },
  { id: "phoneVerified", label: "Verify phone" },
  { id: "emailVerified", label: "Verify email" },
];

export type ProfileSectionProps = {
  draft: EmployeeProfile;
  disabled: boolean;
  onUpdate: <K extends keyof EmployeeProfile>(key: K, value: EmployeeProfile[K]) => void;
};