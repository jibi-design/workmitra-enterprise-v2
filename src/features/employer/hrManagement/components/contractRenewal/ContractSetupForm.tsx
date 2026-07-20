// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ContractSetupForm.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\contractRenewal\ContractSetupForm.tsx

import type { ContractType } from "../../types/hrManagement.types";
import { inputStyle } from "./contractRenewalStyles";
import { FieldLabel } from "./contractRenewalUi";

type Props = {
  contractType: ContractType;
  endDateStr: string;
  contractLabels: Record<ContractType, string>;
  onContractTypeChange: (value: ContractType) => void;
  onEndDateChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function ContractSetupForm({
  contractType,
  endDateStr,
  contractLabels,
  onContractTypeChange,
  onEndDateChange,
  onCancel,
  onSave,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <FieldLabel text="Contract Type *" />

        <div style={{ display: "flex", gap: 8 }}>
          {(["permanent", "fixed_term"] as ContractType[]).map((nextContractType) => (
            <button
              key={nextContractType}
              type="button"
              onClick={() => onContractTypeChange(nextContractType)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                border: `1.5px solid ${
                  contractType === nextContractType
                    ? "var(--wm-er-accent-hr)"
                    : "var(--wm-er-border, #e5e7eb)"
                }`,
                background: contractType === nextContractType ? "rgba(124, 58, 237,0.06)" : "#fff",
                color:
                  contractType === nextContractType
                    ? "var(--wm-er-accent-hr)"
                    : "var(--wm-er-muted)",
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {contractLabels[nextContractType]}
            </button>
          ))}
        </div>
      </div>

      {contractType === "fixed_term" && (
        <div>
          <FieldLabel text="Contract End Date *" />
          <input
            type="date"
            value={endDateStr}
            onChange={(event) => onEndDateChange(event.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        Note:{" "}
        {contractType === "permanent"
          ? "Permanent employees have no contract end date. You can change this later."
          : "Set the contract end date. You will receive reminders before it expires."}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            background: "#fff",
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
            color: "var(--wm-er-text)",
          }}
        >
          Cancel
        </button>

        <button
          className="wm-primarybtn"
          type="button"
          onClick={onSave}
          disabled={contractType === "fixed_term" && !endDateStr}
          style={{ flex: 1, fontSize: 12 }}
        >
          Save Contract
        </button>
      </div>
    </div>
  );
}
