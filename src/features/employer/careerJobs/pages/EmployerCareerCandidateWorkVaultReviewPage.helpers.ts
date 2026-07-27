import type { CareerApplication } from "../types/careerTypes";
import type { VaultSectionData } from "../../../shared/workVault/vaultPublic";

export const PAGE_STYLE = {
  minHeight: "100%",
  paddingBottom: 28,
} as const;

export const TAB_ROW_STYLE = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--wm-space-8)",
} as const;

export function buildCareerEmployerVaultData(
  application: CareerApplication,
  base: VaultSectionData,
): VaultSectionData {
  const profile = application.profileSnapshot;
  const fallbackSkills = cleanList(profile?.skills ?? []);

  return {
    ...base,
    identity: {
      ...base.identity,
      fullName:
        profile?.fullName?.trim() ||
        application.employeeName ||
        base.identity.fullName ||
        "Candidate",
      city: profile?.city?.trim() || base.identity.city || "Not specified",
      uniqueId: profile?.uniqueId?.trim() || application.employeeId || base.identity.uniqueId,
    },
    professionalSummary: {
      ...base.professionalSummary,
      headline:
        base.professionalSummary.headline ||
        application.resumeSummary ||
        profile?.experience ||
        "Career job candidate",
    },
    skills:
      base.skills.length > 0
        ? base.skills
        : fallbackSkills.map((name) => ({
            name,
            proficiency: "beginner",
            endorsedByCount: 0,
            endorsedByCompanies: [],
          })),
  };
}

function cleanList(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = value.trim();
    const key = cleaned.toLowerCase();

    if (!cleaned || seen.has(key)) continue;

    seen.add(key);
    result.push(cleaned);
  }

  return result;
}
