/** Job Mitra API | Employee commute radius presets (km). */

export const COMMUTE_RADIUS_KM = [0, 5, 10, 15] as const;

export type CommuteRadiusKm = (typeof COMMUTE_RADIUS_KM)[number];

export const DEFAULT_COMMUTE_RADIUS_KM: CommuteRadiusKm = 10;

export function parseCommuteRadius(raw: unknown): CommuteRadiusKm {
  if (raw === 0 || raw === 5 || raw === 10 || raw === 15) return raw;
  if (raw === "0") return 0;
  if (raw === "5") return 5;
  if (raw === "10") return 10;
  if (raw === "15") return 15;
  return DEFAULT_COMMUTE_RADIUS_KM;
}
