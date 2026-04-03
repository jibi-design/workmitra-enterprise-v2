// src/features/employer/hrManagement/components/ExitClearanceSection.tsx
//
// Full exit processing view: trigger info, notice period,
// clearance checklist, settlement note, finalize exit.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { ExitTrigger } from "../types/exitProcessing.types";
import { EXIT_TRIGGER_LABELS } from "../types/exitProcessing.types";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { ExitClearanceChecklist } from "./ExitClearanceChecklist";
import { ExitInitiationForm } from "./ExitInitiationForm";
import { InfoRow } from "./exitClearanceHelpers";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  record: HRCandidateRecord;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ExitClearanceSection({ record }: Props) {
  const [nowMs] = useState(() => Date.now());
  const [settlementNote, setSettlementNote] = useState(record.exitData?.settlementNote || "");
  const [showConfirmFinalize, setShowConfirmFinalize] = useState(false);

  /* If exit not yet initiated, show initiation form */
  if (!record.exitData) {
    return <ExitInitiationForm record={record} />;
  }

  const exitData = record.exitData;
  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const noticeDaysLeft = exitData.noticePeriod.waived
    ? 0
    : Math.max(0, Math.ceil((exitData.noticePeriod.endDate - nowMs) / 86400000));

  const allCleared = exitData.clearanceItems.every((i) => i.completedAt);
  const canFinalize = allCleared && exitData.experienceLetterSent;

  const handleSaveSettlement = () => {
    hrManagementStorage.saveSettlementNote(record.id, settlementNote);
  };

  const handleFinalize = () => {
    hrManagementStorage.completeExit(record.id);
    setShowConfirmFinalize(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Exit info card */}
      <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid rgba(220,38,38,0.2)" }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "#dc2626", marginBottom: 10 }}>Exit Processing</div>

        <InfoRow label="Reason" value={EXIT_TRIGGER_LABELS[exitData.trigger as ExitTrigger] || exitData.trigger} />
        {exitData.triggerNote && <InfoRow label="Note" value={exitData.triggerNote} />}
        <InfoRow label="Initiated" value={fmtDate(exitData.initiatedAt)} />

        {/* Notice period */}
        <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "var(--wm-er-bg, #f9fafb)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Notice Period</div>
          {exitData.noticePeriod.waived ? (
            <div style={{ fontSize: 12, fontWeight: 700, color: "#d97706" }}>
              Notice period waived{exitData.noticePeriod.waivedReason ? ` – ${exitData.noticePeriod.waivedReason}` : ""}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
                {exitData.noticePeriod.totalDays} days ({fmtDate(exitData.noticePeriod.startDate)} – {fmtDate(exitData.noticePeriod.endDate)})
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: noticeDaysLeft > 0 ? "#d97706" : "#16a34a", marginTop: 4 }}>
                {noticeDaysLeft > 0
                  ? `${noticeDaysLeft} day${noticeDaysLeft !== 1 ? "s" : ""} remaining`
                  : "✓ Notice period completed"}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Clearance checklist */}
      <ExitClearanceChecklist recordId={record.id} exitData={exitData} />

      {/* Settlement note */}
      <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 8 }}>Final Settlement Note</div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 8, lineHeight: 1.5 }}>
          Record any settlement details. This is a text note for your records – no calculations are done here.
        </div>
        <textarea
          value={settlementNote}
          onChange={(e) => setSettlementNote(e.target.value)}
          placeholder="e.g. All pending dues cleared. Final payment processed on exit date."
          rows={3}
          style={{
            width: "100%", padding: "10px 12px", fontSize: 13, fontWeight: 600,
            border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 8, outline: "none",
            color: "var(--wm-er-text)", background: "#fff", boxSizing: "border-box",
            resize: "vertical", fontFamily: "inherit",
          }}
        />
        <button
          className="wm-outlineBtn"
          type="button"
          onClick={handleSaveSettlement}
          style={{ marginTop: 8, fontSize: 11, padding: "6px 14px" }}
        >
          Save Note
        </button>
      </div>

      {/* Experience letter status */}
      <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: `1px solid ${exitData.experienceLetterSent ? "rgba(22,163,74,0.2)" : "var(--wm-er-border, #e5e7eb)"}` }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 8 }}>Experience Letter</div>
        {exitData.experienceLetterSent ? (
          <div style={{ fontSize: 12, fontWeight: 800, color: "#16a34a" }}>✓ Experience letter has been sent</div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            Generate the experience letter from the Letters section above. Once sent, it will be marked here automatically.
          </div>
        )}
      </div>

      {/* Finalize exit */}
      {exitData.exitCompletedAt ? (
        <div style={{ padding: 16, background: "rgba(22,163,74,0.04)", borderRadius: 12, border: "1px solid rgba(22,163,74,0.2)", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#16a34a" }}>✓ Exit Completed</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>Finalized on {fmtDate(exitData.exitCompletedAt)}</div>
        </div>
      ) : (
        <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
          {!showConfirmFinalize ? (
            <>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 10, lineHeight: 1.5 }}>
                To finalize the exit, you must complete all clearance items and send an experience letter.
              </div>
              <button
                className="wm-primarybtn"
                type="button"
                onClick={() => setShowConfirmFinalize(true)}
                disabled={!canFinalize}
                style={{ width: "100%", fontSize: 13 }}
              >
                Finalize Exit
              </button>
              {!canFinalize && (
                <div style={{ fontSize: 11, color: "#d97706", marginTop: 6, textAlign: "center" }}>
                  {!allCleared && "Complete all clearance items. "}
                  {!exitData.experienceLetterSent && "Send experience letter first."}
                </div>
              )}
            </>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#dc2626", marginBottom: 8 }}>
                Are you sure you want to finalize this exit?
              </div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 12, lineHeight: 1.5 }}>
                This action cannot be undone. The employee's record will be marked as exited and their Work Vault will be updated.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmFinalize(false)}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--wm-er-border, #e5e7eb)", background: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", color: "var(--wm-er-text)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalize}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer" }}
                >
                  Confirm Exit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
