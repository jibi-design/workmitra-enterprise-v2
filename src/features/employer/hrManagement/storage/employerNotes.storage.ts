// src/features/employer/hrManagement/storage/employerNotes.storage.ts
//
// CRUD service for Employer Notes (Root Map Section 5.3.C).
// Private notes about an employee — only employer can see.
// Employee CANNOT see these notes.

import type { EmployerNoteEntry } from "../types/employerNotes.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_employer_notes_v1";
const CHANGED_EVENT = "wm:employer-notes-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): EmployerNoteEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EmployerNoteEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: EmployerNoteEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "note_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const employerNotesStorage = {

  // ── Read ──

  /** Get all notes for a candidate (newest first — log style) */
  getAllForCandidate(hrCandidateId: string): EmployerNoteEntry[] {
    return read()
      .filter((n) => n.hrCandidateId === hrCandidateId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Count notes for a candidate */
  count(hrCandidateId: string): number {
    return read().filter((n) => n.hrCandidateId === hrCandidateId).length;
  },

  // ── Create ──

  /** Add a new note */
  addNote(hrCandidateId: string, content: string): string {
    const now = Date.now();
    const note: EmployerNoteEntry = {
      id: genId(),
      hrCandidateId,
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const all = read();
    write([note, ...all]);
    return note.id;
  },

  // ── Update ──

  /** Edit an existing note */
  editNote(id: string, content: string): boolean {
    const all = read();
    const idx = all.findIndex((n) => n.id === id);
    if (idx === -1) return false;

    all[idx] = {
      ...all[idx],
      content: content.trim(),
      updatedAt: Date.now(),
    };

    write(all);
    return true;
  },

  // ── Delete ──

  /** Delete a note */
  deleteNote(id: string): boolean {
    const all = read();
    const filtered = all.filter((n) => n.id !== id);
    if (filtered.length === all.length) return false;
    write(filtered);
    return true;
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
};