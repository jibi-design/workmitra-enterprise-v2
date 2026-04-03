// src/features/employer/hrManagement/components/ContractRenewalSection.tsx
//
// Contract info + set type + renew/extend actions.
// Shows in HR detail page for active employees.

import { useState } from "react";
import type { HRCandidateRecord, ContractType } from "../types/hrManagement.types";
import { hrManagementStorage } from "../storage/hrManagement.storage";

type Props = {
  record: HRCandidateRecord;
};

const CONTRACT_LABELS: Record<ContractType, string> = {
  permanent: "Permanent",
  fixed_term: "Fixed Term",
};

export function ContractRenewalSection({ record }: Props) {
  const [nowMs] = useState(() => Date.now());
  const [showSetup, setShowSetup] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [contractType, setContractType] = useState<ContractType>(record.contractType || "permanent");
  const [endDateStr, setEndDateStr] = useState("");
  const [renewDateStr, setRenewDateStr] = useState("");
  const [renewNote, setRenewNote] = useState("");

  const fmtDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const daysUntil = (ts: number) => {
    const diff = Math.ceil((ts - nowMs) / 86400000);
    return diff;
  };

  const handleSetContract = () => {
    const endTs = contractType === "fixed_term" && endDateStr
      ? new Date(endDateStr + "T00:00:00").getTime()
      : undefined;
    hrManagementStorage.setContractDetails(record.id, contractType, endTs);
    setShowSetup(false);
    setEndDateStr("");
  };

  const handleRenew = () => {
    if (!renewDateStr || !renewNote.trim()) return;
    const newEndTs = new Date(renewDateStr + "T00:00:00").getTime();
    hrManagementStorage.renewContract(record.id, newEndTs, renewNote);
    setShowRenew(false);
    setRenewDateStr("");
    setRenewNote("");
  };

  const hasContract = !!record.contractType;
  const isFixedTerm = record.contractType === "fixed_term";
  const hasEndDate = isFixedTerm && !!record.contractEndDate;
  const daysLeft = hasEndDate ? daysUntil(record.contractEndDate!) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
  const isOverdue = daysLeft !== null && daysLeft <= 0;

  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: `1px solid ${isOverdue ? "rgba(220,38,38,0.3)" : isExpiringSoon ? "rgba(217,119,6,0.3)" : "var(--wm-er-border, #e5e7eb)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
          Contract Details
        </div>
        {!showSetup && (
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={() => setShowSetup(true)}
            style={{ fontSize: 11, padding: "5px 12px" }}
          >
            {hasContract ? "Update" : "Set Contract"}
          </button>
        )}
      </div>

      {/* Current contract info */}
      {hasContract && !showSetup && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <InfoRow label="Contract Type" value={CONTRACT_LABELS[record.contractType!]} />
          {hasEndDate && (
            <>
              <InfoRow label="Contract End Date" value={fmtDate(record.contractEndDate!)} />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: isOverdue ? "#dc2626" : isExpiringSoon ? "#d97706" : "#16a34a" }}>
                  {isOverdue
                    ? `⚠ Contract expired ${Math.abs(daysLeft!)} day${Math.abs(daysLeft!) !== 1 ? "s" : ""} ago`
                    : isExpiringSoon
                      ? `⚠ Expiring in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
                      : `✓ ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
                </div>
              </div>
              {/* Progress bar */}
              {record.contractEndDate && (
                <ContractProgressBar
                  startDate={record.contractRenewals?.length
                    ? record.contractRenewals[record.contractRenewals.length - 1].renewedAt
                    : record.movedToHRAt}
                  endDate={record.contractEndDate}
                />
              )}
            </>
          )}
          {!hasEndDate && isFixedTerm && (
            <div style={{ fontSize: 12, color: "#d97706", fontWeight: 700 }}>
              ⚠ Contract end date not set. Please update.
            </div>
          )}

          {/* Renew button */}
          {isFixedTerm && hasEndDate && !showRenew && (
            <button
              className="wm-primarybtn"
              type="button"
              onClick={() => setShowRenew(true)}
              style={{ fontSize: 12, marginTop: 4, alignSelf: "flex-start" }}
            >
              Renew / Extend Contract
            </button>
          )}

          {/* Renew form */}
          {showRenew && (
            <div style={{ marginTop: 4, padding: 12, borderRadius: 10, background: "var(--wm-er-bg, #f9fafb)", border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 8 }}>Renew Contract</div>
              <FieldLabel text="New End Date *" />
              <input type="date" value={renewDateStr} onChange={(e) => setRenewDateStr(e.target.value)} style={inputStyle} />
              <div style={{ marginTop: 8 }}>
                <FieldLabel text="Renewal Note *" />
                <textarea
                  value={renewNote}
                  onChange={(e) => setRenewNote(e.target.value)}
                  placeholder="e.g. Extended for another 6 months due to project continuation"
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowRenew(false); setRenewDateStr(""); setRenewNote(""); }}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--wm-er-border, #e5e7eb)", background: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", color: "var(--wm-er-text)" }}
                >
                  Cancel
                </button>
                <button
                  className="wm-primarybtn"
                  type="button"
                  onClick={handleRenew}
                  disabled={!renewDateStr || !renewNote.trim()}
                  style={{ flex: 1, fontSize: 12 }}
                >
                  Confirm Renewal
                </button>
              </div>
            </div>
          )}

          {/* Renewal history */}
          {record.contractRenewals && record.contractRenewals.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Renewal History</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {record.contractRenewals.map((r) => (
                  <div key={r.id} style={{ padding: 8, borderRadius: 6, background: "var(--wm-er-bg, #f9fafb)", fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>
                      {fmtDate(r.previousEndDate)} → {fmtDate(r.newEndDate)}
                    </div>
                    <div style={{ color: "var(--wm-er-muted)", marginTop: 2 }}>{r.note}</div>
                    <div style={{ color: "var(--wm-er-muted)", marginTop: 2, fontSize: 10 }}>Renewed: {fmtDate(r.renewedAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Not set */}
      {!hasContract && !showSetup && (
        <div style={{ textAlign: "center", padding: "12px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
          Contract type not set yet.
        </div>
      )}

      {/* Setup form */}
      {showSetup && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <FieldLabel text="Contract Type *" />
            <div style={{ display: "flex", gap: 8 }}>
              {(["permanent", "fixed_term"] as ContractType[]).map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setContractType(ct)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1.5px solid ${contractType === ct ? "var(--wm-er-accent-hr)" : "var(--wm-er-border, #e5e7eb)"}`,
                    background: contractType === ct ? "rgba(124, 58, 237,0.06)" : "#fff",
                    color: contractType === ct ? "var(--wm-er-accent-hr)" : "var(--wm-er-muted)",
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {CONTRACT_LABELS[ct]}
                </button>
              ))}
            </div>
          </div>

          {contractType === "fixed_term" && (
            <div>
              <FieldLabel text="Contract End Date *" />
              <input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} style={inputStyle} />
            </div>
          )}

          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            💡 {contractType === "permanent"
              ? "Permanent employees have no contract end date. You can change this later."
              : "Set the contract end date. You will receive reminders before it expires."}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowSetup(false)}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--wm-er-border, #e5e7eb)", background: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", color: "var(--wm-er-text)" }}
            >
              Cancel
            </button>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={handleSetContract}
              disabled={contractType === "fixed_term" && !endDateStr}
              style={{ flex: 1, fontSize: 12 }}
            >
              Save Contract
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */

function ContractProgressBar({ startDate, endDate }: { startDate: number; endDate: number }) {
  const [now] = useState(() => Date.now());
  const total = endDate - startDate;
  const elapsed = now - startDate;
  const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
  const color = pct >= 90 ? "#dc2626" : pct >= 75 ? "#d97706" : "#16a34a";

  return (
    <div style={{ background: "var(--wm-er-bg, #f1f5f9)", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.3s" }} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)" }}>{value}</span>
    </div>
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
      {text}
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
