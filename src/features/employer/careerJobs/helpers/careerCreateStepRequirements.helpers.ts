// App name: Job Mitra
// File name: careerCreateStepRequirements.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerCreateStepRequirements.helpers.ts

export function toCareerCreateDateInputValue(epoch: number): string {
  try {
    const date = new Date(epoch);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

export function careerCreateDateInputToEpoch(dateValue: string): number {
  try {
    const date = new Date(dateValue);
    return Number.isFinite(date.getTime()) ? date.getTime() : Date.now();
  } catch {
    return Date.now();
  }
}

export function getTodayDateInputValue(): string {
  return toCareerCreateDateInputValue(Date.now());
}

export function normalizeCareerCreateTagInput(raw: string, maxItems: number): string[] {
  const items = raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.length > 80 ? item.slice(0, 80) : item));

  const seen = new Set<string>();
  const output: string[] = [];

  for (const item of items) {
    const key = item.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    output.push(item);

    if (output.length >= maxItems) break;
  }

  return output;
}
