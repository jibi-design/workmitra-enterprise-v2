// src/features/employee/profile/storage/employeeProfile.storage.ts

import { generateAndRegisterId } from "../../../../shared/identity/registry/idRegistry";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type ExperienceLevel = "fresher" | "1-3" | "3-7" | "7+";

export type Availability = {
  weekdays: boolean;
  weekends: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
};

export type EmployeeProfile = {
  uniqueId?: string;
  fullName: string;
  city: string;

  photoDataUrl?: string;

  skills: string[];
  experience: ExperienceLevel;
  languages: string[];

  preferShiftJobs: boolean;
  preferCareerJobs: boolean;

  availability: Availability;

 phoneMasked?: string;
  emailMasked?: string;
  createdAt?: number;
};

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const KEY = "wm_employee_profile_v1";

const DEFAULT_PROFILE: EmployeeProfile = {
  fullName: "",
  city: "",
  skills: [],
  experience: "fresher",
  languages: [],
  preferShiftJobs: true,
  preferCareerJobs: true,
  availability: {
    weekdays: true,
    weekends: false,
    morning: true,
    afternoon: true,
    evening: false,
  },
  phoneMasked: "•••• ••••",
  emailMasked: "••••@••••",
};

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function safeParse(raw: string | null): EmployeeProfile {
  if (!raw) return { ...DEFAULT_PROFILE };
  try {
    const parsed = JSON.parse(raw) as Partial<EmployeeProfile>;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      skills: Array.isArray(parsed.skills)
        ? parsed.skills.filter((s) => typeof s === "string")
        : DEFAULT_PROFILE.skills,
      languages: Array.isArray(parsed.languages)
        ? parsed.languages.filter((s) => typeof s === "string")
        : DEFAULT_PROFILE.languages,
      availability: {
        ...DEFAULT_PROFILE.availability,
        ...(parsed.availability ?? {}),
      },
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function write(profile: EmployeeProfile): void {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const employeeProfileStorage = {
  get(): EmployeeProfile {
    return safeParse(localStorage.getItem(KEY));
  },

  set(profile: EmployeeProfile): void {
    const existing = this.get();

    let uniqueId = existing.uniqueId;

    if (!uniqueId && profile.fullName.trim()) {
      const result = generateAndRegisterId(profile.fullName, "employee");
      if (result.success) {
        uniqueId = result.id;
      }
    }

    const createdAt = existing.createdAt ?? Date.now();

    write({ ...profile, uniqueId, createdAt });
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};