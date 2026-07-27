import type { ShiftPayBasis } from "../storage/employerShift.types";

export type ShiftPayBasisDraft = ShiftPayBasis | "";

export const SHIFT_PAY_BASIS_OPTIONS: readonly {
  value: ShiftPayBasis;
  label: string;
  helper: string;
}[] = [
  { value: "per_hour", label: "Per hour", helper: "Best for hourly markets and shorter shifts." },
  { value: "per_day", label: "Per day", helper: "Best for daily wage or full-day work." },
  {
    value: "fixed_total",
    label: "Fixed total",
    helper: "Best when the whole work has one total amount.",
  },
  {
    value: "not_listed",
    label: "Not listed / Discuss later",
    helper: "Use when pay is not ready to publish.",
  },
];

export function getShiftPayBasisLabel(payBasis: ShiftPayBasisDraft): string {
  if (payBasis === "per_hour") return "Per hour";
  if (payBasis === "per_day") return "Per day";
  if (payBasis === "fixed_total") return "Fixed total";
  if (payBasis === "not_listed") return "Not listed / Discuss later";
  return "Select pay basis";
}

export function formatShiftPayDisplay(amount: number, payBasis: ShiftPayBasisDraft): string {
  if (payBasis === "not_listed") return "Pay not listed";
  if (payBasis === "per_hour") return amount > 0 ? `${amount} / hour` : "___ / hour";
  if (payBasis === "per_day") return amount > 0 ? `${amount} / day` : "___ / day";
  if (payBasis === "fixed_total") return amount > 0 ? `${amount} total` : "___ total";

  return amount > 0 ? `${amount} / day` : "Select pay basis";
}
