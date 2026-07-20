// Job Mitra | plannerPayDisplay.helpers.ts | Symbol-free pay display (universal format)

/** Per-day pay — e.g. "800 / day" */
export function formatPlannerPayPerDay(amount: number): string {
  if (amount <= 0) return "—";
  return `${amount.toLocaleString("en-IN")} / day`;
}

/** Pay range across plan days — e.g. "600–800 / day" */
export function formatPlannerPayRange(min: number, max: number): string {
  if (min <= 0 && max <= 0) return "";
  if (min === max) return formatPlannerPayPerDay(min);
  return `${min.toLocaleString("en-IN")}–${max.toLocaleString("en-IN")} / day`;
}

/** Compact amount for calendar cells and inline suffixes */
export function formatPlannerPayAmount(amount: number): string {
  if (amount <= 0) return "";
  return Math.round(amount).toLocaleString("en-IN");
}

/** Total / budget line — e.g. "2,400 total" */
export function formatPlannerPayTotal(amount: number): string {
  return `${Math.max(0, Math.round(amount)).toLocaleString("en-IN")} total`;
}
