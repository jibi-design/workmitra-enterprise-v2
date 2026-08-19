/** Job Mitra | Career commute radius (km). Shift stays 0|5|10|15. */

export const CAREER_COMMUTE_ANYWHERE = -1;

export const CAREER_COMMUTE_RADIUS_KM = [10, 25, 50, CAREER_COMMUTE_ANYWHERE] as const;

export type CareerCommuteRadiusKm = (typeof CAREER_COMMUTE_RADIUS_KM)[number];

export const DEFAULT_CAREER_COMMUTE_RADIUS_KM: CareerCommuteRadiusKm = 10;

export const CAREER_COMMUTE_RADIUS_OPTIONS: readonly {
  readonly value: CareerCommuteRadiusKm;
  readonly label: string;
}[] = [
  { value: 10, label: "Within 10 km" },
  { value: 25, label: "Within 25 km" },
  { value: 50, label: "Within 50 km" },
  { value: CAREER_COMMUTE_ANYWHERE, label: "Anywhere" },
];

export function parseCareerCommuteRadius(raw: unknown): CareerCommuteRadiusKm {
  if (raw === 10 || raw === 25 || raw === 50 || raw === CAREER_COMMUTE_ANYWHERE) return raw;
  if (raw === "10") return 10;
  if (raw === "25") return 25;
  if (raw === "50") return 50;
  if (raw === "-1" || raw === "anywhere" || raw === "ANYWHERE") return CAREER_COMMUTE_ANYWHERE;
  return DEFAULT_CAREER_COMMUTE_RADIUS_KM;
}

export function careerRadiusToKm(radius: CareerCommuteRadiusKm): number {
  if (radius === CAREER_COMMUTE_ANYWHERE) return Number.POSITIVE_INFINITY;
  return radius;
}
