// src/features/employer/shiftJobs/components/ShiftCreateConfirmModal.tsx

import { CenterModal } from "../../../../shared/components/CenterModal";

type Props = {
  open: boolean;
  jobName: string;
  companyName: string;
  workers: number;
  payPerDay: number;
  locationName: string;
  dateRange: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function cap(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const ICON_WRAP: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center",
  justifyContent: "center", background: "rgba(22,163,74,0.08)", color: "#16a34a", flexShrink: 0,
};

const SUMMARY_CARD: React.CSSProperties = {
  marginTop: 16, background: "#f9fafb", borderRadius: 12, padding: 14,
};

const DETAIL_ROW: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12, color: "#6b7280",
};

const DETAIL_ICON: React.CSSProperties = {
  width: 16, height: 16, flexShrink: 0, color: "#9ca3af",
};

const WARNING_BOX: React.CSSProperties = {
  marginTop: 14, padding: "10px 12px", borderRadius: 10,
  background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.15)",
  display: "flex", alignItems: "flex-start", gap: 8,
};

const BTN_ROW: React.CSSProperties = {
  marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
};

const BTN_BASE: React.CSSProperties = {
  padding: "12px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center",
};

export function ShiftCreateConfirmModal({ open, jobName, companyName, workers, payPerDay, locationName, dateRange, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <CenterModal open={open} onBackdropClose={onCancel} ariaLabel="Confirm shift post" maxWidth={400}>
      <div style={{ padding: "24px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={ICON_WRAP}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--wm-er-text)" }}>Ready to post?</div>
        </div>

        {/* Summary Card */}
        <div style={SUMMARY_CARD}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--wm-er-text)" }}>{cap(jobName)}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#16a34a" }}>{payPerDay > 0 ? `${payPerDay} / day` : ""}</div>
          </div>

          <div style={DETAIL_ROW}>
            <svg style={DETAIL_ICON} viewBox="0 0 24 24"><path fill="currentColor" d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z" /></svg>
            <span>{cap(companyName)} · {workers} worker{workers !== 1 ? "s" : ""}</span>
          </div>

          {locationName.trim() && (
            <div style={DETAIL_ROW}>
              <svg style={DETAIL_ICON} viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>
              <span>{locationName.trim()}</span>
            </div>
          )}

          {dateRange && (
            <div style={DETAIL_ROW}>
              <svg style={DETAIL_ICON} viewBox="0 0 24 24"><path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v14A2.5 2.5 0 0 1 19.5 23h-15A2.5 2.5 0 0 1 2 20.5v-14A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Z" /></svg>
              <span>{dateRange}</span>
            </div>
          )}
        </div>

        {/* Warning */}
        <div style={WARNING_BOX}>
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
            <path fill="#d97706" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
          </svg>
          <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
            This post will be visible to workers immediately after creation.
          </div>
        </div>

        {/* Buttons */}
        <div style={BTN_ROW}>
          <button type="button" onClick={onCancel} style={{ ...BTN_BASE, border: "1.5px solid #d1d5db", background: "#fff", color: "var(--wm-er-text)" }}>
            Review Again
          </button>
          <button type="button" onClick={onConfirm} style={{ ...BTN_BASE, border: "none", background: "#16a34a", color: "#fff" }}>
            Create Post
          </button>
        </div>
      </div>
    </CenterModal>
  );
}