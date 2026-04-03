// src/features/employer/shiftJobs/storage/shiftTemplatesStorage.ts
//
// Shift Templates — save shift post data as reusable template.
// "Use Template" → saves PendingTemplate to sessionStorage → create page pre-fills.

import type { ExperienceLabel } from "./employerShift.storage";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type ShiftTemplate = {
  id: string;
  name: string;
  createdAt: number;
  jobName: string;
  companyName: string;
  category: string;
  experience: ExperienceLabel;
  payPerDay: number;
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

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const KEY         = "wm_employer_shift_templates_v1";
const PENDING_KEY = "wm_pending_shift_template";
const CHANGED     = "wm:employer-shift-templates-changed";

/* ------------------------------------------------ */
/* Internal helpers                                 */
/* ------------------------------------------------ */
function read(): ShiftTemplate[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p: unknown = JSON.parse(raw);
    return Array.isArray(p) ? (p as ShiftTemplate[]) : [];
  } catch { return []; }
}

function write(list: ShiftTemplate[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGED));
  } catch { /* safe */ }
}

function genId(): string {
  return `tpl_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

/* ------------------------------------------------ */
/* Storage API                                      */
/* ------------------------------------------------ */
export const shiftTemplatesStorage = {
  getAll(): ShiftTemplate[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },

  getById(id: string): ShiftTemplate | null {
    return read().find((t) => t.id === id) ?? null;
  },

  /** Save a shift post's data as a named template */
  saveTemplate(name: string, data: PendingTemplate): string {
    const list = read();
    const id = genId();
    write([{ id, name: name.trim(), createdAt: Date.now(), ...data }, ...list].slice(0, 50));
    return id;
  },

  rename(id: string, name: string): void {
    write(read().map((t) => t.id === id ? { ...t, name: name.trim() } : t));
  },

  delete(id: string): void {
    write(read().filter((t) => t.id !== id));
  },

  /* ---- Pending template (sessionStorage) ---- */

  /** Called when employer taps "Use Template" — navigates to create */
  setPending(data: PendingTemplate): void {
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(data)); } catch { /* safe */ }
  },

  /** Called once on create page mount — returns data and clears */
  consumePending(): PendingTemplate | null {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(PENDING_KEY);
      return JSON.parse(raw) as PendingTemplate;
    } catch { return null; }
  },

  subscribe(cb: () => void): () => void {
    const h = () => cb();
    window.addEventListener(CHANGED, h);
    return () => window.removeEventListener(CHANGED, h);
  },

  CHANGED_EVENT: CHANGED,
} as const;