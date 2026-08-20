/** Employer OS dashboard — Shift / Career / Planner are separate lanes. */

export type EmployerOsDomain = "shift" | "career" | "planner";

export const EMPLOYER_OS_DOMAINS = ["shift", "career", "planner"] as const;

export const EMPLOYER_OS_DEFAULT_STAGE: Record<EmployerOsDomain, string> = {
  shift: "Applied",
  career: "Applied",
  planner: "Pending",
};

export type EmployerOsDomainSnapshot = {
  readonly domain: EmployerOsDomain;
  readonly title: string;
  readonly openLabel: string;
  readonly openCount: number;
  readonly pendingLabel: string;
  readonly pendingCount: number;
  readonly confirmedLabel: string;
  readonly confirmedCount: number;
  readonly extraLabel?: string;
  readonly extraCount?: number;
};

export type EmployerOsStageDef = {
  readonly key: string;
  readonly label: string;
};

export type EmployerOsTrackerRow = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly stage: string;
  readonly updatedAt: number;
  readonly href: string;
};

export type EmployerOsOpenRow = {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
  readonly href: string;
  readonly badge: string;
};

export function countOsStages(
  rows: readonly EmployerOsTrackerRow[],
  stages: readonly EmployerOsStageDef[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const stage of stages) counts[stage.key] = 0;
  for (const row of rows) {
    if (row.stage in counts) counts[row.stage] += 1;
  }
  return counts;
}

export function filterOsRows(
  rows: readonly EmployerOsTrackerRow[],
  stage: string,
  limit = 40,
): EmployerOsTrackerRow[] {
  return rows
    .filter((row) => (stage === "all" ? true : row.stage === stage))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}
