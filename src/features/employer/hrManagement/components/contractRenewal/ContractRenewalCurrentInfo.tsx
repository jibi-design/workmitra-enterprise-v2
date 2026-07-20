// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ContractRenewalCurrentInfo.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\contractRenewal\ContractRenewalCurrentInfo.tsx

import type { HRCandidateRecord, ContractType } from "../../types/hrManagement.types";
import { ContractProgressBar, FieldLabel, InfoRow } from "./contractRenewalUi";
import { ContractRenewalForm } from "./ContractRenewalForm";

type Props = {
  record: HRCandidateRecord;
  contractLabels: Record<ContractType, string>;
  showRenew: boolean;
  renewDateStr: string;
  renewNote: string;
  hasEndDate: boolean;
  isFixedTerm: boolean;
  daysLeft: number | null;
  isExpiringSoon: boolean;
  isOverdue: boolean;
  fmtDate: (timestamp: number) => string;
  onShowRenew: () => void;
  onRenewDateChange: (value: string) => void;
  onRenewNoteChange: (value: string) => void;
  onCancelRenew: () => void;
  onConfirmRenew: () => void;
};

export function ContractRenewalCurrentInfo({
  record,
  contractLabels,
  showRenew,
  renewDateStr,
  renewNote,
  hasEndDate,
  isFixedTerm,
  daysLeft,
  isExpiringSoon,
  isOverdue,
  fmtDate,
  onShowRenew,
  onRenewDateChange,
  onRenewNoteChange,
  onCancelRenew,
  onConfirmRenew,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <InfoRow label="Contract Type" value={contractLabels[record.contractType!]} />

      {hasEndDate && (
        <>
          <InfoRow label="Contract End Date" value={fmtDate(record.contractEndDate!)} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: isOverdue ? "#dc2626" : isExpiringSoon ? "#d97706" : "#16a34a",
              }}
            >
              {isOverdue
                ? `Contract expired ${Math.abs(daysLeft!)} day${Math.abs(daysLeft!) !== 1 ? "s" : ""} ago`
                : isExpiringSoon
                  ? `Expiring in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
                  : `Remaining ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
            </div>
          </div>

          {record.contractEndDate && (
            <ContractProgressBar
              startDate={
                record.contractRenewals?.length
                  ? record.contractRenewals[record.contractRenewals.length - 1].renewedAt
                  : record.movedToHRAt
              }
              endDate={record.contractEndDate}
            />
          )}
        </>
      )}

      {!hasEndDate && isFixedTerm && (
        <div style={{ fontSize: 12, color: "#d97706", fontWeight: 700 }}>
          Contract end date not set. Please update.
        </div>
      )}

      {isFixedTerm && hasEndDate && !showRenew && (
        <button
          className="wm-primarybtn"
          type="button"
          onClick={onShowRenew}
          style={{ fontSize: 12, marginTop: 4, alignSelf: "flex-start" }}
        >
          Renew / Extend Contract
        </button>
      )}

      {showRenew && (
        <ContractRenewalForm
          renewDateStr={renewDateStr}
          renewNote={renewNote}
          onRenewDateChange={onRenewDateChange}
          onRenewNoteChange={onRenewNoteChange}
          onCancel={onCancelRenew}
          onConfirm={onConfirmRenew}
        />
      )}

      {record.contractRenewals && record.contractRenewals.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <FieldLabel text="Renewal History" />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {record.contractRenewals.map((renewal) => (
              <div
                key={renewal.id}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  background: "var(--wm-er-bg, #f9fafb)",
                  fontSize: 11,
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>
                  {fmtDate(renewal.previousEndDate)} to {fmtDate(renewal.newEndDate)}
                </div>

                <div style={{ color: "var(--wm-er-muted)", marginTop: 2 }}>{renewal.note}</div>

                <div style={{ color: "var(--wm-er-muted)", marginTop: 2, fontSize: 10 }}>
                  Renewed: {fmtDate(renewal.renewedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
