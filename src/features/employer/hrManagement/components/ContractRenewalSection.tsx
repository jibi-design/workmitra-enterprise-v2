// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ContractRenewalSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\ContractRenewalSection.tsx

import { useState } from "react";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import type { ContractType, HRCandidateRecord } from "../types/hrManagement.types";
import { ContractRenewalCurrentInfo } from "./contractRenewal/ContractRenewalCurrentInfo";
import { ContractSetupForm } from "./contractRenewal/ContractSetupForm";

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
  const [contractType, setContractType] = useState<ContractType>(
    record.contractType || "permanent",
  );
  const [endDateStr, setEndDateStr] = useState("");
  const [renewDateStr, setRenewDateStr] = useState("");
  const [renewNote, setRenewNote] = useState("");

  const fmtDate = (timestamp: number) =>
    timestamp
      ? new Date(timestamp).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const daysUntil = (timestamp: number) => {
    const diff = Math.ceil((timestamp - nowMs) / 86400000);
    return diff;
  };

  const handleSetContract = () => {
    const endTimestamp =
      contractType === "fixed_term" && endDateStr
        ? new Date(`${endDateStr}T00:00:00`).getTime()
        : undefined;

    hrManagementStorage.setContractDetails(record.id, contractType, endTimestamp);
    setShowSetup(false);
    setEndDateStr("");
  };

  const handleRenew = () => {
    if (!renewDateStr || !renewNote.trim()) return;

    const newEndTimestamp = new Date(`${renewDateStr}T00:00:00`).getTime();

    hrManagementStorage.renewContract(record.id, newEndTimestamp, renewNote);
    setShowRenew(false);
    setRenewDateStr("");
    setRenewNote("");
  };

  const hasContract = Boolean(record.contractType);
  const isFixedTerm = record.contractType === "fixed_term";
  const hasEndDate = isFixedTerm && Boolean(record.contractEndDate);
  const daysLeft = hasEndDate ? daysUntil(record.contractEndDate!) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
  const isOverdue = daysLeft !== null && daysLeft <= 0;

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: `1px solid ${
          isOverdue
            ? "rgba(220,38,38,0.3)"
            : isExpiringSoon
              ? "rgba(217,119,6,0.3)"
              : "var(--wm-er-border, #e5e7eb)"
        }`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
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

      {hasContract && !showSetup && (
        <ContractRenewalCurrentInfo
          record={record}
          contractLabels={CONTRACT_LABELS}
          showRenew={showRenew}
          renewDateStr={renewDateStr}
          renewNote={renewNote}
          hasEndDate={hasEndDate}
          isFixedTerm={isFixedTerm}
          daysLeft={daysLeft}
          isExpiringSoon={isExpiringSoon}
          isOverdue={isOverdue}
          fmtDate={fmtDate}
          onShowRenew={() => setShowRenew(true)}
          onRenewDateChange={setRenewDateStr}
          onRenewNoteChange={setRenewNote}
          onCancelRenew={() => {
            setShowRenew(false);
            setRenewDateStr("");
            setRenewNote("");
          }}
          onConfirmRenew={handleRenew}
        />
      )}

      {!hasContract && !showSetup && (
        <div
          style={{
            textAlign: "center",
            padding: "12px 0",
            color: "var(--wm-er-muted)",
            fontSize: 13,
          }}
        >
          Contract type not set yet.
        </div>
      )}

      {showSetup && (
        <ContractSetupForm
          contractType={contractType}
          endDateStr={endDateStr}
          contractLabels={CONTRACT_LABELS}
          onContractTypeChange={setContractType}
          onEndDateChange={setEndDateStr}
          onCancel={() => setShowSetup(false)}
          onSave={handleSetContract}
        />
      )}
    </div>
  );
}
