/** Job Mitra | Employee commute radius presets (km). */

export const COMMUTE_RADIUS_KM = [0, 5, 10, 15] as const;

export type CommuteRadiusKm = (typeof COMMUTE_RADIUS_KM)[number];

export const DEFAULT_COMMUTE_RADIUS_KM: CommuteRadiusKm = 10;

export const COMMUTE_RADIUS_OPTIONS: readonly {
  readonly value: CommuteRadiusKm;
  readonly label: string;
}[] = [
  { value: 0, label: "This work area only" },
  { value: 5, label: "Within 5 km" },
  { value: 10, label: "Within 10 km" },
  { value: 15, label: "Within 15 km" },
];

export function parseCommuteRadius(raw: unknown): CommuteRadiusKm {
  if (raw === 0 || raw === 5 || raw === 10 || raw === 15) return raw;
  if (raw === "0") return 0;
  if (raw === "5") return 5;
  if (raw === "10") return 10;
  if (raw === "15") return 15;
  return DEFAULT_COMMUTE_RADIUS_KM;
}
