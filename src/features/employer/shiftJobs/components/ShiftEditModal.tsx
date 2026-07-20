// App name: Job Mitra
// File name: ShiftEditModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftEditModal.tsx

import { useState } from "react";
import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";

type ShiftPayBasis = NonNullable<ShiftPost["payBasis"]>;

type PayBasisOption = {
  value: ShiftPayBasis;
  label: string;
  helper: string;
};

const PAY_BASIS_OPTIONS: PayBasisOption[] = [
  {
    value: "per_hour",
    label: "Per hour",
    helper: "Best for hourly markets and shorter shifts.",
  },
  {
    value: "per_day",
    label: "Per day",
    helper: "Best for daily wage or full-day work.",
  },
  {
    value: "fixed_total",
    label: "Fixed total",
    helper: "Best when the whole work has one total amount.",
  },
  {
    value: "not_listed",
    label: "Not listed / Discuss later",
    helper: "Use when pay is not ready to publish.",
  },
];

function toDateStr(epoch: number): string {
  try {
    const d = new Date(epoch);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

function toEpoch(value: string): number {
  try {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d.getTime() : Date.now();
  } catch {
    return Date.now();
  }
}

function todayStr(): string {
  return toDateStr(Date.now());
}

function formatShiftPayDisplay(amount: number, payBasis: ShiftPayBasis): string {
  if (payBasis === "not_listed") return "Pay not listed";
  if (payBasis === "per_hour") return amount > 0 ? `${amount} / hour` : "___ / hour";
  if (payBasis === "fixed_total") return amount > 0 ? `${amount} total` : "___ total";

  return amount > 0 ? `${amount} / day` : "___ / day";
}

type EditFields = {
  jobName: string;
  description: string;
  shiftTiming: string;
  payPerDayStr: string;
  payBasis: ShiftPayBasis;
  startDateStr: string;
  endDateStr: string;
  locationName: string;
  dressCode: string;
};

type Props = {
  post: ShiftPost;
  onSave: (updates: {
    jobName?: string;
    description?: string;
    shiftTiming?: string;
    payPerDay?: number;
    payBasis?: ShiftPayBasis;
    startAt?: number;
    endAt?: number;
    locationName?: string;
    dressCode?: string;
  }) => void;
  onClose: () => void;
};

export function ShiftEditModal({ post, onSave, onClose }: Props) {
  const [fields, setFields] = useState<EditFields>({
    jobName: post.jobName,
    description: post.description ?? "",
    shiftTiming: post.shiftTiming ?? "",
    payPerDayStr: post.payBasis === "not_listed" ? "" : String(post.payPerDay),
    payBasis: post.payBasis ?? "per_day",
    startDateStr: toDateStr(post.startAt),
    endDateStr: toDateStr(post.endAt),
    locationName: post.locationName,
    dressCode: post.dressCode ?? "",
  });

  const hasConfirmed = post.confirmedIds.length > 0;
  const pay = Number(fields.payPerDayStr) || 0;
  const payInputDisabled = fields.payBasis === "not_listed";
  const selectedPayHelper =
    PAY_BASIS_OPTIONS.find((option) => option.value === fields.payBasis)?.helper ?? "";
  const canSave = fields.jobName.trim().length > 0 && (fields.payBasis === "not_listed" || pay > 0);

  function set<K extends keyof EditFields>(key: K, value: EditFields[K]): void {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handlePayBasis(value: ShiftPayBasis): void {
    setFields((current) => ({
      ...current,
      payBasis: value,
      payPerDayStr: value === "not_listed" ? "" : current.payPerDayStr,
    }));
  }

  function handleSave(): void {
    if (!fields.jobName.trim()) return;
    if (fields.payBasis !== "not_listed" && pay <= 0) return;

    onSave({
      jobName: fields.jobName.trim(),
      description: fields.description.trim(),
      shiftTiming: fields.shiftTiming.trim(),
      payPerDay: fields.payBasis === "not_listed" ? 0 : pay,
      payBasis: fields.payBasis,
      startAt: toEpoch(fields.startDateStr),
      endAt: toEpoch(fields.endDateStr),
      locationName: fields.locationName.trim(),
      dressCode: fields.dressCode.trim() || undefined,
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--wm-er-card, #fff)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 420,
          maxHeight: "92vh",
          overflow: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 18px 12px",
            borderBottom: "1px solid var(--wm-er-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
              Edit Shift
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              {post.jobName} - {post.companyName}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--wm-er-muted)",
              fontSize: 18,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {hasConfirmed && (
          <div
            style={{
              margin: "12px 18px 0",
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(217,119,6,0.07)",
              border: "1px solid rgba(217,119,6,0.2)",
              fontSize: 12,
              color: "#92400e",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {post.confirmedIds.length} confirmed worker{post.confirmedIds.length !== 1 ? "s" : ""}{" "}
            will be notified of these changes.
          </div>
        )}

        <div style={{ padding: "14px 18px", display: "grid", gap: 12 }}>
          <div>
            <div className="wm-label">
              Job Title <span style={{ color: "var(--wm-error)" }}>*</span>
            </div>
            <input
              className="wm-input"
              value={fields.jobName}
              onChange={(event) => set("jobName", event.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <div className="wm-label">
              Location <span style={{ color: "var(--wm-error)" }}>*</span>
            </div>
            <input
              className="wm-input"
              value={fields.locationName}
              onChange={(event) => set("locationName", event.target.value)}
              maxLength={150}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div className="wm-label">Start Date</div>
              <input
                className="wm-input"
                type="date"
                value={fields.startDateStr}
                min={todayStr()}
                onChange={(event) => set("startDateStr", event.target.value)}
              />
            </div>

            <div>
              <div className="wm-label">End Date</div>
              <input
                className="wm-input"
                type="date"
                value={fields.endDateStr}
                min={fields.startDateStr}
                onChange={(event) => set("endDateStr", event.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="wm-label">
              Pay Basis <span style={{ color: "var(--wm-error)" }}>*</span>
            </div>
            <select
              className="wm-input"
              value={fields.payBasis}
              onChange={(event) => handlePayBasis(event.target.value as ShiftPayBasis)}
            >
              {PAY_BASIS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div
              style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}
            >
              {selectedPayHelper}
            </div>
          </div>

          <div>
            <div className="wm-label">
              Pay Amount{" "}
              {fields.payBasis !== "not_listed" && (
                <span style={{ color: "var(--wm-error)" }}>*</span>
              )}
            </div>
            <input
              className="wm-input"
              value={payInputDisabled ? "" : fields.payPerDayStr}
              onChange={(event) => set("payPerDayStr", event.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              maxLength={7}
              disabled={payInputDisabled}
              placeholder={
                payInputDisabled
                  ? "Not required when pay is not listed"
                  : "Amount without currency symbol"
              }
            />

            <div
              style={{
                marginTop: 6,
                padding: "9px 12px",
                borderRadius: 14,
                background: "rgba(22,163,74,0.06)",
                border: "1px solid rgba(22,163,74,0.16)",
                fontSize: 11,
                color: "var(--wm-er-muted)",
                lineHeight: 1.45,
              }}
            >
              Workers will see:{" "}
              <b style={{ color: "var(--wm-er-text)" }}>
                {formatShiftPayDisplay(pay, fields.payBasis)}
              </b>
            </div>
          </div>

          <div>
            <div className="wm-label">Shift Timing</div>
            <input
              className="wm-input"
              value={fields.shiftTiming}
              onChange={(event) => set("shiftTiming", event.target.value)}
              placeholder="e.g. 8:00 AM - 5:00 PM"
              maxLength={50}
            />
          </div>

          <div>
            <div className="wm-label">Dress Code</div>
            <input
              className="wm-input"
              value={fields.dressCode}
              onChange={(event) => set("dressCode", event.target.value)}
              placeholder="e.g. Black trousers and white shirt"
              maxLength={200}
            />
          </div>

          <div>
            <div className="wm-label">Description</div>
            <textarea
              className="wm-input"
              value={fields.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Job description..."
              maxLength={500}
              style={{ height: 80, paddingTop: 10, fontFamily: "inherit" }}
            />
          </div>
        </div>

        <div
          style={{
            padding: "12px 18px 16px",
            borderTop: "1px solid var(--wm-er-border)",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <button className="wm-outlineBtn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="wm-primarybtn" type="button" onClick={handleSave} disabled={!canSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
