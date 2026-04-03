// src/features/employer/hrManagement/components/TransferLetterModal.tsx
//
// 2-step modal: Fill form → Preview → Send transfer letter.
// Auto-updates HR record (location, department) on send.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { TransferLetterData } from "../types/letterTemplates.types";
import { letterTemplatesStorage } from "../storage/letterTemplates.storage";
import { hrManagementStorage } from "../storage/hrManagement.storage";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
};

type FormState = {
  toLocation: string;
  toDepartment: string;
  effectiveDate: string;
  reason: string;
  reportingManager: string;
  remarks: string;
};

const INITIAL_FORM: FormState = {
  toLocation: "",
  toDepartment: "",
  effectiveDate: "",
  reason: "",
  reportingManager: "",
  remarks: "",
};

export function TransferLetterModal({ open, onClose, record }: Props) {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  if (!open) return null;

  const set = (key: keyof FormState, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const canPreview =
    (form.toLocation.trim() || form.toDepartment.trim()) &&
    form.effectiveDate &&
    form.reason.trim();

  const effectiveTs = form.effectiveDate
    ? new Date(form.effectiveDate + "T00:00:00").getTime()
    : 0;

  const fmtDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const handleSend = () => {
    const newLocation = form.toLocation.trim() || record.location || "—";
    const newDepartment = form.toDepartment.trim() || record.department || "—";

    const letterData: TransferLetterData = {
      employeeName: record.employeeName,
      jobTitle: record.jobTitle,
      fromLocation: record.location || "—",
      toLocation: newLocation,
      fromDepartment: record.department || "—",
      toDepartment: newDepartment,
      effectiveDate: effectiveTs,
      reason: form.reason.trim(),
    };

    letterTemplatesStorage.createLetter({
      hrCandidateId: record.id,
      employeeUniqueId: record.employeeUniqueId,
      employeeName: record.employeeName,
      kind: "transfer",
      letterData: { kind: "transfer", data: letterData },
    });

    // Auto-update HR record
    hrManagementStorage.applyTransfer(record.id, {
      newLocation: form.toLocation.trim() || undefined,
      newDepartment: form.toDepartment.trim() || undefined,
    });

    setForm(INITIAL_FORM);
    setStep("form");
    onClose();
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setStep("form");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px 16px 0 0",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflow: "auto",
          padding: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
            {step === "form" ? "Transfer Letter" : "Preview & Send"}
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--wm-er-muted)" }}
          >
            ×
          </button>
        </div>

        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Current info */}
            <div style={{ padding: 10, borderRadius: 8, background: "var(--wm-er-bg, #f9fafb)", fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--wm-er-text)" }}>Current:</strong> {record.location || "—"}
              {record.department ? ` · ${record.department}` : ""}
            </div>

            <Field label="Transfer To — Location *" value={form.toLocation} onChange={(v) => set("toLocation", v)} placeholder="e.g. Branch Office — North Region" />
            <Field label="New Department (leave blank if same)" value={form.toDepartment} onChange={(v) => set("toDepartment", v)} placeholder={record.department || "e.g. Logistics"} />
            <div>
              <FieldLabel text="Effective Date *" />
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => set("effectiveDate", e.target.value)}
                style={inputStyle}
              />
            </div>
            <Field label="Reason for Transfer *" value={form.reason} onChange={(v) => set("reason", v)} placeholder="e.g. Operational requirement" multiline />
            <Field label="Reporting Manager at New Location (optional)" value={form.reportingManager} onChange={(v) => set("reportingManager", v)} placeholder="e.g. Sarah Johnson" />
            <Field label="Additional Remarks (optional)" value={form.remarks} onChange={(v) => set("remarks", v)} placeholder="Any additional notes" multiline />

            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5, padding: "4px 0" }}>
              💡 Sending this letter will automatically update the employee's location
              {form.toDepartment.trim() ? " and department" : ""} in their HR record.
            </div>

            <button className="wm-primarybtn" type="button" disabled={!canPreview} onClick={() => setStep("preview")}>
              Preview Letter
            </button>
          </div>
        )}

        {step === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <PreviewBlock label="Employee" value={record.employeeName} />
            <PreviewBlock label="Designation" value={record.jobTitle} />
            <PreviewBlock label="Transfer From" value={record.location || "—"} />
            <PreviewBlock label="Transfer To" value={form.toLocation.trim() || record.location || "—"} />
            <PreviewBlock label="Previous Department" value={record.department || "—"} />
            <PreviewBlock label="New Department" value={form.toDepartment.trim() || record.department || "—"} />
            <PreviewBlock label="Effective Date" value={fmtDate(effectiveTs)} />
            <PreviewBlock label="Reason" value={form.reason} />
            {form.reportingManager.trim() && <PreviewBlock label="New Reporting Manager" value={form.reportingManager} />}
            {form.remarks.trim() && <PreviewBlock label="Remarks" value={form.remarks} />}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="wm-outlineBtn" type="button" onClick={() => setStep("form")} style={{ flex: 1 }}>
                ← Edit
              </button>
              <button className="wm-primarybtn" type="button" onClick={handleSend} style={{ flex: 1 }}>
                Send Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tiny helpers ── */

function FieldLabel({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
      {text}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <FieldLabel text={label} />
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function PreviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 10, borderRadius: 8, background: "var(--wm-er-bg, #f9fafb)" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 2, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 600,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  color: "var(--wm-er-text)",
  background: "#fff",
  boxSizing: "border-box",
};