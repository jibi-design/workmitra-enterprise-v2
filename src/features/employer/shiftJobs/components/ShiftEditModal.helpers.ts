import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";

export type ShiftPayBasis = NonNullable<ShiftPost["payBasis"]>;

export type PayBasisOption = {
  value: ShiftPayBasis;
  label: string;
  helper: string;
};

export const PAY_BASIS_OPTIONS: PayBasisOption[] = [
  {
    value: "per_hour",
    label: "Per hour",
    helper: "Best for hourly markets and shorter shifts.",
  },
  {
    value: "per_day",
    label: "Per day",
    helper: "Best for daily wage or full-day work.",
  },
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

export type EditFields = {
  jobName: string;
  description: string;
  shiftTiming: string;
  payPerDayStr: string;
  payBasis: ShiftPayBasis;
  startDateStr: string;
  endDateStr: string;
  locationName: string;
  locationPincode: string;
  dressCode: string;
};

export function toDateStr(epoch: number): string {
  try {
    const d = new Date(epoch);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export function toEpoch(value: string): number {
  try {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d.getTime() : Date.now();
  } catch {
    return Date.now();
  }
}

export function todayStr(): string {
  return toDateStr(Date.now());
}

export function formatShiftPayDisplay(amount: number, payBasis: ShiftPayBasis): string {
  if (payBasis === "not_listed") return "Pay not listed";
  if (payBasis === "per_hour") return amount > 0 ? `${amount} / hour` : "___ / hour";
  if (payBasis === "fixed_total") return amount > 0 ? `${amount} total` : "___ total";

  return amount > 0 ? `${amount} / day` : "___ / day";
}

export function buildInitialFields(post: ShiftPost): EditFields {
  return {
    jobName: post.jobName,
    description: post.description ?? "",
    shiftTiming: post.shiftTiming ?? "",
    payPerDayStr: post.payBasis === "not_listed" ? "" : String(post.payPerDay),
    payBasis: post.payBasis ?? "per_day",
    startDateStr: toDateStr(post.startAt),
    endDateStr: toDateStr(post.endAt),
    locationName: post.locationName,
    locationPincode: post.locationPincode ?? "",
    dressCode: post.dressCode ?? "",
  };
}

export type ShiftEditSavePayload = {
  jobName?: string;
  description?: string;
  shiftTiming?: string;
  payPerDay?: number;
  payBasis?: ShiftPayBasis;
  startAt?: number;
  endAt?: number;
  locationName?: string;
  locationPincode?: string;
  dressCode?: string;
};

export type ShiftEditModalProps = {
  post: ShiftPost;
  onSave: (updates: ShiftEditSavePayload) => void;
  onClose: () => void;
};
