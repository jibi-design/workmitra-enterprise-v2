// App name: Job Mitra
// File name: shiftTemplatesStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\shiftTemplatesStorage.ts

import type { ExperienceLabel } from "../../shiftJobs/storage/employerShift.storage";
import type { ShiftPayBasis } from "./employerShift.types";
import { getEmployerTemplatesKey, LEGACY_TEMPLATES_KEY } from "./employerShift.keys";

export type ShiftTemplate = {
  id: string;
  name: string;
  createdAt: number;
  jobName: string;
  companyName: string;
  category: string;
  experience: ExperienceLabel;
  payPerDay: number;
  payBasis?: ShiftPayBasis;
  locationName: string;
  description?: string;
  shiftTiming?: string;
  vacancies: number;
  waitingBuffer: number;
  mustHave: string[];
  goodToHave: string[];
  whatWeProvide?: string[];
  quickQuestions?: { id: string; text: string }[];
  dressCode?: string;
};

export type PendingTemplate = Omit<ShiftTemplate, "id" | "name" | "createdAt">;

/** @deprecated Legacy unscoped — prefer getEmployerTemplatesKey(). */
const KEY = LEGACY_TEMPLATES_KEY;
const PENDING_KEY = "wm_pending_shift_template";
const CHANGED = "wm:employer-shift-templates-changed";

function templatesKey(): string {
  return getEmployerTemplatesKey();
}

function read(): ShiftTemplate[] {
  try {
    const raw = localStorage.getItem(templatesKey());
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isShiftTemplateLike).map(normalizeTemplate);
  } catch {
    return [];
  }
}

function write(list: ShiftTemplate[]): void {
  try {
    localStorage.setItem(templatesKey(), JSON.stringify(list));
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* safe */
    }
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    // Phase-0 localStorage-safe fallback.
  }
}

function genId(): string {
  return `tpl_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isShiftTemplateLike(value: unknown): value is ShiftTemplate {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.createdAt === "number" &&
    typeof value.jobName === "string" &&
    typeof value.companyName === "string" &&
    typeof value.category === "string" &&
    typeof value.payPerDay === "number" &&
    typeof value.locationName === "string"
  );
}

function normalizePayBasis(value: unknown): ShiftPayBasis | undefined {
  if (
    value === "per_hour" ||
    value === "per_day" ||
    value === "fixed_total" ||
    value === "not_listed"
  ) {
    return value;
  }

  return undefined;
}

function normalizeTemplate(template: ShiftTemplate): ShiftTemplate {
  return {
    ...template,
    payBasis: normalizePayBasis(template.payBasis),
  };
}

export const shiftTemplatesStorage = {
  getAll(): ShiftTemplate[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },

  getById(id: string): ShiftTemplate | null {
    return read().find((template) => template.id === id) ?? null;
  },

  saveTemplate(name: string, data: PendingTemplate): string {
    const list = read();
    const id = genId();

    write([{ id, name: name.trim(), createdAt: Date.now(), ...data }, ...list].slice(0, 50));

    return id;
  },

  rename(id: string, name: string): void {
    write(
      read().map((template) =>
        template.id === id ? { ...template, name: name.trim() } : template,
      ),
    );
  },

  delete(id: string): void {
    write(read().filter((template) => template.id !== id));
  },

  setPending(data: PendingTemplate): void {
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(data));
    } catch {
      // Phase-0 sessionStorage-safe fallback.
    }
  },

  consumePending(): PendingTemplate | null {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (!raw) return null;

      sessionStorage.removeItem(PENDING_KEY);

      const parsed = JSON.parse(raw) as PendingTemplate;
      return {
        ...parsed,
        payBasis: normalizePayBasis(parsed.payBasis),
      };
    } catch {
      return null;
    }
  },

  subscribe(callback: () => void): () => void {
    const handler = () => callback();

    window.addEventListener(CHANGED, handler);

    return () => window.removeEventListener(CHANGED, handler);
  },

  CHANGED_EVENT: CHANGED,
} as const;
