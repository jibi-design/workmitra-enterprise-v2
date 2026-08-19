/** Employee profile storage — PII sealed at rest. */

import { generateAndRegisterId } from "../../../../shared/identity/registry/idRegistry";
import {
  DEFAULT_COMMUTE_RADIUS_KM,
  parseCommuteRadius,
  type CommuteRadiusKm,
} from "../../../shared/location/commuteRadius";
import {
  DEFAULT_CAREER_COMMUTE_RADIUS_KM,
  parseCareerCommuteRadius,
  type CareerCommuteRadiusKm,
} from "../../../shared/location/careerCommuteRadius";
import { parsePincode } from "../../../shared/location/pincode";
import { piiSecureStorage } from "../../../../shared/security/piiSecureStorage";

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
  /** Work area code used for nearby matching. Empty = excluded. */
  basePincode: string;
  commuteRadius: CommuteRadiusKm;
  careerCommuteRadius: CareerCommuteRadiusKm;
  photoDataUrl?: string;
  skills: string[];
  experience: ExperienceLevel;
  languages: string[];
  preferShiftJobs: boolean;
  preferCareerJobs: boolean;
  availability: Availability;
  phoneMasked?: string;
  emailMasked?: string;
  /** One-time contact verification — when true, hide OTP in Shift Ops / profile. */
  phoneVerified?: boolean;
  emailVerified?: boolean;
  createdAt?: number;
};

const KEY = "wm_employee_profile_v1";
const CHANGED = "wm:employee-profile-changed";

const DEFAULT_PROFILE: EmployeeProfile = {
  fullName: "",
  city: "",
  basePincode: "",
  commuteRadius: DEFAULT_COMMUTE_RADIUS_KM,
  careerCommuteRadius: DEFAULT_CAREER_COMMUTE_RADIUS_KM,
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
      basePincode: parsePincode(parsed.basePincode) ?? "",
      commuteRadius: parseCommuteRadius(parsed.commuteRadius),
      careerCommuteRadius: parseCareerCommuteRadius(parsed.careerCommuteRadius),
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function write(profile: EmployeeProfile): void {
  piiSecureStorage.setJson(KEY, profile);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGED));
  }
}

/** Read sealed profile without generating uniqueId (avoids nested writes). */
function readRaw(): EmployeeProfile {
  return safeParse(piiSecureStorage.getItem(KEY));
}

export const employeeProfileStorage = {
  get(): EmployeeProfile {
    const profile = readRaw();

    if (!profile.uniqueId?.trim() && profile.fullName.trim()) {
      const result = generateAndRegisterId(profile.fullName, "employee");
      if (result.success) {
        const next = {
          ...profile,
          uniqueId: result.id,
          createdAt: profile.createdAt ?? Date.now(),
        };
        write(next);
        return next;
      }
    }

    return profile;
  },

  /** Single sealed write; does not call get() (P1-2 — no uniqueId double-write). */
  set(profile: EmployeeProfile): EmployeeProfile {
    const existing = readRaw();
    let uniqueId = profile.uniqueId?.trim() || existing.uniqueId?.trim() || undefined;

    if (!uniqueId && profile.fullName.trim()) {
      const result = generateAndRegisterId(profile.fullName, "employee");
      if (result.success) uniqueId = result.id;
    }

    const next: EmployeeProfile = {
      ...profile,
      uniqueId,
      createdAt: existing.createdAt ?? profile.createdAt ?? Date.now(),
    };
    write(next);
    return next;
  },

  clear(): void {
    piiSecureStorage.removeItem(KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(CHANGED));
    }
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(CHANGED, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGED, handler);
      window.removeEventListener("storage", handler);
    };
  },

  CHANGED_EVENT: CHANGED,
};
