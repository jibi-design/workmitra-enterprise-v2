/** Job Mitra | demandPlannerWizardDraft.storage.ts — Wave-4/5 autosave draft + DoS-safe parse */

import type { Step1Data } from "../components/wizard/DemandPlannerStep1.types";
import type { DaySlot } from "./demandPlannerStorage";
import type { DemandPlannerStep } from "../types/employerDemandPlanner.types";
import { sanitizeUserText } from "../../../../shared/security/sanitizeUserText";
import { z } from "zod";

export const DEMAND_PLANNER_WIZARD_DRAFT_KEY = "wm_employer_demand_plan_draft_v1";

export type DemandPlannerWizardDraft = {
  version: 1;
  step: DemandPlannerStep;
  step1: Step1Data;
  slots: DaySlot[];
  planId: string | null;
  savedAt: number;
};

const MAX_SLOTS = 90;
const MAX_STRING = 500;
const MAX_RAW_BYTES = 200_000;

const STEP1_ALLOW = new Set([
  "name",
  "companyName",
  "locationName",
  "locationPincode",
  "category",
  "experience",
  "startDate",
  "endDate",
  "workingDays",
  "description",
  "defaultWorkers",
  "waitingBuffer",
  "shiftTiming",
  "mapsLink",
]);

/** Layer 4 — Zod draft envelope; unknown keys stripped. */
const wizardDraftSchema = z.object({
  version: z.literal(1),
  step: z.number().int().min(1).max(3),
  step1: z.record(z.string(), z.unknown()),
  slots: z.array(z.unknown()).max(MAX_SLOTS),
  planId: z.string().max(80).nullable().optional(),
  savedAt: z.number().optional(),
});

function clampString(value: unknown, max = MAX_STRING): string {
  return sanitizeUserText(value, max);
}

function isStep1(value: unknown): value is Step1Data {
  if (typeof value !== "object" || value === null) return false;
  const rec = value as Record<string, unknown>;
  return typeof rec.name === "string" && typeof rec.companyName === "string";
}

function sanitizeStep1(raw: Step1Data): Step1Data {
  const workingDays: Step1Data["workingDays"] = Array.isArray(raw.workingDays)
    ? (
        raw.workingDays.filter(
          (d) => typeof d === "number" && d >= 0 && d <= 6,
        ) as Step1Data["workingDays"]
      ).slice(0, 7)
    : [1, 2, 3, 4, 5];

  const out: Record<string, unknown> = {};
  for (const key of STEP1_ALLOW) {
    if (!(key in raw)) continue;
    const val = (raw as Record<string, unknown>)[key];
    if (key === "workingDays") out[key] = workingDays;
    else if (key === "defaultWorkers" || key === "waitingBuffer") {
      const n = typeof val === "number" && Number.isFinite(val) ? Math.floor(val) : 0;
      out[key] = Math.max(0, Math.min(n, 500));
    } else if (typeof val === "string") out[key] = clampString(val);
    else if (typeof val === "number" || typeof val === "boolean") out[key] = val;
  }

  return {
    name: clampString(out.name ?? ""),
    companyName: clampString(out.companyName ?? ""),
    locationName: clampString(out.locationName ?? ""),
    locationPincode: clampString(out.locationPincode ?? "", 16).replace(/\D/g, "").slice(0, 6),
    category: clampString(out.category ?? "Construction", 80),
    experience: (clampString(out.experience ?? "helper", 40) ||
      "helper") as Step1Data["experience"],
    startDate: clampString(out.startDate ?? "", 32),
    endDate: clampString(out.endDate ?? "", 32),
    workingDays: workingDays as Step1Data["workingDays"],
    description: clampString(out.description ?? "", 2000),
    defaultWorkers: typeof out.defaultWorkers === "number" ? out.defaultWorkers : 2,
    waitingBuffer: typeof out.waitingBuffer === "number" ? out.waitingBuffer : 2,
    shiftTiming: clampString(out.shiftTiming ?? "", 80),
    mapsLink: clampString(out.mapsLink ?? "", 500),
  };
}

function sanitizeSlots(raw: unknown): DaySlot[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_SLOTS) return null;
  const out: DaySlot[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const rec = item as Record<string, unknown>;
    const date = clampString(rec.date, 32);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const workers =
      typeof rec.workers === "number" && Number.isFinite(rec.workers)
        ? Math.max(0, Math.min(Math.floor(rec.workers), 500))
        : 0;
    const payPerDay =
      typeof rec.payPerDay === "number" && Number.isFinite(rec.payPerDay)
        ? Math.max(0, Math.min(rec.payPerDay, 1_000_000))
        : 0;
    const slot: DaySlot = { date, workers, payPerDay };
    if (typeof rec.postId === "string" && rec.postId.trim()) {
      slot.postId = clampString(rec.postId, 80);
    }
    out.push(slot);
  }
  return out;
}

export function readDemandPlannerWizardDraft(): DemandPlannerWizardDraft | null {
  try {
    const raw = localStorage.getItem(DEMAND_PLANNER_WIZARD_DRAFT_KEY);
    if (!raw) return null;
    if (raw.length > MAX_RAW_BYTES) {
      localStorage.removeItem(DEMAND_PLANNER_WIZARD_DRAFT_KEY);
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    const envelope = wizardDraftSchema.safeParse(parsed);
    if (!envelope.success) return null;
    const rec = envelope.data;
    if (!isStep1(rec.step1)) return null;
    const slots = sanitizeSlots(rec.slots);
    if (!slots) return null;
    return {
      version: 1,
      step: rec.step as DemandPlannerStep,
      step1: sanitizeStep1(rec.step1 as Step1Data),
      slots,
      planId: typeof rec.planId === "string" ? clampString(rec.planId, 80) || null : null,
      savedAt: typeof rec.savedAt === "number" ? rec.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeDemandPlannerWizardDraft(
  draft: Omit<DemandPlannerWizardDraft, "version" | "savedAt"> & { savedAt?: number },
): void {
  try {
    const slots = sanitizeSlots(draft.slots);
    if (!slots) return;
    const payload: DemandPlannerWizardDraft = {
      version: 1,
      step: draft.step,
      step1: sanitizeStep1(draft.step1),
      slots,
      planId: draft.planId,
      savedAt: draft.savedAt ?? Date.now(),
    };
    const serialized = JSON.stringify(payload);
    if (serialized.length > MAX_RAW_BYTES) return;
    localStorage.setItem(DEMAND_PLANNER_WIZARD_DRAFT_KEY, serialized);
  } catch {
    /* quota / private mode */
  }
}

export function clearDemandPlannerWizardDraft(): void {
  try {
    localStorage.removeItem(DEMAND_PLANNER_WIZARD_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function hasDemandPlannerWizardDraft(): boolean {
  return readDemandPlannerWizardDraft() !== null;
}
