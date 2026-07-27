import { employmentLifecycleStorage } from "../../employment/storage/employmentLifecycle.storage";

export type EmploymentSnapshot = {
  id: string;
  jobTitle: string;
  companyName: string;
  joinedAt: number;
};

let employmentClockSnapshot = Date.now();

export function subscribeEmploymentClock(onStoreChange: () => void) {
  const id = window.setInterval(() => {
    employmentClockSnapshot = Date.now();
    onStoreChange();
  }, 60_000);
  return () => window.clearInterval(id);
}

export function getEmploymentClockSnapshot() {
  return employmentClockSnapshot;
}

export function readEmploymentSnapshot(): string {
  const employment = employmentLifecycleStorage.getPrimaryActive();
  if (!employment) return "";

  return JSON.stringify({
    id: employment.id,
    jobTitle: employment.jobTitle,
    companyName: employment.companyName,
    joinedAt: employment.joinedAt,
  } satisfies EmploymentSnapshot);
}

export function parseEmploymentSnapshot(raw: string): EmploymentSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as EmploymentSnapshot;
    return parsed.id ? parsed : null;
  } catch {
    return null;
  }
}
