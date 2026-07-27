import type { ExperienceLabel } from "../../shiftJobs/storage/employerShift.storage";
import type { ShiftPayBasisDraft } from "./shiftCreateHelpers.pay";

export function expLabel(e: ExperienceLabel): string {
  if (e === "helper") return "Helper (minimum experience)";
  if (e === "fresher_ok") return "Fresher (no experience needed)";
  return "Experienced only";
}

export function isDirtyCheck(fields: {
  companyName: string;
  jobName: string;
  category: string;
  description: string;
  vacanciesStr: string;
  payPerDayStr: string;
  payBasis: ShiftPayBasisDraft;
  locationName: string;
  mustHave: string;
  goodToHave: string;
}): boolean {
  return (
    fields.companyName.trim().length > 0 ||
    fields.jobName.trim().length > 0 ||
    fields.category.trim().length > 0 ||
    fields.description.trim().length > 0 ||
    fields.vacanciesStr.trim().length > 0 ||
    fields.payPerDayStr.trim().length > 0 ||
    fields.payBasis.length > 0 ||
    fields.locationName.trim().length > 0 ||
    fields.mustHave.trim().length > 0 ||
    fields.goodToHave.trim().length > 0
  );
}

export function validateShiftForm(p: {
  companyName: string;
  jobName: string;
  locationName: string;
  vacanciesStr: string;
  payPerDay: number;
  payBasis: ShiftPayBasisDraft;
  startAt: number;
  endAt: number;
}): string[] {
  const e: string[] = [];

  if (p.companyName.trim().length < 2) e.push("Company name is required (min 2 characters).");
  if (p.jobName.trim().length < 2) e.push("Job title is required (min 2 characters).");
  if (p.locationName.trim().length < 2) e.push("Work location is required.");
  if ((Number(p.vacanciesStr) || 0) < 1) e.push("At least 1 worker is needed.");
  if (!p.payBasis) e.push("Pay basis is required.");
  if (p.payBasis && p.payBasis !== "not_listed" && p.payPerDay <= 0) {
    e.push("Pay amount must be greater than 0.");
  }
  if (p.endAt <= p.startAt) e.push("End date/time must be after start date.");

  return e;
}

export function validateWizardStep1(p: {
  companyName: string;
  jobName: string;
  vacanciesStr: string;
}): string[] {
  const e: string[] = [];

  if (p.companyName.trim().length < 2) e.push("Company name is required (min 2 characters).");
  if (p.jobName.trim().length < 2) e.push("Job title / role is required (min 2 characters).");
  if ((Number(p.vacanciesStr) || 0) < 1) e.push("At least 1 worker is needed.");

  return e;
}

export function validateWizardStep2(p: {
  locationName: string;
  payPerDay: number;
  payBasis: ShiftPayBasisDraft;
  startAt: number;
  endAt: number;
}): string[] {
  const e: string[] = [];

  if (p.locationName.trim().length < 2) e.push("City / area is required.");
  if (!p.payBasis) e.push("Pay basis is required.");
  if (p.payBasis && p.payBasis !== "not_listed" && p.payPerDay <= 0) {
    e.push("Pay amount must be greater than 0.");
  }
  if (p.endAt <= p.startAt) e.push("End date/time must be after start date.");

  return e;
}
