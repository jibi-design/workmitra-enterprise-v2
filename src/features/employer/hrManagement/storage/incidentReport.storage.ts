// src/features/employer/hrManagement/storage/incidentReport.storage.ts
//
// CRUD for Incident / Issue Report (Root Map 5.3.12).
// Employee reports issues → Employer tracks + resolves.

import type {
  IncidentReport,
  IncidentFormData,
  IncidentStatus,
  IncidentNote,
} from "../types/incidentReport.types";

const STORAGE_KEY = "wm_incident_reports_v1";
const CHANGED_EVENT = "wm:incident-reports-changed";

function read(): IncidentReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as IncidentReport[]) : [];
  } catch {
    return [];
  }
}

function write(reports: IncidentReport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "inc_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export const incidentReportStorage = {

  // ── Read ──

  /** Get all reports for an employer (all employees) — newest first */
  getAll(): IncidentReport[] {
    return read().sort((a, b) => b.reportedAt - a.reportedAt);
  },

  /** Get reports for a specific employee (by hrCandidateId) */
  getForCandidate(hrCandidateId: string): IncidentReport[] {
    return read()
      .filter((r) => r.hrCandidateId === hrCandidateId)
      .sort((a, b) => b.reportedAt - a.reportedAt);
  },

  /** Get reports for employee side (by employmentId) */
  getForEmployment(employmentId: string): IncidentReport[] {
    return read()
      .filter((r) => r.employmentId === employmentId)
      .sort((a, b) => b.reportedAt - a.reportedAt);
  },

  /** Get pending (non-resolved) count */
  getPendingCount(): number {
    return read().filter((r) => r.status !== "resolved").length;
  },

  // ── Create (Employee side) ──

  /** Employee submits an incident report */
  submitReport(data: {
    hrCandidateId: string;
    employmentId: string;
    employeeName: string;
    form: IncidentFormData;
  }): string {
    const now = Date.now();
    const report: IncidentReport = {
      id: genId(),
      hrCandidateId: data.hrCandidateId,
      employmentId: data.employmentId,
      employeeName: data.employeeName,
      description: data.form.description.trim(),
      location: data.form.location.trim(),
      urgency: data.form.urgency,
      status: "reported",
      photoCount: 0,
      employerNotes: [],
      reportedAt: now,
      updatedAt: now,
    };

    const all = read();
    write([report, ...all]);
    return report.id;
  },

  // ── Update (Employer side) ──

  /** Update status */
  updateStatus(id: string, newStatus: IncidentStatus): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const now = Date.now();
    all[idx] = {
      ...all[idx],
      status: newStatus,
      acknowledgedAt: newStatus === "acknowledged" && !all[idx].acknowledgedAt ? now : all[idx].acknowledgedAt,
      resolvedAt: newStatus === "resolved" ? now : undefined,
      updatedAt: now,
    };

    write(all);
    return true;
  },

  /** Add employer note */
  addNote(id: string, content: string): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const note: IncidentNote = {
      id: genId(),
      content: content.trim(),
      createdAt: Date.now(),
    };

    all[idx] = {
      ...all[idx],
      employerNotes: [...all[idx].employerNotes, note],
      updatedAt: Date.now(),
    };

    write(all);
    return true;
  },

  /** Delete report */
  deleteReport(id: string): boolean {
    const all = read();
    const filtered = all.filter((r) => r.id !== id);
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