// src/features/employee/shiftJobs/components/ShiftPostDetailSections.tsx
//
// Display sections for ShiftPostDetailsApplyPage.

import { cap } from "../helpers/shiftApplyHelpers";

export function ShiftIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="var(--wm-er-accent-shift, #16a34a)" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z" />
    </svg>
  );
}
import { PROVIDE_MAP } from "../helpers/shiftPostDetailHelpers";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";




/* ── Company Info + Trust ──────────────────────── */

export function CompanyInfoSection({ companyName }: { companyName: string }) {
  return (
    <div className="wm-ee-card" style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)", marginBottom: 6 }}>
        Company info
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text, #1e293b)" }}>
        {cap(companyName)}
      </div>
      <EmployerTrustBadge variant="full" />
    </div>
  );
}

/* ── What We Provide ───────────────────────────── */

export function WhatWeProvideSection({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="wm-ee-card" style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)", marginBottom: 10 }}>
        What we provide
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((pid) => {
          const item = PROVIDE_MAP[pid];
          if (!item) return null;
          return (
            <span key={pid} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: "rgba(22,163,74,0.08)", color: "var(--wm-er-accent-shift, #16a34a)",
              border: "1px solid rgba(22,163,74,0.2)",
            }}>
              <span>{item.icon}</span>{item.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── Job Type Badge ────────────────────────────── */

export function JobTypeBadge({ jobType }: { jobType?: string }) {
  if (!jobType || jobType === "one-time") return null;
  return (
    <div style={{ marginTop: 10 }}>
      <span style={{
        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
        background: "rgba(22,163,74,0.08)", color: "var(--wm-er-accent-shift, #16a34a)",
        border: "1px solid rgba(22,163,74,0.2)",
      }}>
        {jobType === "weekly" ? "🔄 Weekly recurring" : "🔄 Custom recurring"}
      </span>
    </div>
  );
}

/* ── Dress Code ────────────────────────────────── */

export function DressCodeSection({ dressCode }: { dressCode?: string }) {
  if (!dressCode) return null;
  return (
    <div className="wm-ee-card" style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)", marginBottom: 6 }}>
        Dress code
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text, #1e293b)", lineHeight: 1.6 }}>
        {dressCode}
      </div>
    </div>
  );
}

/* ── Already Applied ───────────────────────────── */

export function AlreadyAppliedSection({ onWithdraw }: { onWithdraw: () => void }) {
  return (
    <div className="wm-ee-card" style={{ marginTop: 12, marginBottom: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-text, #1e293b)" }}>You already applied</div>
      <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted, #64748b)" }}>
        If you cannot attend, withdraw your application.
      </div>
      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <button className="wm-dangerBtn" type="button" onClick={onWithdraw}>Withdraw application</button>
      </div>
    </div>
  );
}

/* ── Toast ──────────────────────────────────────── */

export function ShiftToast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      padding: "10px 20px", borderRadius: 10, background: "var(--wm-er-accent-shift, #16a34a)",
      color: "#fff", fontSize: 13, fontWeight: 600, zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}>
      {message}
    </div>
  );
}