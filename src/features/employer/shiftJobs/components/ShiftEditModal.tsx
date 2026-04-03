// src/features/employer/shiftJobs/components/ShiftEditModal.tsx
//
// Edit Shift Post modal.
// No confirmed workers → all fields editable.
// Confirmed workers → edit allowed + workers notified.

import { useState } from "react";
import type { ShiftPost } from "../storage/employerShift.storage";

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function toDateStr(epoch: number): string {
  try {
    const d = new Date(epoch);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch { return ""; }
}

function toEpoch(s: string): number {
  try { const d = new Date(s); return Number.isFinite(d.getTime()) ? d.getTime() : Date.now(); } catch { return Date.now(); }
}

function todayStr(): string { return toDateStr(Date.now()); }

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type EditFields = {
  jobName: string;
  description: string;
  shiftTiming: string;
  payPerDayStr: string;
  startDateStr: string;
  endDateStr: string;
  locationName: string;
  dressCode: string;
};

type Props = {
  post: ShiftPost;
  onSave: (updates: {
    jobName?: string; description?: string; shiftTiming?: string;
    payPerDay?: number; startAt?: number; endAt?: number;
    locationName?: string; dressCode?: string;
  }) => void;
  onClose: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ShiftEditModal({ post, onSave, onClose }: Props) {
  const [fields, setFields] = useState<EditFields>({
    jobName:      post.jobName,
    description:  post.description  ?? "",
    shiftTiming:  post.shiftTiming  ?? "",
    payPerDayStr: String(post.payPerDay),
    startDateStr: toDateStr(post.startAt),
    endDateStr:   toDateStr(post.endAt),
    locationName: post.locationName,
    dressCode:    post.dressCode    ?? "",
  });

  const hasConfirmed = post.confirmedIds.length > 0;

  function set<K extends keyof EditFields>(key: K, val: string) {
    setFields((f) => ({ ...f, [key]: val }));
  }

  function handleSave() {
    const pay = Number(fields.payPerDayStr) || 0;
    if (!fields.jobName.trim()) return;
    if (pay <= 0) return;
    onSave({
      jobName:      fields.jobName.trim(),
      description:  fields.description.trim(),
      shiftTiming:  fields.shiftTiming.trim(),
      payPerDay:    pay,
      startAt:      toEpoch(fields.startDateStr),
      endAt:        toEpoch(fields.endDateStr),
      locationName: fields.locationName.trim(),
      dressCode:    fields.dressCode.trim() || undefined,
    });
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}
      onClick={onClose}
    >
      <div style={{
        background: "var(--wm-er-card, #fff)", borderRadius: 16,
        width: "100%", maxWidth: 420, maxHeight: "92vh", overflow: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "16px 18px 12px",
          borderBottom: "1px solid var(--wm-er-border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>Edit Shift</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              {post.jobName} &mdash; {post.companyName}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--wm-er-muted)", fontSize: 18, padding: 4 }}>
            &times;
          </button>
        </div>

        {/* Warning if confirmed workers */}
        {hasConfirmed && (
          <div style={{
            margin: "12px 18px 0",
            padding: "10px 12px", borderRadius: 10,
            background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.2)",
            fontSize: 12, color: "#92400e", fontWeight: 600, lineHeight: 1.5,
          }}>
            &#9888; {post.confirmedIds.length} confirmed worker{post.confirmedIds.length !== 1 ? "s" : ""} will be notified of these changes.
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "14px 18px", display: "grid", gap: 12 }}>
          {/* Job Name */}
          <div>
            <div className="wm-label">Job Title <span style={{ color: "var(--wm-error)" }}>*</span></div>
            <input className="wm-input" value={fields.jobName}
              onChange={(e) => set("jobName", e.target.value)} maxLength={100} />
          </div>

          {/* Location */}
          <div>
            <div className="wm-label">Location <span style={{ color: "var(--wm-error)" }}>*</span></div>
            <input className="wm-input" value={fields.locationName}
              onChange={(e) => set("locationName", e.target.value)} maxLength={150} />
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div className="wm-label">Start Date</div>
              <input className="wm-input" type="date"
                value={fields.startDateStr} min={todayStr()}
                onChange={(e) => set("startDateStr", e.target.value)} />
            </div>
            <div>
              <div className="wm-label">End Date</div>
              <input className="wm-input" type="date"
                value={fields.endDateStr} min={fields.startDateStr}
                onChange={(e) => set("endDateStr", e.target.value)} />
            </div>
          </div>

          {/* Pay */}
          <div>
            <div className="wm-label">Pay per Day <span style={{ color: "var(--wm-error)" }}>*</span></div>
            <input className="wm-input" value={fields.payPerDayStr}
              onChange={(e) => set("payPerDayStr", e.target.value.replace(/\D/g, ""))}
              inputMode="numeric" maxLength={7} />
          </div>

          {/* Shift Timing */}
          <div>
            <div className="wm-label">Shift Timing</div>
            <input className="wm-input" value={fields.shiftTiming}
              onChange={(e) => set("shiftTiming", e.target.value)}
              placeholder="e.g. 8:00 AM – 5:00 PM" maxLength={50} />
          </div>

          {/* Dress Code */}
          <div>
            <div className="wm-label">Dress Code</div>
            <input className="wm-input" value={fields.dressCode}
              onChange={(e) => set("dressCode", e.target.value)}
              placeholder="e.g. Black trousers and white shirt" maxLength={200} />
          </div>

          {/* Description */}
          <div>
            <div className="wm-label">Description</div>
            <textarea className="wm-input"
              value={fields.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Job description..." maxLength={500}
              style={{ height: 80, paddingTop: 10, fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 18px 16px",
          borderTop: "1px solid var(--wm-er-border)",
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Cancel</button>
          <button className="wm-primarybtn" type="button" onClick={handleSave}
            disabled={!fields.jobName.trim() || !fields.payPerDayStr}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}