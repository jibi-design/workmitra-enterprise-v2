// src/features/employee/employment/components/ResignationModal.tsx
import { useState } from "react";

type Props = {
  companyName: string;
  jobTitle: string;
  onSubmit: (note: string, preferredLastDate: number) => void;
  onClose: () => void;
};

function formatDateInput(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ResignationModal({ companyName, jobTitle, onSubmit, onClose }: Props) {
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [note, setNote] = useState("");
  const [nowMs] = useState(() => Date.now());
  const [dateStr, setDateStr] = useState(() => {
    const twoWeeks = Date.now() + 14 * 86400000;
    return formatDateInput(twoWeeks);
  });

  const minDate = formatDateInput(nowMs + 86400000);

  const parsedDate = new Date(dateStr + "T00:00:00").getTime();
  const dateValid = !Number.isNaN(parsedDate) && parsedDate > nowMs;

  const handleNext = () => {
    if (!dateValid) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    onSubmit(note.trim(), parsedDate);
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 800,
    color: "var(--wm-emp-text, var(--wm-er-text))",
    marginBottom: 6,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1.5px solid rgba(0,0,0,0.12)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--wm-emp-text, var(--wm-er-text))",
    background: "var(--wm-emp-surface, #f8fafc)",
    outline: "none",
    boxSizing: "border-box",
  };

  if (step === "form") {
    return (
      <div role="dialog" aria-modal="true" style={overlayStyle} onClick={onClose}>
        <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "#dc2626", marginBottom: 4 }}>
            Submit Resignation
          </div>
          <div style={{ fontSize: 13, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginBottom: 16 }}>
            {jobTitle} at {companyName}
          </div>

          <label style={labelStyle}>
            Reason (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why are you leaving? (optional)"
              maxLength={500}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", marginTop: 4 }}
            />
          </label>

          <label style={{ ...labelStyle, marginTop: 14 }}>
            Preferred Last Working Date
            <input
              type="date"
              value={dateStr}
              min={minDate}
              onChange={(e) => setDateStr(e.target.value)}
              style={{ ...inputStyle, marginTop: 4 }}
            />
          </label>

          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "1.5px solid rgba(0,0,0,0.12)",
                background: "transparent",
                fontWeight: 800,
                fontSize: 13,
                color: "var(--wm-emp-text, var(--wm-er-text))",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!dateValid}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: dateValid ? "#dc2626" : "#e5e7eb",
                color: dateValid ? "#fff" : "#9ca3af",
                fontWeight: 900,
                fontSize: 13,
                cursor: dateValid ? "pointer" : "not-allowed",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal="true" style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#dc2626",
            fontWeight: 900,
            fontSize: 16,
            marginBottom: 12,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
          </svg>
          Confirm Resignation
        </div>

        <div
          style={{
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.15)",
            borderRadius: 12,
            padding: 14,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--wm-emp-text, var(--wm-er-text))",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Please read carefully:</div>
          <div>Your employer must accept your resignation for the exit to be processed.</div>
          <div style={{ marginTop: 4 }}>
            Your verified work history will update <strong>only after</strong> your employer confirms the exit.
          </div>
          <div style={{ marginTop: 4 }}>
            Until then, your Work Vault profile will continue to show this as an active employment.
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={() => setStep("form")}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1.5px solid rgba(0,0,0,0.12)",
              background: "transparent",
              fontWeight: 800,
              fontSize: 13,
              color: "var(--wm-emp-text, var(--wm-er-text))",
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "#dc2626",
              color: "#fff",
              fontWeight: 900,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Submit Resignation
          </button>
        </div>
      </div>
    </div>
  );
}