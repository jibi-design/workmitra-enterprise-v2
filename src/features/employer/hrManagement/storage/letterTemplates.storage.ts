// src/features/employer/hrManagement/storage/letterTemplates.storage.ts
//
// CRUD for all HR letters/documents.
// Shared storage for appointment, warning, appreciation, salary slip, etc.

import type { LetterRecord, LetterKind, LetterData, LetterStatus } from "../types/letterTemplates.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_hr_letters_v1";
const CHANGED_EVENT = "wm:hr-letters-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): LetterRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LetterRecord[]) : [];
  } catch {
    return [];
  }
}

function write(records: LetterRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "ltr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const letterTemplatesStorage = {
  // ── Read ──

  /** Get all letters (newest first) */
  getAll(): LetterRecord[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get letters for a specific HR candidate */
  getByCandidate(hrCandidateId: string): LetterRecord[] {
    return read()
      .filter((r) => r.hrCandidateId === hrCandidateId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get letters by kind for a candidate */
  getByCandidateAndKind(hrCandidateId: string, kind: LetterKind): LetterRecord[] {
    return read()
      .filter((r) => r.hrCandidateId === hrCandidateId && r.kind === kind)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get by ID */
  getById(id: string): LetterRecord | null {
    return read().find((r) => r.id === id) ?? null;
  },

  // ── Create ──

  /** Create and send a letter */
  createLetter(data: {
    hrCandidateId: string;
    employeeUniqueId: string;
    employeeName: string;
    kind: LetterKind;
    letterData: LetterData;
  }): string {
    const now = Date.now();
    const record: LetterRecord = {
      id: genId(),
      hrCandidateId: data.hrCandidateId,
      employeeUniqueId: data.employeeUniqueId,
      employeeName: data.employeeName,
      kind: data.kind,
      letterData: data.letterData,
      status: "sent",
      createdAt: now,
      sentAt: now,
    };

    const all = read();
    write([record, ...all]);
    return record.id;
  },

  // ── Status Updates ──

  /** Employee acknowledges letter */
  acknowledgeLetter(id: string): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1 || all[idx].status !== "sent") return false;

    all[idx] = {
      ...all[idx],
      status: "acknowledged" as LetterStatus,
      acknowledgedAt: Date.now(),
    };
    write(all);
    return true;
  },

  /** Employee disputes letter */
  disputeLetter(id: string, reason: string): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1 || all[idx].status !== "sent") return false;

    all[idx] = {
      ...all[idx],
      status: "disputed" as LetterStatus,
      disputedAt: Date.now(),
      disputeReason: reason.trim(),
    };
    write(all);
    return true;
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
} as const;