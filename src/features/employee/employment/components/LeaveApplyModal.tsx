// src/features/employee/employment/components/LeaveApplyModal.tsx
//
// Employee applies for leave.
// 2-step: fill form → confirm.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { leaveManagementStorage } from "../../../employer/hrManagement/storage/leaveManagement.storage";
import type { LeaveType } from "../../../employer/hrManagement/types/leaveManagement.types";
import { LEAVE_TYPE_LABELS } from "../../../employer/hrManagement/types/leaveManagement.types";

type Props = {
  open: boolean;
  onClose: () => void;
  hrCandidateId: string;
  employeeUniqueId: string;
  employeeName: string;
};

const LEAVE_OPTIONS: { value: LeaveType; label: string }[] = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
];

function formatDateInput(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calcDays(from: number, to: number): number {
  return Math.max(1, Math.ceil((to - from) / 86400000) + 1);
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  marginBottom: 4,
  display: "block",
};

export function LeaveApplyModal({ open, onClose, hrCandidateId, employeeUniqueId, employeeName }: Props) {
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [leaveType, setLeaveType] = useState<LeaveType>("annual");
  const [fromDateStr, setFromDateStr] = useState(() => formatDateInput(Date.now() + 86400000));
  const [toDateStr, setToDateStr] = useState(() => formatDateInput(Date.now() + 86400000));
  const [reason, setReason] = useState("");

  const fromTs = new Date(fromDateStr + "T00:00:00").getTime();
  const toTs = new Date(toDateStr + "T00:00:00").getTime();
  const totalDays = fromTs && toTs && toTs >= fromTs ? calcDays(fromTs, toTs) : 0;
  const isValid = fromDateStr.length > 0 && toDateStr.length > 0 && toTs >= fromTs && reason.trim().length > 0;

  const balance = leaveManagementStorage.getBalance(hrCandidateId);
  const currentBalance = balance.find((b) => b.leaveType === leaveType);
  const isUnpaid = (leaveType as string) === "unpaid";
  const hasEnough = isUnpaid || (currentBalance ? currentBalance.remaining >= totalDays : false);

  const handleSubmit = () => {
    leaveManagementStorage.applyLeave({
      hrCandidateId,
      employeeUniqueId,
      employeeName,
      leaveType,
      fromDate: fromTs,
      toDate: toTs,
      reason: reason.trim(),
    });
    handleClose();
  };

  const handleClose = () => {
    setStep("form");
    setReason("");
    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={handleClose} ariaLabel="Apply for Leave" maxWidth={440}>
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
          {step === "form" ? "Apply for Leave" : "Confirm Leave Request"}
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, marginBottom: 14 }}>
          {step === "form"
            ? "Fill in the details for your leave request. Your employer will review and respond."
            : "Please review your leave request before submitting."}
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 999, background: "#2563eb" }} />
          <div style={{ flex: 1, height: 3, borderRadius: 999, background: step === "confirm" ? "#2563eb" : "var(--wm-er-border, #e5e7eb)" }} />
        </div>

        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Leave Type *</label>
              <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)} style={inputStyle}>
                {LEAVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {currentBalance && leaveType !== "unpaid" && (
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                  Balance: {currentBalance.remaining} days remaining ({currentBalance.used} used of {currentBalance.allocated})
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>From Date *</label>
                <input type="date" value={fromDateStr} onChange={(e) => setFromDateStr(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>To Date *</label>
                <input type="date" value={toDateStr} min={fromDateStr} onChange={(e) => setToDateStr(e.target.value)} style={inputStyle} />
              </div>
            </div>
            {totalDays > 0 && (
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", marginTop: -8 }}>
                Total: {totalDays} day{totalDays !== 1 ? "s" : ""}
                {!hasEnough && leaveType !== "unpaid" && (
                  <span style={{ color: "#dc2626", marginLeft: 8 }}>(Exceeds available balance)</span>
                )}
              </div>
            )}

            <div>
              <label style={labelStyle}>Reason *</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why do you need this leave?" maxLength={500} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button className="wm-outlineBtn" type="button" onClick={handleClose}>Cancel</button>
              <button className="wm-primarybtn" type="button" disabled={!isValid} onClick={() => setStep("confirm")} style={{ opacity: isValid ? 1 : 0.5 }}>Review →</button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div>
            <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--wm-er-border, #e5e7eb)", fontSize: 13, color: "var(--wm-er-text)", lineHeight: 1.8 }}>
              <div><strong>Type:</strong> {LEAVE_TYPE_LABELS[leaveType]}</div>
              <div><strong>From:</strong> {formatDateDisplay(fromTs)}</div>
              <div><strong>To:</strong> {formatDateDisplay(toTs)}</div>
              <div><strong>Total Days:</strong> {totalDays}</div>
              <div><strong>Reason:</strong> {reason}</div>
            </div>

            {!hasEnough && !isUnpaid && (
              <div style={{ marginTop: 10, padding: 8, borderRadius: 8, background: "rgba(217, 119, 6, 0.06)", border: "1px solid rgba(217, 119, 6, 0.15)", fontSize: 11, color: "#92400e", fontWeight: 700 }}>
                ⚠ This request exceeds your available balance. Your employer may reject it.
              </div>
            )}

            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="wm-outlineBtn" type="button" onClick={() => setStep("form")}>← Edit</button>
              <button className="wm-primarybtn" type="button" onClick={handleSubmit}>Submit Request</button>
            </div>
          </div>
        )}
      </div>
    </CenterModal>
  );
}