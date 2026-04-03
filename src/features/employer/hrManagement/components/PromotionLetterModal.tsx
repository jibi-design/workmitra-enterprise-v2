// src/features/employer/hrManagement/components/PromotionLetterModal.tsx
//
// 2-step modal: Fill form → Preview → Send promotion letter.
// Auto-updates HR record (jobTitle, department) on send.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { PromotionLetterData } from "../types/letterTemplates.types";
import { letterTemplatesStorage } from "../storage/letterTemplates.storage";
import { hrManagementStorage } from "../storage/hrManagement.storage";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
};

type FormState = {
  newTitle: string;
  newDepartment: string;
  effectiveDate: string;
  newSalary: string;
  reason: string;
};

const INITIAL_FORM: FormState = {
  newTitle: "",
  newDepartment: "",
  effectiveDate: "",
  newSalary: "",
  reason: "",
};

export function PromotionLetterModal({ open, onClose, record }: Props) {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  if (!open) return null;

  const set = (key: keyof FormState, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const canPreview = form.newTitle.trim() && form.effectiveDate && form.reason.trim();

  const effectiveTs = form.effectiveDate
    ? new Date(form.effectiveDate + "T00:00:00").getTime()
    : 0;

  const fmtDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const handleSend = () => {
    const letterData: PromotionLetterData = {
      employeeName: record.employeeName,
      previousTitle: record.jobTitle,
      newTitle: form.newTitle.trim(),
      previousDepartment: record.department || "—",
      newDepartment: form.newDepartment.trim() || record.department || "—",
      effectiveDate: effectiveTs,
      newSalary: form.newSalary.trim(),
      reason: form.reason.trim(),
    };

    letterTemplatesStorage.createLetter({
      hrCandidateId: record.id,
      employeeUniqueId: record.employeeUniqueId,
      employeeName: record.employeeName,
      kind: "promotion",
      letterData: { kind: "promotion", data: letterData },
    });

    // Auto-update HR record
    hrManagementStorage.applyPromotion(record.id, {
      newTitle: form.newTitle.trim(),
      newDepartment: form.newDepartment.trim() || undefined,
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
            {step === "form" ? "Promotion Letter" : "Preview & Send"}
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
              <strong style={{ color: "var(--wm-er-text)" }}>Current:</strong> {record.jobTitle}
              {record.department ? ` · ${record.department}` : ""}
            </div>

            <Field label="New Designation / Title *" value={form.newTitle} onChange={(v) => set("newTitle", v)} placeholder="e.g. Senior Manager" />
            <Field label="New Department (leave blank if same)" value={form.newDepartment} onChange={(v) => set("newDepartment", v)} placeholder={record.department || "e.g. Operations"} />
            <div>
              <FieldLabel text="Effective Date *" />
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => set("effectiveDate", e.target.value)}
                style={inputStyle}
              />
            </div>
            <Field label="Revised Salary Note (optional, no currency)" value={form.newSalary} onChange={(v) => set("newSalary", v)} placeholder="e.g. As per revised pay structure" />
            <Field label="Reason for Promotion *" value={form.reason} onChange={(v) => set("reason", v)} placeholder="e.g. Outstanding performance in Q4" multiline />

            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5, padding: "4px 0" }}>
              💡 Sending this letter will automatically update the employee's designation
              {form.newDepartment.trim() ? " and department" : ""} in their HR record.
            </div>

            <button className="wm-primarybtn" type="button" disabled={!canPreview} onClick={() => setStep("preview")}>
              Preview Letter
            </button>
          </div>
        )}

        {step === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <PreviewBlock label="Employee" value={record.employeeName} />
            <PreviewBlock label="Previous Designation" value={record.jobTitle} />
            <PreviewBlock label="New Designation" value={form.newTitle} />
            <PreviewBlock label="Previous Department" value={record.department || "—"} />
            <PreviewBlock label="New Department" value={form.newDepartment.trim() || record.department || "—"} />
            <PreviewBlock label="Effective Date" value={fmtDate(effectiveTs)} />
            {form.newSalary.trim() && <PreviewBlock label="Salary Revision" value={form.newSalary} />}
            <PreviewBlock label="Reason" value={form.reason} />

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