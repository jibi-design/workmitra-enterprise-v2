// src/features/employer/hrManagement/storage/companyNotice.storage.ts
//
// CRUD for Bulk Notifications / Company Notices (Root Map 5.3.11).
// Employer sends notices to all staff or specific department/location.

import type { CompanyNotice, NoticeTarget } from "../types/companyNotice.types";
import { hrManagementStorage } from "./hrManagement.storage";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_company_notices_v1";
const CHANGED_EVENT = "wm:company-notices-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): CompanyNotice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CompanyNotice[]) : [];
  } catch {
    return [];
  }
}

function write(notices: CompanyNotice[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "ntc_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const companyNoticeStorage = {

  /** Get all notices (newest first) */
  getAll(): CompanyNotice[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get notices visible to a specific employee (by HR candidate ID) */
  getForEmployee(hrCandidateId: string): CompanyNotice[] {
    return read()
      .filter((n) => n.recipientIds.includes(hrCandidateId))
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get unique departments from active employees */
  getAvailableDepartments(): string[] {
    const active = hrManagementStorage.getAll().filter((r) => r.status === "active");
    const depts = new Set<string>();
    for (const r of active) {
      if (r.department?.trim()) depts.add(r.department.trim());
    }
    return [...depts].sort();
  },

  /** Get unique locations from active employees */
  getAvailableLocations(): string[] {
    const active = hrManagementStorage.getAll().filter((r) => r.status === "active");
    const locs = new Set<string>();
    for (const r of active) {
      if (r.location?.trim()) locs.add(r.location.trim());
    }
    return [...locs].sort();
  },

  /** Send a notice */
  sendNotice(data: {
    title: string;
    body: string;
    target: NoticeTarget;
    targetValue: string;
  }): string {
    const active = hrManagementStorage.getAll().filter((r) => r.status === "active");

    let recipients = active;

    if (data.target === "department" && data.targetValue) {
      recipients = active.filter(
        (r) => r.department?.trim().toLowerCase() === data.targetValue.toLowerCase(),
      );
    } else if (data.target === "location" && data.targetValue) {
      recipients = active.filter(
        (r) => r.location?.trim().toLowerCase() === data.targetValue.toLowerCase(),
      );
    }

    const notice: CompanyNotice = {
      id: genId(),
      title: data.title.trim(),
      body: data.body.trim(),
      target: data.target,
      targetValue: data.targetValue,
      recipientCount: recipients.length,
      recipientIds: recipients.map((r) => r.id),
       readReceipts: [],
      createdAt: Date.now(),
    };

    const all = read();
    write([notice, ...all]);
    return notice.id;
  },

  /** Delete a notice */
  deleteNotice(id: string): boolean {
    const all = read();
    const filtered = all.filter((n) => n.id !== id);
    if (filtered.length === all.length) return false;
    write(filtered);
    return true;
  },

 /** Mark a notice as read by an employee (localStorage simulate) */
  markAsRead(noticeId: string, hrCandidateId: string, employeeName: string): boolean {
    const all = read();
    const idx = all.findIndex((n) => n.id === noticeId);
    if (idx === -1) return false;

    const notice = all[idx];
    if (notice.readReceipts.some((r) => r.hrCandidateId === hrCandidateId)) return false;

    all[idx] = {
      ...notice,
      readReceipts: [...notice.readReceipts, { hrCandidateId, employeeName, readAt: Date.now() }],
    };

    write(all);
    return true;
  },

  /** Get read count for a notice */
  getReadCount(noticeId: string): { read: number; total: number } {
    const all = read();
    const notice = all.find((n) => n.id === noticeId);
    if (!notice) return { read: 0, total: 0 };
    return { read: notice.readReceipts.length, total: notice.recipientCount };
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
};