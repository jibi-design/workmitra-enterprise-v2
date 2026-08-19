/** Job Mitra API | Rolling ISO dates for availability broadcasts. */

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIso(from: Date, days: number): string {
  const next = new Date(from);
  next.setHours(12, 0, 0, 0);
  next.setDate(from.getDate() + days);
  return toIsoDate(next);
}

export function rolling7IsoDates(from = new Date()): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysIso(from, i));
}

export function sanitizeSelectedDates(dates: unknown, from = new Date()): string[] {
  if (!Array.isArray(dates)) return [];
  const today = toIsoDate(from);
  const allowed = new Set<string>();
  for (let i = 0; i < 7; i += 1) allowed.add(addDaysIso(from, i));

  const uniq = new Set<string>();
  for (const value of dates) {
    if (typeof value !== "string" || !ISO_RE.test(value)) continue;
    if (!allowed.has(value)) continue;
    if (value < today) continue;
    uniq.add(value);
  }
  return [...uniq].sort();
}

export function computeExpiresAt(selectedDates: string[]): number {
  if (selectedDates.length === 0) return Date.now();
  const last = selectedDates[selectedDates.length - 1];
  const [y, m, d] = last.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}
