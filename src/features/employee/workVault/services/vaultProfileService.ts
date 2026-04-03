// src/features/employee/workVault/services/vaultProfileService.ts
//
// CRUD for manually-entered Work Vault v2 fields:
// Professional Summary (Section 2), Education (Section 5), Skill Proficiencies (Section 6).
// Storage key: wm_employee_vault_profile_v2

import type {
  VaultManualProfile,
  VaultProfessionalSummary,
  VaultEducation,
  VaultCertification,
  SkillProficiency,
} from "../types/vaultProfileTypes";

// ─────────────────────────────────────────────────────────────────────────────
// Storage Key
// ─────────────────────────────────────────────────────────────────────────────

const VAULT_PROFILE_KEY = "wm_employee_vault_profile_v2";

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SUMMARY: VaultProfessionalSummary = {
  headline: "",
  employmentStatus: "available",
  employmentStatusAuto: true,
  currentCompany: "",
  expectedRoleType: "full-time",
  noticePeriod: "immediate",
};

const DEFAULT_EDUCATION: VaultEducation = {
  level: "none",
  certifications: [],
};

const DEFAULT_PROFILE: VaultManualProfile = {
  professionalSummary: DEFAULT_SUMMARY,
  education: DEFAULT_EDUCATION,
  skillProficiencies: {},
};

// ─────────────────────────────────────────────────────────────────────────────
// Safe Read / Write
// ─────────────────────────────────────────────────────────────────────────────

function read(): VaultManualProfile {
  try {
    const raw = localStorage.getItem(VAULT_PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw) as Partial<VaultManualProfile>;

    return {
      professionalSummary: {
        ...DEFAULT_SUMMARY,
        ...(parsed.professionalSummary ?? {}),
      },
      education: {
        ...DEFAULT_EDUCATION,
        ...(parsed.education ?? {}),
        certifications: Array.isArray(parsed.education?.certifications)
          ? parsed.education.certifications.filter(
              (c): c is VaultCertification =>
                typeof c === "object" && c !== null && typeof c.id === "string"
            )
          : [],
      },
      skillProficiencies:
        typeof parsed.skillProficiencies === "object" &&
        parsed.skillProficiencies !== null
          ? (parsed.skillProficiencies as Record<string, SkillProficiency>)
          : {},
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function write(profile: VaultManualProfile): void {
  try {
    localStorage.setItem(VAULT_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // demo-safe ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const vaultProfileService = {
  /** Get full manual profile. */
  get(): VaultManualProfile {
    return read();
  },

  // ── Section 2: Professional Summary ──

  getSummary(): VaultProfessionalSummary {
    return read().professionalSummary;
  },

  updateSummary(updates: Partial<VaultProfessionalSummary>): void {
    const profile = read();
    profile.professionalSummary = { ...profile.professionalSummary, ...updates };
    write(profile);
  },

  // ── Section 5: Education ──

  getEducation(): VaultEducation {
    return read().education;
  },

  updateEducationLevel(level: VaultEducation["level"]): void {
    const profile = read();
    profile.education.level = level;
    write(profile);
  },

  addCertification(cert: VaultCertification): void {
    const profile = read();
    profile.education.certifications.push(cert);
    write(profile);
  },

  removeCertification(certId: string): void {
    const profile = read();
    profile.education.certifications = profile.education.certifications.filter(
      (c) => c.id !== certId
    );
    write(profile);
  },

  updateCertification(certId: string, updates: Partial<VaultCertification>): void {
    const profile = read();
    profile.education.certifications = profile.education.certifications.map((c) =>
      c.id === certId ? { ...c, ...updates } : c
    );
    write(profile);
  },

  // ── Section 6: Skill Proficiencies ──

  getSkillProficiencies(): Record<string, SkillProficiency> {
    return read().skillProficiencies;
  },

  setSkillProficiency(skillName: string, level: SkillProficiency): void {
    const profile = read();
    profile.skillProficiencies[skillName.toLowerCase().trim()] = level;
    write(profile);
  },

  removeSkillProficiency(skillName: string): void {
    const profile = read();
    delete profile.skillProficiencies[skillName.toLowerCase().trim()];
    write(profile);
  },

  /** Reset all manual profile data. */
  clear(): void {
    try {
      localStorage.removeItem(VAULT_PROFILE_KEY);
    } catch {
      // ignore
    }
  },
} as const;