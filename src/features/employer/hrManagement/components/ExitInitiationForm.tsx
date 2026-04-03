// src/features/employer/hrManagement/components/ExitInitiationForm.tsx

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { ExitTrigger } from "../types/exitProcessing.types";
import { EXIT_TRIGGER_LABELS, DEFAULT_CLEARANCE_ITEMS, NOTICE_PERIOD_DEFAULTS } from "../types/exitProcessing.types";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { EXIT_INPUT_STYLE, genClearanceId } from "./exitClearanceStyles";
import { PreviewRow, FieldLabel } from "./exitClearanceHelpers";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type ExitInitiationFormProps = {
  record: HRCandidateRecord;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ExitInitiationForm({ record }: ExitInitiationFormProps) {
  const [trigger, setTrigger] = useState<ExitTrigger>("employee_resigned");
  const [triggerNote, setTriggerNote] = useState("");
  const [waiveNotice, setWaiveNotice] = useState(false);
  const [waivedReason, setWaivedReason] = useState("");
  const [customNoticeDays, setCustomNoticeDays] = useState("");
  const [step, setStep] = useState<"form" | "confirm">("form");

  const defaultNoticeDays = record.employmentPhase === "probation"
    ? NOTICE_PERIOD_DEFAULTS.probation
    : record.contractType === "fixed_term"
      ? NOTICE_PERIOD_DEFAULTS.fixed_term
      : NOTICE_PERIOD_DEFAULTS.confirmed;

  const noticeDays = customNoticeDays ? parseInt(customNoticeDays, 10) : defaultNoticeDays;
  const canProceed = triggerNote.trim().length > 0;

  const triggers: ExitTrigger[] = ["employee_resigned", "employer_terminated", "contract_ended", "mutual_agreement"];

  const handleInitiate = () => {
    const clearanceItems = DEFAULT_CLEARANCE_ITEMS.map((item) => ({
      id: genClearanceId(),
      label: item.label,
      isDefault: true,
    }));

    hrManagementStorage.startExitProcessing(record.id, {
      trigger,
      triggerNote: triggerNote.trim(),
      noticeDays: waiveNotice ? 0 : noticeDays,
      waiveNotice,
      waivedReason: waiveNotice ? waivedReason.trim() : undefined,
      clearanceItems,
    });
  };

  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid rgba(220,38,38,0.2)" }}>
      <div style={{ fontWeight: 900, fontSize: 14, color: "#dc2626", marginBottom: 4 }}>Initiate Exit Process</div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 14, lineHeight: 1.5 }}>
        This will start the full exit clearance flow for {record.employeeName}. You can manage clearance items, send an experience letter, and finalize the exit.
      </div>

      {step === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <FieldLabel text="Exit Reason *" />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {triggers.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrigger(t)}
                  style={{
                    padding: "6px 12px", fontSize: 11, fontWeight: 800, borderRadius: 6,
                    border: `1.5px solid ${trigger === t ? "#dc2626" : "var(--wm-er-border, #e5e7eb)"}`,
                    background: trigger === t ? "rgba(220,38,38,0.06)" : "#fff",
                    color: trigger === t ? "#dc2626" : "var(--wm-er-muted)",
                    cursor: "pointer",
                  }}
                >
                  {EXIT_TRIGGER_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel text="Details / Note *" />
            <textarea
              value={triggerNote}
              onChange={(e) => setTriggerNote(e.target.value)}
              placeholder="e.g. Employee submitted resignation on 15 Mar citing personal reasons"
              rows={2}
              style={{ ...EXIT_INPUT_STYLE, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div>
            <FieldLabel text={`Notice Period (default: ${defaultNoticeDays} days)`} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="number"
                value={customNoticeDays}
                onChange={(e) => setCustomNoticeDays(e.target.value)}
                placeholder={String(defaultNoticeDays)}
                min={0}
                max={365}
                style={{ ...EXIT_INPUT_STYLE, width: 80 }}
              />
              <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>days</span>
            </div>
          </div>

          <div
            onClick={() => setWaiveNotice(!waiveNotice)}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 0" }}
          >
            <div
              style={{
                width: 20, height: 20, borderRadius: 4,
                border: `2px solid ${waiveNotice ? "#dc2626" : "#d1d5db"}`,
                background: waiveNotice ? "#dc2626" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              {waiveNotice && (
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>Waive notice period</span>
          </div>

          {waiveNotice && (
            <div>
              <FieldLabel text="Reason for waiving (optional)" />
              <input
                type="text"
                value={waivedReason}
                onChange={(e) => setWaivedReason(e.target.value)}
                placeholder="e.g. Immediate separation by mutual agreement"
                style={EXIT_INPUT_STYLE}
              />
            </div>
          )}

          <button
            className="wm-primarybtn"
            type="button"
            onClick={() => setStep("confirm")}
            disabled={!canProceed}
            style={{ marginTop: 4 }}
          >
            Review & Confirm
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.04)" }}>
            <PreviewRow label="Employee" value={record.employeeName} />
            <PreviewRow label="Exit Reason" value={EXIT_TRIGGER_LABELS[trigger]} />
            <PreviewRow label="Note" value={triggerNote} />
            <PreviewRow label="Notice Period" value={waiveNotice ? "Waived" : `${noticeDays} days`} />
          </div>

          <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, lineHeight: 1.5 }}>
            This will move the employee to exit processing. The employee will be notified.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => setStep("form")}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--wm-er-border, #e5e7eb)", background: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", color: "var(--wm-er-text)" }}
            >
              ← Edit
            </button>
            <button
              type="button"
              onClick={handleInitiate}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer" }}
            >
              Start Exit Process
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
